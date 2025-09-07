// next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    urlImports: ["https://cdn.jsdelivr.net"]
  },
  webpack: (config) => {
    // Map ONLY the bare import "react-spinners" to our shim
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-spinners$": path.resolve(__dirname, "lib/react-spinners-shim.js"),
    };
    return config;
  },
};

module.exports = nextConfig;
