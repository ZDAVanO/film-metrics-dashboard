import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, Calendar, Users, Clapperboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

interface MovieCardProps {
    movie: {
        id: number | string;
        title: string;
        rating: number;
        genres: string[];
        poster_path: string | null;
        release_date?: string;
        popularity?: number;
        vote_count?: number;
    };
}

export function MovieCard({ movie }: MovieCardProps) {
    const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";

    return (
        <Card className="group relative overflow-hidden border border-border bg-background/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 hover:border-primary/50 p-0 gap-0 flex flex-col h-full">
            {/* Poster Section (Link to Movie) */}
            <Link href={`/movies/${movie.id}`} className="relative aspect-[2/3] overflow-hidden shrink-0 bg-muted/20 flex items-center justify-center">
                {movie.poster_path ? (
                    <Image
                        src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 45vw, (max-width: 1080px) 220px, 200px"
                        unoptimized
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                        <Clapperboard className="w-12 h-12" />
                        <span className="text-[10px] font-bold uppercase tracking-widest px-4 text-center">No Poster Available</span>
                    </div>
                )}

                {/* Rating Badge Overlay */}
                <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-yellow-400 gap-1 px-2 py-1 font-bold">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        {movie.rating ? movie.rating.toFixed(1) : "N/A"}
                    </Badge>
                </div>

                {/* Bottom Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Popularity/Vote Count & Date Indicators */}
                <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between text-[10px] sm:text-xs text-white/70">
                    {movie.vote_count && movie.vote_count > 0 ? (
                        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
                            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>{movie.vote_count.toLocaleString()}</span>
                        </div>
                    ) : <div />}
                    {movie.release_date && (
                        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
                            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>{movie.release_date}</span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Content Area (Wrapper for Title and Genres) */}
            <div className="p-3 relative bg-card/60 backdrop-blur-md border-t border-white/5 flex-grow flex flex-col gap-2">
                {/* Title (Link to Movie) */}
                <Link href={`/movies/${movie.id}`}>
                    <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                        {movie.title}
                    </h3>
                </Link>

                {/* Genres (Individual Links) */}
                <div className="flex flex-wrap gap-1 opacity-80">
                    {movie.genres?.map((genre) => (
                        <Link
                            key={genre}
                            href={`/browser?includeGenres=${encodeURIComponent(genre)}`}
                            className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-sm whitespace-nowrap hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer relative z-30"
                        >
                            {genre}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Hover Action Button (Overlay) - Optional visual cue */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <div className="bg-primary text-primary-foreground text-xs font-bold py-2 px-4 rounded-full shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    View Details
                </div>
            </div>
        </Card>
    );
}
