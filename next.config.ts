import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // The parent /mywebsites folder has its own package.json which Turbopack
  // treats as the monorepo root — causing it to miss packages installed in
  // this project's node_modules (lucide-react, react-hot-toast, etc.).
  // Pinning both roots to this directory fixes module resolution locally.
  outputFileTracingRoot: path.resolve(__dirname),
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Allow images from Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
