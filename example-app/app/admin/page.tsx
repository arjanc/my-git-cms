import { CMS } from '@git-cms/core'

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
