/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  transpilePackages: ['@git-cms/shared'],
}

module.exports = nextConfig
