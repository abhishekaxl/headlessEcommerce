/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '80',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'magento-instance.com',
      },
    ],
    unoptimized: false,
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/api/graphql',
  },
  // Rewrite to proxy Magento images if needed
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: 'http://localhost:8080/media/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

