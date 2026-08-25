import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '*': ['./node_modules/@swc/helpers/esm/**/*'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aliabackend.kodevio.com',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;