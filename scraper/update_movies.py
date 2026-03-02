import json
import math
import os
import time
from collections import defaultdict

import firebase_admin
import requests
from dotenv import load_dotenv
from firebase_admin import credentials, firestore

from utils.logger import get_logger

# --- INITIALIZATION AND CONFIGURATION ---
load_dotenv()
logger = get_logger(__name__)

# TMDB API Configuration
BASE_URL = "https://api.themoviedb.org/3"
TMDB_BEARER_TOKEN = os.getenv("TMDB_BEARER_TOKEN")
HEADERS = {
    "accept": "application/json",
    "Authorization": f"Bearer {TMDB_BEARER_TOKEN}"
}

# Filtering Criteria
MIN_VOTE_COUNT = 10
MIN_RATING = 0.1

# Global Decades for Movie Collection
DECADES = [
    ("1980-01-01", "1989-12-31"),
    ("1990-01-01", "1999-12-31"),
    ("2000-01-01", "2009-12-31"),
    ("2010-01-01", "2019-12-31"),
    ("2020-01-01", "2029-12-31")
]


# --- FIREBASE SETUP ---

# MARK: initialize_firebase()
def initialize_firebase():
    """Initializes the Firebase Admin SDK and returns the Firestore client."""
    firebase_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    
    if firebase_json:
        # Parse JSON string into Python dict
        cred_dict = json.loads(firebase_json)
        cred = credentials.Certificate(cred_dict)
        logger.info("Firebase initialized via environment variable.")
    else:
        # Get the path to the current folder where this script is located (scraper/)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Form the full path to the config file
        cert_path = os.path.join(current_dir, "config", "serviceAccountKey.json")
        
        if not os.path.exists(cert_path):
            raise FileNotFoundError(f"Critical error: File not found at path {cert_path}")
            
        cred = credentials.Certificate(cert_path)
        logger.info(f"Firebase initialized via local file: {cert_path}")

    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    return firestore.client()

# Initialize Firebase globally for use in other functions
db = initialize_firebase()


# --- HELPERS: DATA CLEANING AND TRANSFORMATION ---

# MARK: is_valid_movie()
def is_valid_movie(m, min_votes=0):
    """Checks if the movie meets our quality criteria."""
    return bool(
        m.get("poster_path")
        and m.get("vote_average", 0) > 0
        and m.get("vote_count", 0) >= min_votes
    )


# MARK: format_movie_data()
def format_movie_data(m, genre_map):
    """Transforms TMDB API raw data into our internal dictionary format."""
    genre_names = [genre_map.get(gid, "Other") for gid in m.get("genre_ids", [])] if m.get("genre_ids") else ["Other"]
    return {
        "id": m["id"],
        "title": m["title"],
        "rating": m["vote_average"],
        "genres": genre_names,
        "poster_path": m.get("poster_path"),
        "release_date": m.get("release_date"),
        "popularity": m.get("popularity"),
        "vote_count": m.get("vote_count")
    }


# --- API DATA EXTRACTION ---

# MARK: fetch_genre_map()
def fetch_genre_map():
    """Fetches the genre map from the TMDB API."""
    url = f"{BASE_URL}/genre/movie/list?language=en"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        genres = response.json().get("genres", [])
        return {g["id"]: g["name"] for g in genres}
    else:
        logger.warning("Failed to fetch genres from API, using fallback.")
        return {}


# MARK: get_now_playing_movies()
def get_now_playing_movies(genre_map, pages=2):
    """Fetches movies currently in theaters (Now Playing)."""
    processed_movies = []
    
    logger.info(f"Loading and processing {pages} pages of 'Now Playing' movies...")
    for page in range(1, pages + 1):
        url = f"{BASE_URL}/movie/now_playing?language=en-US&page={page}"
        response = requests.get(url, headers=HEADERS)
        time.sleep(0.3)
        if response.status_code == 200:
            movies_on_page = response.json().get("results", [])
            for m in movies_on_page:
                if is_valid_movie(m):
                    processed_movies.append(format_movie_data(m, genre_map))
            
            logger.info(f"  [{page}/{pages}] Processed 'Now Playing' page")
        else:
            logger.warning(f"  Error on page {page} for 'Now Playing': status {response.status_code}")

    logger.info(f"Found {len(processed_movies)} 'Now Playing' records")
    return processed_movies


