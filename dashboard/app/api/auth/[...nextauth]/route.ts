// Auth is temporarily disabled.
// import NextAuth from "next-auth";
// import { authOptions } from "@/lib/auth";
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ error: "Auth disabled" }, { status: 404 }); }
export async function POST() { return NextResponse.json({ error: "Auth disabled" }, { status: 404 }); }
