// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    urlImports: ['https://cdn.jsdelivr.net'],
  },
  webpack: (config) => {
    const aliasPath = path.resolve(__dirname, 'lib/react-spinners-shim.mjs');

    // On couvre à la fois 'react-spinners' et 'react-spinners$' (match exact),
    // certains résolveurs n’appliquent que l’un des deux.
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-spinners$': aliasPath,
      'react-spinners': aliasPath,
    };

    return config;
  },
};

module.exports = nextConfig;