# MARK: get_movies_by_genres()
def get_movies_by_genres(genre_map):
    """
    Retrieves popular movies for each genre, stratified by decades 
    to ensure a diverse and historically rich dataset.
    """
    processed_movies = []
    
    logger.info(f"Starting collection by genres (stratified by {len(DECADES)} decades)...")

    genre_items = list(genre_map.items())
    total_genres = len(genre_items)

    for g_idx, (genre_id, genre_name) in enumerate(genre_items, 1):
        logger.info(f"[{g_idx}/{total_genres}] Processing genre: {genre_name}...")
        
        for start_date, end_date in DECADES:
            # Fetch up to 3 pages (60 movies) per decade for each genre
            for page in range(1, 4):
                url = (f"{BASE_URL}/discover/movie?language=en-US"
                       f"&sort_by=popularity.desc"
                       f"&with_genres={genre_id}"
                       f"&primary_release_date.gte={start_date}"
                       f"&primary_release_date.lte={end_date}"
                       f"&page={page}"
                       f"&vote_count.gte={MIN_VOTE_COUNT}")
                
                response = requests.get(url, headers=HEADERS)
                time.sleep(0.2) # Small delay to avoid API rate limiting
                
                if response.status_code != 200:
                    logger.warning(f"  [{g_idx}/{total_genres}] Error for {genre_name}, decade {start_date[:4]}, page {page}: status {response.status_code}")
                    break

                movies_on_page = response.json().get("results", [])
                if not movies_on_page:
                    break
                    
                for m in movies_on_page:
                    if is_valid_movie(m):
                        processed_movies.append(format_movie_data(m, genre_map))
                
                logger.info(f"  [{g_idx}/{total_genres}]   Decade {start_date[:4]} | Page {page} processed")

    return processed_movies


# --- DATA PROCESSING AND STATISTICS ---

# MARK: calculate_stats()
def calculate_stats(movies, top_count=10):
    """Calculates extended statistics by genre, including top N full movie objects."""
    stats = defaultdict(list)
    skipped_movies = []

    for m in movies:
        # Ignore movies without ratings
        if m.get("vote_count", 0) > 0 and m.get("rating", 0) > 0:
            for genre in m["genres"]:
                stats[genre].append(m)
        else:
            skipped_movies.append(m)

    # Log movies without ratings for control
    if skipped_movies:
        logger.warning(f"\n⚠️ Found {len(skipped_movies)} movies without rating (skipped for statistics):")
        for sm in skipped_movies:
            genres_str = ", ".join(sm["genres"])
            logger.warning(f" - {sm['title']} | Genres: [{genres_str}] | Rating: {sm.get('rating', 0)} (Votes: {sm.get('vote_count', 0)})")
        logger.warning("-" * 50)

    genre_extended_stats = []

    for genre, genre_movies in stats.items():
        if not genre_movies:
            continue

        movie_count = len(genre_movies)

        # Calculate averages
        avg_rating = sum(m["rating"] for m in genre_movies) / movie_count
        avg_popularity = sum(m.get("popularity", 0) for m in genre_movies) / movie_count
        total_votes = sum(m.get("vote_count", 0) for m in genre_movies)

        # Find Top-N representative movies for the genre.
        # We use a weighted score to favor movies with fewer genres (Genre Purity).
        # This makes posters on genre cards more unique and diverse.
        top_movies = sorted(
            genre_movies,
            key=lambda x: (x.get("popularity", 0) * x.get("rating", 0)) / len(x.get("genres", [1])),
            reverse=True
        )[:top_count]

        engagement_score = total_votes / movie_count if movie_count > 0 else 0

        genre_extended_stats.append({
            "genre_name": genre,
            "average_rating": round(avg_rating, 2),
            "average_popularity": round(avg_popularity, 2),
            "total_votes": total_votes,
            "movie_count": movie_count,
            "engagement_score": round(engagement_score, 2),
            "top_movies": top_movies
        })

    return genre_extended_stats


