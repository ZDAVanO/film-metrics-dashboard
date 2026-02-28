import { db } from '@/lib/firebase';
import { unstable_cache } from 'next/cache';


export interface Genre {
    id: string;
    genre_name: string;
    average_rating: number;
    movie_count: number;
    engagement_score?: number;
    [key: string]: any;
}

export const getTopGenres = unstable_cache(
    async (limit: number = 4): Promise<Genre[]> => {
        try {
            const snapshot = await db.collection('genres')
                .orderBy('average_rating', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Genre[];
        } catch (error) {
            console.error("Error fetching top genres:", error);
            return [];
        }
    },
    ['top-genres'],
    { revalidate: 3600, tags: ['genres'] }
);

export const getAllGenres = unstable_cache(
    async (): Promise<Genre[]> => {
        try {
            const snapshot = await db.collection('genres')
                .orderBy('average_rating', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Genre[];
        } catch (error) {
            console.error("Error fetching all genres:", error);
            return [];
        }
    },
    ['all-genres'],
    { revalidate: 3600, tags: ['genres'] }
);

export const getGlobalStats = async () => {
    const genres = await getAllGenres();
    
    if (genres.length === 0) return null;

    const totalMovies = genres.reduce((acc, g) => acc + g.movie_count, 0);
    const totalVotes = genres.reduce((acc, g) => acc + (g.total_votes || 0), 0);
    const avgRating = genres.reduce((acc, g) => acc + (g.average_rating * g.movie_count), 0) / totalMovies;
    
    const highestRatedGenre = [...genres].sort((a, b) => b.average_rating - a.average_rating)[0];
    const mostPopularGenre = [...genres].sort((a, b) => b.average_popularity - a.average_popularity)[0];
    const largestGenre = [...genres].sort((a, b) => b.movie_count - a.movie_count)[0];
    const mostEngagedGenre = [...genres].sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0))[0];

    return {
        avgRating: avgRating.toFixed(2),
        highestRatedGenre,
        mostPopularGenre,
        largestGenre,
        mostEngagedGenre,
        totalGenres: genres.length,
        totalMovies,
        totalVotes
    };
};
