import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "Welcome to the Film Metrics Dashboard REST API",
    version: "1.0.0",
    endpoints: {
      movies: {
        list: "/api/movies",
        details: "/api/movies/[id]",
        parameters: ["page", "limit", "genre", "sortBy", "sortOrder", "minYear", "maxYear"]
      },
      genres: {
        list: "/api/genres",
        details: "/api/genres/[name]",
        top: "/api/genres?top=true&limit=4"
      },
      stats: {
        overview: "/api/stats"
      }
    }
  });
}