# MARK: _get_yearly_stats()
def _get_yearly_stats(movies):
    """Helper to calculate yearly best and most engaging years for global stats."""
    year_groups = defaultdict(lambda: {"total_rating": 0, "total_votes": 0, "count": 0})
    for m in movies:
        if m.get("release_date"):
            year = m["release_date"].split("-")[0]
            year_groups[year]["total_rating"] += (m.get("rating") or 0)
            year_groups[year]["total_votes"] += (m.get("vote_count") or 0)
            year_groups[year]["count"] += 1
    
    years = [
        {
            "year": year,
            "avg_rating": data["total_rating"] / data["count"],
            "engagement_score": data["total_votes"] / data["count"],
            "count": data["count"],
        }
        for year, data in year_groups.items()
        if data["count"] > 0
    ]
    
    # Top 5 Best Years (Quality) - min 15 movies for statistical significance
    top_best_years = sorted(
        [y for y in years if y["count"] >= 15],
        key=lambda x: x["avg_rating"],
        reverse=True
    )[:5]
    
    # Top 5 Most Engaging Years (Impact) - min 15 movies for statistical significance
    top_engaging_years = sorted(
        [y for y in years if y["count"] >= 15],
        key=lambda x: x["engagement_score"],
        reverse=True
    )[:5]
    
    return {
        "topBestYears": [{
            "year": y["year"],
            "avgRating": f"{y['avg_rating']:.2f}",
            "count": y["count"]
        } for y in top_best_years],
        "topEngagingYears": [{
            "year": y["year"],
            "engagementScore": round(y["engagement_score"]),
            "avgRating": f"{y['avg_rating']:.2f}"
        } for y in top_engaging_years]
    }


# MARK: _get_genre_diversity()
def _get_genre_diversity(movies):
    """Helper to calculate genre combinations and averages for global stats."""
    total_genres_count = sum(len(m.get("genres", [])) for m in movies)
    pair_counts = defaultdict(int)
    for m in movies:
        genres = m.get("genres", [])
        if len(genres) > 1:
            sorted_genres = sorted(genres)
            for i in range(len(sorted_genres)):
                for j in range(i + 1, len(sorted_genres)):
                    pair = f"{sorted_genres[i]} + {sorted_genres[j]}"
                    pair_counts[pair] += 1
    
    top_tandems = sorted(
        [{"pair": pair, "count": count} for pair, count in pair_counts.items()],
        key=lambda x: x["count"],
        reverse=True
    )[:5]
    
    return {
        "avgGenresPerMovie": f"{(total_genres_count / len(movies)):.1f}" if movies else "0.0",
        "topTandems": top_tandems
    }


# MARK: _get_hidden_gems()
def _get_hidden_gems(movies):
    """Helper to find high-rated but less popular movies for global stats."""
    hidden_gems = [
        m for m in movies 
        if (m.get("rating") or 0) >= 7.8 and 
           (m.get("popularity") or 0) < 25 and 
           200 <= (m.get("vote_count") or 0) < 1500 and
           "Documentary" not in m.get("genres", []) and
           "Animation" not in m.get("genres", []) and
           "TV Movie" not in m.get("genres", []) and
           m.get("release_date") and int(m["release_date"].split("-")[0]) >= 2000
    ]
    return sorted(hidden_gems, key=lambda x: x["rating"], reverse=True)[:15]


