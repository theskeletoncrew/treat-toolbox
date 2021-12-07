const { IgnorePlugin } = require("webpack");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["pbs.twimg.com", "www.gravatar.com", "localhost"],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(new IgnorePlugin(/functions/));
    return config;
  },
  experimental: {
    scrollRestoration: true,
  },
};
