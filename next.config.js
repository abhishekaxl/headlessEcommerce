/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'magento-instance.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '80',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
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
        destination: 'http://localhost/media/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

