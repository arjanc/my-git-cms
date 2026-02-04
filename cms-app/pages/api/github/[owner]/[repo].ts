import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { GitHubAPI } from '../../../lib/github-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { owner, repo } = req.query;

  if (!owner || !repo || typeof owner !== 'string' || typeof repo !== 'string') {
    return res.status(400).json({ error: 'Missing owner or repo' });
  }

  const github = new GitHubAPI(session.accessToken, owner, repo);

  try {
    switch (req.method) {
      case 'GET': {
        const { path = 'content/pages' } = req.query;
        
        if (path === 'content/pages') {
          // List files in directory
          const files = await github.listFiles(path as string);
          return res.status(200).json(files);
        } else {
          // Get specific file content
          const fileData = await github.getFileContent(path as string);
          return res.status(200).json(fileData);
        }
      }

      case 'POST': {
        const { path, content, message, sha } = req.body;
        
        if (!path || !content || !message) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        await github.saveFile(path, content, message, sha);
        return res.status(200).json({ success: true });
      }

      case 'DELETE': {
        const { path, sha, message } = req.body;
        
        if (!path || !sha || !message) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        await github.deleteFile(path, sha, message);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('GitHub API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
