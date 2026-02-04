import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { GitHubAPI } from '../../lib/github-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const repos = await GitHubAPI.listUserRepos(session.accessToken);
    return res.status(200).json(repos);
  } catch (error) {
    console.error('Error fetching repos:', error);
    return res.status(500).json({ error: 'Failed to fetch repositories' });
  }
}
