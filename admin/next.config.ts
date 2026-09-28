import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: false,
  serverExternalPackages: ["postgres"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
