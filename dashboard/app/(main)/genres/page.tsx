import { GenreCard } from "@/components/genre-card";
import { getAllGenres, Genre } from "@/lib/genres";

export default async function GenresPage() {
    const genresData = await getAllGenres();

    return (
        <div className="flex flex-col min-h-screen py-8 sm:py-12">
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">
                <div className="flex flex-col gap-2 mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl uppercase">
                        All Genres
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Browse our collection of films by category, featuring the highest-rated titles.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {genresData.map((genre: Genre) => (
                        <GenreCard key={genre.id} genre={genre} />
                    ))}
                </div>
            </div>
        </div>
    );
}
