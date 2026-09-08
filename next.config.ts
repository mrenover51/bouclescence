import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/product-images/**" }] },
  experimental: { serverActions: { bodySizeLimit: "85mb" } },
};

export default nextConfig;
