"use server"

import { db } from '@/lib/firebase';
import { unstable_cache } from 'next/cache';


export interface Movie {
    id: string;
    title: string;
    rating: number;
    genres: string[];
    poster_path: string | null;
    release_date?: string;
    popularity: number;
    vote_count?: number;
    backdrop_path?: string | null;
    overview?: string;
    runtime?: number;
    tagline?: string;
    [key: string]: any;
}

export interface GetMoviesResponse {
    movies: Movie[];
    totalCount: number;
    totalPages: number;
}

export interface MovieSearchParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    genre?: string;
    includeGenres?: string[];
    excludeGenres?: string[];
    minYear?: number;
    maxYear?: number;
    cursor?: { type: 'after' | 'before', val: string | number, id: string };
}

// Internal helper to fetch all movies for in-memory processing
const getAllMovies = unstable_cache(
    async () => {
        try {
            const snapshot = await db.collection('movies').get();
            return snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id // Ensure Firestore string ID is used and not overwritten
            })) as Movie[];
        } catch (error) {
            console.error("Error fetching all movies from Firestore:", error);
            return [];
        }
    },
    ['all-movies-data'],
    { revalidate: 43200, tags: ['movies'] }
);

export const getMovies = async (params: MovieSearchParams): Promise<GetMoviesResponse> => {
    const { 
        page = 1, 
        limit = 40, 
        sortBy = 'popularity', 
        sortOrder = 'desc', 
        genre,
        includeGenres = [],
        excludeGenres = [],
        minYear,
        maxYear,
        cursor 
    } = params;

    try {
        let movies = await getAllMovies();

        // 1. Filtering
        if (genre && genre !== 'all') {
            movies = movies.filter(m => m.genres?.includes(genre));
        }
        
        if (includeGenres.length > 0) {
            movies = movies.filter(m => 
                includeGenres.every(g => m.genres?.includes(g))
            );
        }

        if (excludeGenres.length > 0) {
            movies = movies.filter(m => 
                !m.genres?.some(g => excludeGenres.includes(g))
            );
        }

        if (minYear) {
            movies = movies.filter(m => m.release_date && m.release_date >= `${minYear}-01-01`);
        }

        if (maxYear) {
            movies = movies.filter(m => m.release_date && m.release_date <= `${maxYear}-12-31`);
        }

        const totalCount = movies.length;

        // 2. Sorting
        movies.sort((a, b) => {
            const valA = a[sortBy];
            const valB = b[sortBy];

            // Handle strings (like release_date)
            if (typeof valA === 'string' && typeof valB === 'string') {
                const cmp = valA.localeCompare(valB);
                if (cmp !== 0) return sortOrder === 'asc' ? cmp : -cmp;
            } else {
                // Handle numbers (popularity, rating, etc.)
                const numA = Number(valA) || 0;
                const numB = Number(valB) || 0;
                
                if (numA !== numB) {
                    return sortOrder === 'asc' ? numA - numB : numB - numA;
                }
            }

            // Secondary sort by ID for stability (ensuring it's a string)
            return String(a.id).localeCompare(String(b.id));
        });

        // 3. Pagination (supporting both offset and cursors)
        let startIndex = (page - 1) * limit;

        if (cursor) {
            const cursorIndex = movies.findIndex(m => m.id === cursor.id);
            if (cursorIndex !== -1) {
                startIndex = cursor.type === 'after' ? cursorIndex + 1 : Math.max(0, cursorIndex - limit);
            }
        }

        const paginatedMovies = movies.slice(startIndex, startIndex + limit);

        return {
            movies: paginatedMovies,
            totalCount,
            totalPages: Math.ceil(totalCount / limit)
        };
    } catch (error) {
        console.error("Error processing movies in-memory:", error);
        return { movies: [], totalCount: 0, totalPages: 0 };
    }
};

export const getMovieCount = unstable_cache(
    async (): Promise<number> => {
        try {
            const snapshot = await db.collection('movies').count().get();
            return snapshot.data().count;
        } catch (error) {
            console.error("Error fetching movie count:", error);
            return 0;
        }
    },
    ['movie-count'],
    { revalidate: 3600, tags: ['movies'] }
);

export async function getMovie(id: string) {
    try {
        const url = `https://api.themoviedb.org/3/movie/${id}?language=en-US`;
        const token = process.env.TMDB_TOKEN;

        if (!token) {
            console.error("TMDB_TOKEN is not defined in environment variables");
            return null;
        }

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${token}`
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        };

        const res = await fetch(url, options);
        if (!res.ok) return null;

        const data = await res.json();

        // Map TMDB structure to our UI structure
        return {
            ...data,
            rating: data.vote_average,
            genres: data.genres?.map((g: any) => g.name) || []
        };
    } catch (error) {
        console.error("Error fetching movie from TMDB:", error);
        return null;
    }
}

export async function searchMovies(query: string) {
    if (!query || query.length < 2) return [];

    try {
        const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
        const token = process.env.TMDB_TOKEN;

        if (!token) {
            console.error("TMDB_TOKEN is not defined in environment variables");
            return [];
        }

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${token}`
            },
            next: { revalidate: 600 } // Cache results for 10 minutes
        };

        const res = await fetch(url, options);
        if (!res.ok) return [];

        const data = await res.json();
        // Return top 6 results
        return (data.results || []).slice(0, 6).map((movie: any) => ({
            id: movie.id.toString(),
            title: movie.title,
            rating: movie.vote_average,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            popularity: movie.popularity
        }));
    } catch (error) {
        console.error("Error searching movies from TMDB:", error);
        return [];
    }
}

