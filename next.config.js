// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    urlImports: ['https://cdn.jsdelivr.net'],
  },
  webpack: (config) => {
    // Redirige tous les imports 'react-spinners' vers le shim compatible ESM
    config.resolve.alias['react-spinners'] = path.resolve(__dirname, 'lib/react-spinners-shim.js');
    return config;
  },
};

module.exports = nextConfig;
