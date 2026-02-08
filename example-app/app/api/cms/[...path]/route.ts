import { createGitCMSHandler } from '@git-cms/core/api'
import { auth } from '@git-cms/core/auth';

export const { GET, POST, DELETE } = createGitCMSHandler({
  getAccessToken: async () => {
    const session = await auth()
    return session?.accessToken || null
  },
  owner: process.env.GITHUB_OWNER || '',
  repo: process.env.GITHUB_REPO || '',
})
