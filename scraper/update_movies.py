import math
import os
import json
import time
from collections import defaultdict

from dotenv import load_dotenv
load_dotenv()

import requests
import firebase_admin
from firebase_admin import credentials, firestore

from utils.logger import get_logger


logger = get_logger(__name__)



# --- CONFIGURATION AND INITIALIZATION ---

BASE_URL = "https://api.themoviedb.org/3"
TMDB_BEARER_TOKEN = os.getenv("TMDB_BEARER_TOKEN")
HEADERS = {
    "accept": "application/json",
    "Authorization": f"Bearer {TMDB_BEARER_TOKEN}"
}

# --- FILTERING CRITERIA ---
# Minimum number of votes to consider a movie "well-reviewed"
MIN_VOTE_COUNT = 10
# Minimum rating to consider
MIN_RATING = 0.1

# Connect to Firebase
def initialize_firebase():
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

db = initialize_firebase()



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



# --- HELPERS: DATA CLEANING ---

def is_valid_movie(m, min_votes=0):
    """Checks if the movie meets our quality criteria."""
    if not m.get("poster_path"):
        return False
    if not m.get("vote_average") or m.get("vote_average") == 0:
        return False
    if m.get("vote_count", 0) < min_votes:
        return False
    return True


def format_movie_data(m, genre_map):
    """Transforms API raw data into our internal dictionary format."""
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



# --- LAB 1: DATA EXTRACTION ---

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
def get_movies_by_genres(genre_map, target_per_genre=100):
    """
    Retrieves popular movies for each genre from the map.
    """
    processed_movies = []
    
    logger.info(f"Starting collection by genres (target: ~{target_per_genre} movies for each of {len(genre_map)} genres)...")
    
    max_pages_to_search = math.ceil(target_per_genre / 20)

    for genre_id, genre_name in genre_map.items():
        logger.info(f"Processing genre: {genre_name}...")
        
        for page in range(1, max_pages_to_search + 1):
            url = f"{BASE_URL}/discover/movie?language=en-US&sort_by=popularity.desc&with_genres={genre_id}&page={page}&vote_count.gte={MIN_VOTE_COUNT}"
            response = requests.get(url, headers=HEADERS)
            time.sleep(0.3)
            
            if response.status_code != 200:
                logger.warning(f"  Error for genre {genre_name}, page {page}: status {response.status_code}")
                break

            movies_on_page = response.json().get("results", [])
            if not movies_on_page:
                break
                
            for m in movies_on_page:
                if is_valid_movie(m):
                    processed_movies.append(format_movie_data(m, genre_map))

    return processed_movies



# --- LAB 2: PROCESSING ---

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

        # Find Top-N movies by rating for the genre
        top_movies = sorted(genre_movies, key=lambda x: x["rating"], reverse=True)[:top_count]

        genre_extended_stats.append({
            "genre_name": genre,
            "average_rating": round(avg_rating, 2),
            "average_popularity": round(avg_popularity, 2),
            "total_votes": total_votes,
            "movie_count": movie_count,
            "top_movies": top_movies
        })

    return genre_extended_stats



# --- LAB 3: CLOUD STORAGE ---

# MARK: upload_to_firebase()
def upload_to_firebase(movies, stats):
    """Writes data to Firestore using batches for better performance."""
    
    # --- 1. Loading movies in batches ---
    logger.info(f"Uploading {len(movies)} movies to Firestore in batches...")

    batch_size = 500
    for i in range(0, len(movies), batch_size):
        batch = db.batch()
        chunk = movies[i : i + batch_size]

        for movie in chunk:
            movie_ref = db.collection("movies").document(str(movie["id"]))
            batch.set(movie_ref, movie)

        batch.commit()
        logger.info(f"  Batch {i // batch_size + 1} (movies) completed")

    # --- 2. Updating genre statistics ---
    logger.info("Updating genre statistics...")
    batch = db.batch()
    for s in stats:
        genre_ref = db.collection("genres").document(s["genre_name"].lower())
        batch.set(genre_ref, s)
    
    batch.commit()

    logger.info("All data successfully synchronized with the cloud using batches!")



# MARK: clear_firestore()
def clear_firestore():
    """Deletes all documents from the 'movies' and 'genres' collections."""
    collections = ["movies", "genres"]
    for col in collections:
        db.recursive_delete(db.collection(col))
        print(f"Deleted all documents from collection '{col}'")



# MARK: main
if __name__ == "__main__":

    # 1. Extraction
    logger.info("Loading genres...")
    genre_map = fetch_genre_map()
    logger.info(f"Received {len(genre_map)} genres")

    # Fetch different sets of movies independently
    now_playing = get_now_playing_movies(genre_map, pages=2)
    genres_data = get_movies_by_genres(genre_map, target_per_genre=150)
    
    # Merge and remove duplicates using movie ID as key
    all_raw = now_playing + genres_data
    unique_map = {m["id"]: m for m in all_raw}
    raw_data = list(unique_map.values())
    
    logger.info(f"Final collection size: {len(raw_data)} unique movies.")

    # 2. Processing
    genre_stats = calculate_stats(raw_data)
    logger.info(f"Calculated statistics for {len(genre_stats)} genres.")

    # 3. Cloud
    upload_to_firebase(raw_data, genre_stats)

    # --- CLEAR FIRESTORE ---
    # clear_firestore()

