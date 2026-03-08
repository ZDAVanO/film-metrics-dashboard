import { getGenre } from '@/lib/genres';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const genre = await getGenre(id);
    if (!genre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }
    return NextResponse.json(genre);
  } catch (error) {
    console.error(`API Error fetching genre ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch genre details' }, { status: 500 });
  }
}
