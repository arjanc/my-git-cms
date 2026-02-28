import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Bundle @git-cms/core through Turbopack so it correctly handles 'use client'
  // boundaries in the pre-compiled files served from lib/git-cms/dist/.
  // Without this, Turbopack treats the symlinked package as an opaque external
  // and mixes server/client chunks incorrectly.
  transpilePackages: ['@git-cms/core'],

  // Load these at runtime via Node instead of bundling through Turbopack.
  // @octokit/rest is large and only needed server-side in API route handlers.
  serverExternalPackages: ['@octokit/rest', '@octokit/core'],
}

export default nextConfig
