import { getMovie } from '@/lib/movies';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const movie = await getMovie(id);
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    return NextResponse.json(movie);
  } catch (error) {
    console.error(`API Error fetching movie ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch movie details' }, { status: 500 });
  }
}
