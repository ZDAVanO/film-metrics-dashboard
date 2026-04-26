import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Limit generated image sizes to only what the UI actually uses.
    // Default Next.js generates 10+ breakpoints — this reduces Vercel
    // "Image Optimization - Transformations" and "Cache Writes" usage.
    deviceSizes: [640, 1080],
    imageSizes: [128, 256, 384],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      }
    ],
  },
};

export default nextConfig;
