import { GenreCard } from '@/components/genre-card';
import Link from 'next/link';
import { ArrowRight, Film, Star, TrendingUp, Layers, Hash } from 'lucide-react';
import { getMovieCount } from '@/lib/movies';
import { getTopGenres, getGlobalStats } from '@/lib/genres';

export default async function Home() {
  const genres = await getTopGenres(4);
  const totalMovies = await getMovieCount();
  const stats = await getGlobalStats();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 pb-14">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase italic">
              Absolute <span className="text-primary not-italic">Cinema</span> Analytics
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              Explore deep metrics, ratings, and trends across our vast film database.
              Comprehensive data for every cinema enthusiast.
            </p>

            {/* Main Stat Card */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="inline-flex items-center gap-4 bg-muted/30 backdrop-blur-md border border-border/60 p-2 pl-6 rounded-full shadow-2xl hover:bg-muted/40 transition-colors group cursor-default">
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Database</span>
                  <span className="text-2xl font-black text-primary tabular-nums group-hover:scale-105 transition-transform duration-500">
                    {totalMovies.toLocaleString()} <span className="text-sm text-foreground/70 ml-1">FILMS</span>
                  </span>
                </div>
                <div className="size-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
                  <Film className="size-6" />
                </div>
              </div>

              {stats && (
                <div className="inline-flex items-center gap-4 bg-muted/30 backdrop-blur-md border border-border/60 p-2 pl-6 rounded-full shadow-2xl hover:bg-muted/40 transition-colors group cursor-default">
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Engagement</span>
                    <span className="text-2xl font-black text-blue-500 tabular-nums group-hover:scale-105 transition-transform duration-500">
                      {(stats.totalVotes / 1000000).toFixed(1)}M <span className="text-sm text-foreground/70 ml-1">VOTES</span>
                    </span>
                  </div>
                  <div className="size-14 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/5 group-hover:rotate-12 transition-transform duration-500">
                    <Star className="size-6 fill-blue-500/20" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 size-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 size-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* Global Stats Section */}
      {stats && (
        <section className="py-10 max-w-6xl mx-auto w-full px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/40 border border-border/60 p-6 rounded-2xl flex flex-col gap-2 hover:bg-muted/60 transition-colors group">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Star className="size-5 fill-primary/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Avg Rating</span>
                <span className="text-2xl font-black">{stats.avgRating}</span>
              </div>
            </div>

            <div className="bg-muted/40 border border-border/60 p-6 rounded-2xl flex flex-col gap-2 hover:bg-muted/60 transition-colors group">
              <div className="size-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <TrendingUp className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Trending Genre</span>
                <span className="text-2xl font-black capitalize truncate">{stats.mostPopularGenre.genre_name}</span>
              </div>
            </div>

            <div className="bg-muted/40 border border-border/60 p-6 rounded-2xl flex flex-col gap-2 hover:bg-muted/60 transition-colors group">
              <div className="size-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                <Layers className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Largest Genre</span>
                <span className="text-2xl font-black capitalize truncate">{stats.largestGenre.genre_name}</span>
              </div>
            </div>

            <div className="bg-muted/40 border border-border/60 p-6 rounded-2xl flex flex-col gap-2 hover:bg-muted/60 transition-colors group">
              <div className="size-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Hash className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Categories</span>
                <span className="text-2xl font-black">{stats.totalGenres}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Genres */}
      <section className="py-14 bg-muted/5 border-y border-border/40">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-10 bg-primary rounded-full" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">Featured</span>
              </div>
              <h2 className="text-3xl font-bold uppercase tracking-tight">Top Rated Categories</h2>
              <p className="text-muted-foreground font-medium">Highest quality genres according to average ratings.</p>
            </div>
            <Link
              href="/genres"
              className="group flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-all bg-primary/5 px-6 py-3 rounded-full border border-primary/10 hover:border-primary/20 shadow-sm"
            >
              View All Genres <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {genres.map((genre) => (
              <GenreCard key={genre.id} genre={genre} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}