import { getAllGenres, getTopGenres } from '@/lib/genres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  const isTop = searchParams.get('top') === 'true';

  try {
    if (isTop) {
      const genres = await getTopGenres(limit ? parseInt(limit) : 4);
      return NextResponse.json(genres);
    }
    const genres = await getAllGenres();
    return NextResponse.json(genres);
  } catch (error) {
    console.error("API Error fetching genres:", error);
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 });
  }
}
