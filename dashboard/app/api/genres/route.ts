import { getAllGenres } from '@/lib/genres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const genres = await getAllGenres();
    return NextResponse.json(genres);
  } catch (error) {
    console.error("API Error fetching genres:", error);
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 });
  }
}
