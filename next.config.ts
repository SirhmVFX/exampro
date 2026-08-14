import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Parent folder /Users/mac/Documents/mywebsites has its own package.json, so
  // Turbopack otherwise treats that as the workspace root and fails to resolve
  // tailwindcss from this project.
  turbopack: {
    root: path.resolve(__dirname),
  },
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
