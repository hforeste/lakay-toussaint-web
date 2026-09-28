import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  }
};

export default nextConfig;
