import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Load these at runtime via Node instead of bundling through Turbopack.
  // @octokit/rest is large and only needed server-side in API route handlers.
  serverExternalPackages: ['@octokit/rest', '@octokit/core'],
}

export default nextConfig
