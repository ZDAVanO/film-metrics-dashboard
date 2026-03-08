import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


import { ThemeProvider } from "@/components/theme-provider"
// import Header from "@/components/header";
// import LayoutContent from "@/components/LayoutContent";

import { Providers } from "@/components/Providers"
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

import { Toaster } from "@/components/ui/sonner"




const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Film Metrics Dashboard",
  description: "Advanced analytics and insights for movie enthusiasts and data lovers.",
};

export default async function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  // const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >

        <Providers session={null}>

          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >

            {children}

            <Toaster />

          </ThemeProvider>

        </Providers>

      </body>
    </html>
  );
}
