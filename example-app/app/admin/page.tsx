import { CMS } from '../../lib/git-cms'

export default function AdminPage() {
  return (
    <CMS
      basePath="/admin"
      contentPath="content/pages"
      githubOwner={process.env.GITHUB_OWNER}
      githubRepo={process.env.GITHUB_REPO}
    />
  )
}
