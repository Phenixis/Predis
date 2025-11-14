/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // For Capacitor
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : undefined,
  trailingSlash: process.env.CAPACITOR_BUILD === 'true' ? true : false,
}

module.exports = nextConfig
