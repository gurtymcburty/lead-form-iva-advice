/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.typeform.com',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
