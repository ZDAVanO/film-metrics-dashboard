import { GenreCard } from '@/components/genre-card';
import { MovieCard } from '@/components/movie-card';
import Link from 'next/link';
import { ArrowRight, Film, Star, TrendingUp, Layers, Activity, Gem, Dna, Swords } from 'lucide-react';
import { getMovieCount, getHiddenGems, getYearlyStats, getGenreDiversityStats, getGlobalUpdatedAt } from '@/lib/movies';
import { getTopGenres, getGlobalStats } from '@/lib/genres';
import { Card } from '@/components/ui/card';

export default async function Home() {
  const genres = await getTopGenres(8);
  const totalMovies = await getMovieCount();
  const stats = await getGlobalStats();
  const yearlyStats = await getYearlyStats();
  const diversityStats = await getGenreDiversityStats();
  const hiddenGems = await getHiddenGems(15);
  const updatedAt = await getGlobalUpdatedAt();

  // Robust helper for parsing Firestore Timestamp (handling serialization)
  const parseTimestamp = (ts: any) => {
    if (!ts) return null;
    if (typeof ts.toDate === 'function') return ts.toDate();
    if (ts._seconds) return new Date(ts._seconds * 1000);
    if (ts.seconds) return new Date(ts.seconds * 1000);
    if (typeof ts === 'number') return new Date(ts);
    if (typeof ts === 'string') return new Date(ts);
    return null;
  };

  const dateObject = parseTimestamp(updatedAt);
  const formattedUpdate = dateObject && !isNaN(dateObject.getTime())
    ? dateObject.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : null;

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of the film database metrics and trends.
          </p>
        </div>
        {formattedUpdate && (
          <div className="flex items-center gap-2 bg-muted/50 border border-border/50 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Last update: {formattedUpdate}
          </div>
        )}
      </div>

      {stats && (
        <>
          {/* Top Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 sm:p-6 gap-2">
              <div className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium tracking-tight">Total Films</span>
                <Film className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalMovies.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">Indexed in database</p>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 gap-2">
              <div className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium tracking-tight">Total Engagement</span>
                <Star className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">{(stats.totalVotes / 1000000).toFixed(1)}M</div>
                <p className="text-sm text-muted-foreground mt-1">User ratings cast</p>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 gap-2">
              <div className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium tracking-tight">Average Rating</span>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.avgRating}</div>
                <p className="text-sm text-muted-foreground mt-1">Across all categories</p>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 gap-2">
              <div className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium tracking-tight">Diversity Index</span>
                <Dna className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">{diversityStats?.avgGenresPerMovie || 'N/A'}</div>
                <p className="text-sm text-muted-foreground mt-1">Genres per film on avg</p>
              </div>
            </Card>
          </div>

          {/* Genre Insights */}
          <div className="grid gap-4 md:grid-cols-3">
            <Link href={`/browser?includeGenres=${encodeURIComponent(stats.mostPopularGenre.genre_name)}`}>
              <Card className="p-4 sm:p-6 gap-4 border-l-4 border-l-blue-500 h-full hover:bg-muted/50 transition-all cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/10 rounded-md">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="font-semibold tracking-tight text-sm">Trending Genre</h3>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold capitalize truncate">
                    {stats.mostPopularGenre.genre_name}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center justify-between">
                    <span>Highest popular interest</span>
                    <span className="font-bold text-blue-500">+{stats.mostPopularGenre.average_popularity?.toFixed(0)}</span>
                  </p>
                </div>
              </Card>
            </Link>

            <Link href={`/browser?includeGenres=${encodeURIComponent(stats.largestGenre.genre_name)}`}>
              <Card className="p-4 sm:p-6 gap-4 border-l-4 border-l-orange-500 h-full hover:bg-muted/50 transition-all cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-500/10 rounded-md">
                    <Layers className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="font-semibold tracking-tight text-sm">Largest Genre</h3>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold capitalize truncate">
                    {stats.largestGenre.genre_name}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center justify-between">
                    <span>Most titles available</span>
                    <span className="font-bold text-orange-500">{stats.largestGenre.movie_count}</span>
                  </p>
                </div>
              </Card>
            </Link>

            <Link href={`/browser?includeGenres=${encodeURIComponent(stats.mostEngagedGenre?.genre_name || '')}`}>
              <Card className="p-4 sm:p-6 gap-4 border-l-4 border-l-rose-500 h-full hover:bg-muted/50 transition-all cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-500/10 rounded-md">
                    <Activity className="h-5 w-5 text-rose-500" />
                  </div>
                  <h3 className="font-semibold tracking-tight text-sm">Most Engaged</h3>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold capitalize truncate">
                    {stats.mostEngagedGenre?.genre_name || 'N/A'}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center justify-between">
                    <span>Highest user interaction</span>
                    <span className="font-bold text-rose-500">{stats.mostEngagedGenre?.engagement_score?.toLocaleString()}</span>
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </>
      )}

      {/* Analytics Rows */}
      {yearlyStats && diversityStats && (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Top Quality Years */}
          <Card className="flex flex-col gap-0 p-0 overflow-hidden">
            <div className="bg-muted/30 border-b p-4 sm:px-6 sm:py-4 flex items-center gap-2 font-semibold text-sm">
              <Star className="h-4 w-4 text-primary" />
              Top Quality Years
            </div>
            <div className="flex flex-col gap-0">
              <div className="divide-y text-sm">
                {yearlyStats.topBestYears.map((y, i) => (
                  <Link
                    key={y.year}
                    href={`/browser?minYear=${y.year}&maxYear=${y.year}`}
                    className="flex items-center justify-between p-4 sm:px-6 hover:bg-muted/30 transition-all border-b last:border-0 group/row"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-muted-foreground w-4 text-xs group-hover/row:text-primary transition-colors">#{i + 1}</span>
                      <span className="font-bold group-hover/row:translate-x-1 transition-transform">{y.year}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-primary">{y.avgRating} <span className="text-[10px] font-normal text-muted-foreground">AVG</span></span>
                      <span className="text-xs text-muted-foreground">{y.count} Films</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>

          {/* Most Productive */}
          <Card className="flex flex-col gap-0 p-0 overflow-hidden">
            <div className="bg-muted/30 border-b p-4 sm:px-6 sm:py-4 flex items-center gap-2 font-semibold text-sm">
              <Film className="h-4 w-4 text-blue-500" />
              Most Productive Years
            </div>
            <div className="flex flex-col gap-0">
              <div className="divide-y text-sm">
                {yearlyStats.topProductiveYears.map((y, i) => (
                  <Link
                    key={y.year}
                    href={`/browser?minYear=${y.year}&maxYear=${y.year}`}
                    className="flex items-center justify-between p-4 sm:px-6 hover:bg-muted/30 transition-all border-b last:border-0 group/row"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-muted-foreground w-4 text-xs group-hover/row:text-blue-500 transition-colors">#{i + 1}</span>
                      <span className="font-bold group-hover/row:translate-x-1 transition-transform">{y.year}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-blue-500">{y.count} <span className="text-[10px] font-normal text-muted-foreground">FILMS</span></span>
                      <span className="text-xs text-muted-foreground">{y.avgRating} AVG</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>

          {/* Legendary Pairings */}
          <Card className="flex flex-col gap-0 p-0 overflow-hidden md:col-span-2 lg:col-span-1">
            <div className="bg-muted/30 border-b p-4 sm:px-6 sm:py-4 flex items-center gap-2 font-semibold text-sm">
              <Swords className="h-4 w-4 text-purple-500" />
              Legendary Pairings
            </div>
            <div className="flex flex-col gap-0">
              <div className="divide-y text-sm">
                {diversityStats.topTandems.map((t, i) => (
                  <Link
                    key={t.pair}
                    href={`/browser?includeGenres=${t.pair.split(' + ').join(',')}`}
                    className="flex items-center justify-between p-4 sm:px-6 hover:bg-muted/30 transition-all border-b last:border-0 group/row"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-muted-foreground w-4 text-xs group-hover/row:text-purple-500 transition-colors">#{i + 1}</span>
                      <span className="font-bold uppercase group-hover/row:translate-x-1 transition-transform">{t.pair}</span>
                    </div>
                    <div className="flex flex-col items-end whitespace-nowrap">
                      <span className="font-bold text-purple-500">{t.count} <span className="text-[10px] font-normal text-muted-foreground uppercase">Common</span></span>
                      <span className="text-xs text-muted-foreground">Pairings</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Featured Genres */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Top Rated Categories</h2>
            <p className="text-sm text-muted-foreground">Highest quality genres according to average ratings.</p>
          </div>
          <Link
            href="/genres"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            View All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {genres.map((genre) => (
            <GenreCard key={genre.id} genre={genre} />
          ))}
        </div>
      </div>

      {/* Hidden Gems Section */}
      {hiddenGems.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                Discovery <Gem className="h-5 w-5 text-blue-500" />
              </h2>
              <p className="text-sm text-muted-foreground">Highly rated films that haven't reached the mainstream audience yet.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {hiddenGems.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