# MARK: calculate_global_stats()
def calculate_global_stats(movies):
    """Calculates yearly trends, genre diversity and hidden gems."""
    return {
        "yearly_stats": _get_yearly_stats(movies),
        "genre_diversity": _get_genre_diversity(movies),
        "hidden_gems": _get_hidden_gems(movies),
        "updated_at": firestore.SERVER_TIMESTAMP
    }


# --- CLOUD STORAGE OPERATIONS (FIRESTORE) ---

# MARK: upload_to_firebase()
def upload_to_firebase(movies, stats, global_stats):
    """Writes processed data to Firestore using batches and removes obsolete records."""
    
    # 1. Collect new movie IDs for fast lookup
    new_movie_ids = {str(movie["id"]) for movie in movies}

    # --- 1. Upload movies in batches ---
    logger.info(f"Uploading {len(movies)} movies to Firestore in batches...")
    batch_size = 500
    for i in range(0, len(movies), batch_size):
        batch = db.batch()
        chunk = movies[i : i + batch_size]

        for movie in chunk:
            movie_ref = db.collection("movies").document(str(movie["id"]))
            batch.set(movie_ref, movie)

        batch.commit()
        logger.info(f"  Batch {i // batch_size + 1} (movies) uploaded")

    # --- 2. Update stats ---
    logger.info("Updating genre and global statistics...")
    batch = db.batch()
    for s in stats:
        genre_ref = db.collection("genres").document(s["genre_name"].lower())
        batch.set(genre_ref, s)
    batch.commit()
    db.collection("stats").document("global").set(global_stats)

    # --- 3. Cleaning obsolete movies ---
    logger.info("Checking for obsolete movies...")
    
    # Get all existing document IDs in the collection
    # Use select([]), to avoid fetching full document data (saves bandwidth)
    existing_docs = db.collection("movies").select([]).stream()
    existing_ids = {doc.id for doc in existing_docs}

    # Find the difference: what is in the database but not in the new list
    ids_to_delete = list(existing_ids - new_movie_ids)

    if ids_to_delete:
        logger.info(f"Found {len(ids_to_delete)} obsolete movies. Deleting...")
        for i in range(0, len(ids_to_delete), batch_size):
            batch = db.batch()
            chunk_to_delete = ids_to_delete[i : i + batch_size]
            
            for doc_id in chunk_to_delete:
                doc_ref = db.collection("movies").document(doc_id)
                batch.delete(doc_ref)
                
            batch.commit()
            logger.info(f"  Deleted batch of {len(chunk_to_delete)} old movies")
    else:
        logger.info("No obsolete movies to remove")

    logger.info("Data synchronization complete")


# MARK: clear_firestore()
def clear_firestore():
    """Deletes all documents from the primary collections."""
    collections = ["movies", "genres", "stats"]
    for col in collections:
        db.recursive_delete(db.collection(col))
        logger.info(f"Deleted all documents from collection '{col}'")


# --- MAIN EXECUTION ---

if __name__ == "__main__":
    # 1. Extraction
    logger.info("Loading genres...")
    genre_map = fetch_genre_map()
    logger.info(f"Received {len(genre_map)} genres")

    # Fetch different sets of movies independently
    now_playing = get_now_playing_movies(genre_map, pages=2)
    genres_data = get_movies_by_genres(genre_map)
    
    # Merge and remove duplicates using movie ID as key
    all_raw = now_playing + genres_data
    unique_map = {m["id"]: m for m in all_raw}
    raw_data = list(unique_map.values())
    
    logger.info(f"Final collection size: {len(raw_data)} unique movies.")

    # 2. Processing
    genre_stats = calculate_stats(raw_data)
    global_stats = calculate_global_stats(raw_data)
    logger.info(f"Calculated statistics for {len(genre_stats)} genres and global trends.")

    # 3. Cloud Synchronization
    upload_to_firebase(raw_data, genre_stats, global_stats)
