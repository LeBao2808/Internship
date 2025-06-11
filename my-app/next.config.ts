 import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  i18n: {
    locales: ["en", "vi"],
    defaultLocale: "en",
    localeDetection: false,
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

export default nextConfig;
