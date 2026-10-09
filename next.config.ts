import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
