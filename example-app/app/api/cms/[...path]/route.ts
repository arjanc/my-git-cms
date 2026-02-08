import { createGitCMSHandler } from '../../../../lib/git-cms/dist/api'
import { auth } from '../../../../lib/git-cms/dist/auth';

export const { GET, POST, DELETE } = createGitCMSHandler({
  getAccessToken: async () => {
    const session = await auth()
    return session?.accessToken || null
  },
  owner: process.env.GITHUB_OWNER || '',
  repo: process.env.GITHUB_REPO || '',
})
