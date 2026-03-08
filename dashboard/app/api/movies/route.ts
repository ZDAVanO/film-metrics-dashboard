import { getMovies, MovieSearchParams } from '@/lib/movies';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  
  const queryParams: MovieSearchParams = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '40'),
    sortBy: searchParams.get('sortBy') || 'popularity',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    genre: searchParams.get('genre') || undefined,
    minYear: searchParams.get('minYear') ? parseInt(searchParams.get('minYear')!) : undefined,
    maxYear: searchParams.get('maxYear') ? parseInt(searchParams.get('maxYear')!) : undefined,
  };

  try {
    const data = await getMovies(queryParams);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error fetching movies:", error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}
