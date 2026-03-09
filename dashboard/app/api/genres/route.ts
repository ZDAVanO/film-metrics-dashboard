import { getAllGenres, getTopGenres } from '@/lib/genres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  const isTop = searchParams.get('top') === 'true';

  const cacheHeaders = { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' };
  try {
    if (isTop) {
      const genres = await getTopGenres(limit ? parseInt(limit) : 4);
      return NextResponse.json(genres, { headers: cacheHeaders });
    }
    const genres = await getAllGenres();
    return NextResponse.json(genres, { headers: cacheHeaders });
  } catch (error) {
    console.error("API Error fetching genres:", error);
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 });
  }
}
