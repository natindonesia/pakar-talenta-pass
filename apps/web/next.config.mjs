import path from 'node:path';
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for the container image (apps/web/Dockerfile).
  output: 'standalone',
  // Monorepo: trace from the repo root so workspace packages are included.
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    reactCompiler: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // @pakar-talenta/* packages use node:crypto and other Node built-ins
  serverExternalPackages: [
    '@pakar-talenta/auth',
    '@pakar-talenta/core',
    '@pakar-talenta/db',
    '@pakar-talenta/mail',
    '@pakar-talenta/audit',
    '@pakar-talenta/config',
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
