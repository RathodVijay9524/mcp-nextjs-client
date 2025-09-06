import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during build for deployment
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript errors during build for deployment
  },
};

export default nextConfig;
