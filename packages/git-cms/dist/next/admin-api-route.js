// Pre-wired CMS API route handlers — consuming app re-exports GET, POST, DELETE
import { createGitCMSHandler } from '../api/handler';
import { auth } from '../auth';
const { GET, POST, DELETE } = createGitCMSHandler({
    getAccessToken: async () => {
        const session = await auth();
        return session?.accessToken ?? null;
    },
    owner: process.env.GITHUB_OWNER ?? '',
    repo: process.env.GITHUB_REPO ?? '',
});
export { GET, POST, DELETE };
