"use client"
// import { SessionProvider } from "next-auth/react"
// import { Session } from "next-auth";

interface ProvidersProps {
  children: React.ReactNode;
  session: null; // Auth disabled — always null for now
}

// Auth is temporarily disabled.
// To re-enable: uncomment SessionProvider imports and replace <>{children}</> with <SessionProvider session={session}>{children}</SessionProvider>
export const Providers = ({ children }: ProvidersProps) => {
  return (
    <>{children}</>
  );
};