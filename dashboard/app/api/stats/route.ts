import { getGlobalAppStats } from '@/lib/movies';
import { getGlobalStats } from '@/lib/genres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [appStats, genreSummary] = await Promise.all([
      getGlobalAppStats(),
      getGlobalStats()
    ]);

    return NextResponse.json({
      app: appStats,
      summary: genreSummary
    });
  } catch (error) {
    console.error("API Error fetching stats:", error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
