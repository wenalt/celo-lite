// next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),

      // Map ONLY the bare import "react-spinners" to our shim
      "react-spinners$": path.resolve(
        __dirname,
        "lib/react-spinners-shim.js"
      ),
    };

    return config;
  },

  // Required for Next.js 16 to avoid Turbopack warnings
  turbopack: {},
};

module.exports = nextConfig;
