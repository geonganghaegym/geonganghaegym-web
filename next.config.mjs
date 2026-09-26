const internalApiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_AUTH_URL;

/** @type {import('next').NextConfig} */
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
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
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
