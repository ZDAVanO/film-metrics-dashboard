import { MovieCard } from '@/components/movie-card';
import { Pagination } from '@/components/pagination';
import { MovieFilters } from '@/components/movie-filters';
import { getMovies, Movie } from '@/lib/movies';
import { getAllGenres } from '@/lib/genres';

export default async function BrowserPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string;
        afterVal?: string;
        afterId?: string;
        beforeVal?: string;
        beforeId?: string;
        sortBy?: string;
        sortOrder?: string;
        genre?: string;
        includeGenres?: string;
        excludeGenres?: string;
        minYear?: string;
        maxYear?: string;
    }>;
}) {
    const params = await searchParams;
    const sortBy = params.sortBy || 'popularity';
    const sortOrder = (params.sortOrder || 'desc') as 'asc' | 'desc';
    const currentPage = parseInt(params.page || '1');
    const genre = params.genre;
    const includeGenres = params.includeGenres ? params.includeGenres.split(',') : [];
    const excludeGenres = params.excludeGenres ? params.excludeGenres.split(',') : [];
    const minYear = params.minYear ? parseInt(params.minYear) : undefined;
    const maxYear = params.maxYear ? parseInt(params.maxYear) : undefined;
    const limit = 40;

    const allGenres = await getAllGenres();

    const { movies, totalCount, totalPages } = await getMovies({
        page: currentPage,
        limit,
        sortBy,
        sortOrder,
        genre,
        includeGenres,
        excludeGenres,
        minYear,
        maxYear
    });

    return (
        <div className="flex flex-col min-h-screen">
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">
                {/* Header Information */}
                <div className="py-6 border-b border-border/40 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-muted-foreground font-medium">
                        <span className="text-foreground font-bold">{totalCount.toLocaleString()}</span> movies
                    </p>
                    <MovieFilters genres={allGenres} />
                </div>

                {movies.length === 0 ? (
                    <div className="py-20 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">No movies found in the database.</p>
                    </div>
                ) : (
                    <div className="space-y-8 pb-12">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-6">
                            {movies.map((movie: Movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
