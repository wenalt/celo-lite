/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    urlImports: ["https://cdn.jsdelivr.net"],
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Quand une lib (ex: @selfxyz/qrcode) fait: import { BounceLoader } from 'react-spinners'
      // on la redirige vers notre shim qui exporte bien BounceLoader.
      "react-spinners": require("path").resolve(__dirname, "lib/react-spinners-shim.js"),
    };
    return config;
  },
};
module.exports = nextConfig;
