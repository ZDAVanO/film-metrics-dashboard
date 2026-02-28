import Link from "next/link";
import { FadeInImage } from "@/components/fade-in-image";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

interface GenreCardProps {
    genre: {
        id: string;
        genre_name: string;
        average_rating: number;
        movie_count: number;
        engagement_score?: number;
        top_movies?: {
            id: string | number;
            title?: string;
            poster_path?: string;
        }[];
    };
}

export function GenreCard({ genre }: GenreCardProps) {
    const topMoviesWithPosters = genre.top_movies?.filter((m) => m.poster_path) || [];
    const displayMovies = topMoviesWithPosters.slice(0, 6);
    const emptySlots = Math.max(0, 6 - displayMovies.length);

    return (
        <div className="group relative">
            {/* Colorful Glow Layer (Blurred duplicate of posters) */}
            <div className="absolute -inset-0.5 z-0 opacity-0 group-hover:opacity-50 blur-2xl transition-all duration-700 scale-110 pointer-events-none">
                <div className="grid grid-cols-3 grid-rows-2 gap-0 w-full h-full">
                    {displayMovies.map((movie, i) => (
                        <div key={`glow-${movie.id || i}`} className="relative w-full h-full">
                            <FadeInImage
                                src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                                alt=""
                                fill
                                sizes="100px"
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <Link
                href={`/browser?includeGenres=${encodeURIComponent(genre.genre_name)}`}
                className="relative z-10 block overflow-hidden rounded-2xl border-2 border-border/60 bg-muted/30 aspect-[4/3] transition-all hover:border-primary/60"
            >
                {/* Background Poster Grid from real data */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 p-2 opacity-40 grayscale transition-all group-hover:opacity-60 group-hover:grayscale-0 group-hover:scale-110 duration-500">
                    {displayMovies.map((movie, i) => (
                        <div key={movie.id || i} className="bg-muted-foreground/10 rounded-md overflow-hidden relative aspect-[2/3]">
                            <FadeInImage
                                src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                                alt={movie.title || "Movie poster"}
                                fill
                                sizes="(max-width: 768px) 33vw, 150px"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                        </div>
                    ))}

                    {/* Filling empty spots if less than 6 posters */}
                    {emptySlots > 0 && Array.from({ length: emptySlots }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-muted-foreground/5 rounded-md aspect-[2/3] relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-muted/20" />
                        </div>
                    ))}
                </div>

                {/* Content Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent flex flex-col justify-end p-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 min-w-0">
                            <h2 className="text-2xl font-bold uppercase tracking-tight transition-transform group-hover:translate-x-1 truncate min-w-0" title={genre.genre_name}>
                                {genre.id === "science fiction" ? "Sci-Fi" : genre.genre_name}
                            </h2>
                            <span className="shrink-0 text-xs font-black bg-primary text-primary-foreground px-2 py-1 rounded-md shadow-lg">
                                {genre.average_rating}
                            </span>
                        </div>
                        <div className="flex items-start gap-6 text-[11px] text-muted-foreground font-bold uppercase tracking-[0.15em] transition-colors group-hover:text-foreground">
                            {genre.engagement_score && (
                                <div className="flex flex-col gap-0.5">
                                    <span>{genre.engagement_score.toLocaleString()} Engagement</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="h-1 w-0 bg-primary transition-all duration-300 group-hover:w-16 mt-3" />
                </div>
            </Link>
        </div>
    );
}
