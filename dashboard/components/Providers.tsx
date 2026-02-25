"use client"
import { SessionProvider } from "next-auth/react"
import { Session } from "next-auth";

// 2. Define the interface for props
interface ProvidersProps {
  children: React.ReactNode;
  session: Session | null; // Session can be an object or null (if not authenticated)
}

// Add session to props
export const Providers = ({ children, session }: ProvidersProps) => {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
};