import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '../auth';
import { CMS } from '../components/CMS';
export default async function AdminPage() {
    const session = await auth();
    const basePath = process.env.GIT_CMS_BASE_PATH ?? '/admin';
    if (!session) {
        redirect(`${basePath}/api/auth/signin?callbackUrl=${encodeURIComponent(basePath)}`);
    }
    return (React.createElement(CMS, {
        basePath,
        apiBasePath: `${basePath}/api/cms`,
        contentPath: 'content/pages',
        githubOwner: process.env.GITHUB_OWNER,
        githubRepo: process.env.GITHUB_REPO,
    }));
}
