import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '../auth'
import { CMS } from '../components/CMS'
import type { BlockSchema, PageSchema } from '../types/schemas'

interface AdminPageProps {
  blockSchemas?: BlockSchema[]
  pageSchemas?: PageSchema[]
  /**
   * Prefix applied to every PageSchema.contentPath that does not start with '/'.
   * Set this to the subdirectory where your Next.js app lives within the repo.
   *
   * Example: contentBase='example-app' + schema.contentPath='content/pages'
   *          → GitHub path 'example-app/content/pages'
   *
   * Omit (or leave empty) when the Next.js app is at the repo root.
   */
  contentBase?: string
}

function resolveContentPath(contentBase: string | undefined, contentPath: string): string {
  if (!contentBase || contentPath.startsWith('/')) return contentPath
  return `${contentBase}/${contentPath}`
}

export default async function AdminPage({
  blockSchemas,
  pageSchemas,
  contentBase,
}: AdminPageProps = {}) {
  const session = await auth()
  const basePath = process.env.GIT_CMS_BASE_PATH ?? '/admin'

  if (!session || !session.accessToken) {
    redirect(`${basePath}/api/auth/signin?callbackUrl=${encodeURIComponent(basePath)}`)
  }

  const resolvedPageSchemas = pageSchemas?.map((schema) => ({
    ...schema,
    contentPath: resolveContentPath(contentBase, schema.contentPath),
  }))

  const defaultContentPath = resolveContentPath(contentBase, 'content/pages')

  return React.createElement(CMS, {
    basePath,
    apiBasePath: `${basePath}/api/cms`,
    contentPath: defaultContentPath,
    githubOwner: process.env.GITHUB_OWNER,
    githubRepo: process.env.GITHUB_REPO,
    blockSchemas,
    pageSchemas: resolvedPageSchemas,
    user: { name: session.user?.name, image: session.user?.image },
    signOutUrl: `${basePath}/api/auth/signout`,
  })
}
