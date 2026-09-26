/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const internalApiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_AUTH_URL;

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/callback/apple',
        destination: '/api/callback/apple',
      },
      {
        source: '/api/:path*',
        destination: `${internalApiUrl}/:path*`,
      },
    ];
  },
  ...withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
  }),
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    if (isServer) {
      // next server build => ignore msw/browser
      if (Array.isArray(config.resolve.alias)) {
        // in Next the type is always object, so this branch isn't necessary. But to keep TS happy, avoid @ts-ignore and prevent possible future breaking changes it's good to have it
        config.resolve.alias.push({ name: 'msw/browser', alias: false });
      } else {
        config.resolve.alias['msw/browser'] = false;
      }
    } else {
      // browser => ignore msw/node
      if (Array.isArray(config.resolve.alias)) {
        config.resolve.alias.push({ name: 'msw/node', alias: false });
      } else {
        config.resolve.alias['msw/node'] = false;
      }
    }
    return config;
  },
  images: {
    loader: 'custom',
    loaderFile: './src/shared/utils/next-image-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'geonganghaejim.site',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'health.junghaebom.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'geonganghaegym.junghaebom.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'healthy-bucket-s3.s3.ap-northeast-2.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
