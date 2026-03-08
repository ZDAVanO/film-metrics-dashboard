import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Check secret token
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const tag = searchParams.get('tag');

  if (tag) {
    revalidateTag(tag, 'max');
    return NextResponse.json({ revalidated: true, tag, now: Date.now() });
  }

  // If no tag, revalidate main entities
  revalidateTag('movies', 'max');
  revalidateTag('genres', 'max');
  revalidateTag('stats', 'max');

  return NextResponse.json({ 
    revalidated: true, 
    tags: ['movies', 'genres', 'stats'], 
    now: Date.now() 
  });
}

// Support GET for easier manual testing if secret is provided
export async function GET(request: NextRequest) {
    return POST(request);
}
