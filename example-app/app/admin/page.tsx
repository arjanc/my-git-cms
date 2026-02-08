import { CMS } from '../../lib/git-cms'

export default function AdminPage() {
  return (
    <CMS
      basePath="/admin"
      contentPath="content/pages"
      githubOwner="your-username"
      githubRepo="your-repo"
    />
  )
}
