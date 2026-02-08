const isProd = process.env.NODE_ENV === 'production'
const CMS_URL = isProd 
  ? process.env.NEXT_PUBLIC_CMS_URL || 'https://your-domain.com' 
  : 'http://localhost:3001'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In production, Vercel handles this via vercel.json
    // In development, we need to proxy to the CMS app running on :3001
    if (isProd) {
      return []
    }
    
    return [
      {
        source: '/admin',
        destination: `${CMS_URL}/admin`,
      },
      {
        source: '/admin/:path*',
        destination: `${CMS_URL}/admin/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
