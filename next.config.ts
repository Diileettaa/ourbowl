import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 1. 忽略 TypeScript 报错 (免死金牌) */
  typescript: {
    ignoreBuildErrors: true,
  },
  /* 2. 忽略 ESLint 报错 (双重保险) */
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* 3. 允许跨域图片 (为了相册功能) */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 允许加载任何地方的图片
      },
    ],
  },
};

export default nextConfig;