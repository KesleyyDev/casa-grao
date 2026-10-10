import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // um segundo servidor de desenvolvimento usa outra pasta de build, para os dois não se sobrescreverem
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
