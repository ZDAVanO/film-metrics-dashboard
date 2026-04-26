import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Users, Clock, Languages, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeInImage } from "@/components/fade-in-image";
import { Separator } from "@/components/ui/separator";
import { getMovie } from "@/lib/movies";


const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/original";
const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w500";



export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const movie = await getMovie(id);

    if (!movie) return { title: "Movie Not Found" };

    return {
        title: `${movie.title} (${movie.release_date?.split("-")[0]}) - Film Metrics`,
        description: movie.overview,
        openGraph: {
            title: movie.title,
            description: movie.overview,
            images: [`${TMDB_IMAGE_BASE}${movie.backdrop_path}`],
        }
    };
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const movie = await getMovie(id);

    if (!movie) {
        notFound();
    }

    const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";

    return (
        <main className="min-h-screen pb-20 bg-background text-foreground animate-in fade-in duration-700">
            {/* Hero Section with Backdrop */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {movie.backdrop_path ? (
                        <Image
                            src={`${TMDB_IMAGE_BASE}${movie.backdrop_path}`}
                            alt={movie.title}
                            fill
                            className="object-cover opacity-30 blur-[2px]"
                            priority
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full bg-muted" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                </div>

                {/* Back Button & Title Overlay */}
                <div className="absolute inset-0 z-10 flex flex-col justify-end">
                    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12">
                        <Link
                            href="/"
                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6 group"
                        >
                            <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span>
                            Back to Home
                        </Link>

                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
                            {/* Poster in Hero */}
                            <div className="relative w-48 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group shrink-0">
                                {movie.poster_path ? (
                                    <FadeInImage
                                        src={`${TMDB_POSTER_BASE}${movie.poster_path}`}
                                        alt={movie.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                        No Poster
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                {movie.tagline && (
                                    <p className="text-primary italic font-medium mb-2 tracking-wide text-lg">
                                        {movie.tagline}
                                    </p>
                                )}
                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                                    {movie.title} <span className="text-muted-foreground font-light text-2xl md:text-4xl ml-2">({year})</span>
                                </h1>

                                <div className="flex flex-wrap gap-3 items-center">
                                    <div className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-400/20">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-bold">{movie.vote_average?.toFixed(1)}</span>
                                        <span className="text-xs opacity-70 ml-1">/ {movie.vote_count} votes</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-4 bg-white/20 hidden md:block" />
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>{movie.runtime} min</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-4 bg-white/20 hidden md:block" />
                                    <div className="flex flex-wrap gap-2">
                                        {movie.genres?.map((genre: string) => (
                                            <Badge key={genre} variant="secondary" className="bg-white/5 hover:bg-white/10 border-white/10 text-foreground transition-colors">
                                                {genre}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Overview
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {movie.overview || "No overview available for this movie."}
                            </p>
                        </section>

                        {movie.production_companies?.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Production Companies
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                    {movie.production_companies.map((company: any) => (
                                        <div key={company.id} className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300">
                                            {company.logo_path ? (
                                                <div className="relative w-full aspect-square mb-2 bg-white/90 p-3 rounded-lg flex items-center justify-center">
                                                    <Image
                                                        src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                                                        alt={company.name}
                                                        width={120}
                                                        height={120}
                                                        className="object-contain filter grayscale group-hover:grayscale-0 transition-all"
                                                        unoptimized
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-full aspect-square mb-2 bg-muted rounded-lg flex items-center justify-center text-center p-2 text-xs font-medium">
                                                    {company.name}
                                                </div>
                                            )}
                                            <span className="text-xs text-center font-medium opacity-70 group-hover:opacity-100 transition-opacity mt-2">
                                                {company.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Details */}
                    <div className="space-y-8">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-sm">
                            <h3 className="text-lg font-semibold mb-6 border-b border-white/10 pb-4">Movie Details</h3>

                            <div className="space-y-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Status
                                    </span>
                                    <span className="font-medium text-primary uppercase tracking-wider text-sm">{movie.status}</span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground">Original Language</span>
                                    <span className="font-medium flex items-center gap-2">
                                        <Languages className="w-4 h-4 opacity-50" />
                                        {movie.spoken_languages?.[0]?.english_name || movie.original_language?.toUpperCase()}
                                    </span>
                                </div>

                                {movie.budget > 0 && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm text-muted-foreground">Budget</span>
                                        <span className="font-medium text-emerald-400">
                                            ${movie.budget.toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                {movie.revenue > 0 && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm text-muted-foreground">Revenue</span>
                                        <span className="font-medium text-emerald-400">
                                            ${movie.revenue.toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                {movie.production_countries?.length > 0 && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm text-muted-foreground">Production Country</span>
                                        <span className="font-medium">
                                            {movie.production_countries.map((c: any) => c.name).join(", ")}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {movie.homepage && (
                                <Link
                                    href={movie.homepage}
                                    target="_blank"
                                    className="mt-8 w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg active:scale-95"
                                >
                                    Visit Official Site
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
