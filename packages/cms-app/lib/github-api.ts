import { Octokit } from '@octokit/rest';

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
}

export class GitHubAPI {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(accessToken: string, owner: string, repo: string) {
    this.octokit = new Octokit({ auth: accessToken });
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * List files in a directory
   */
  async listFiles(path: string = 'content/pages'): Promise<GitHubFile[]> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      if (Array.isArray(data)) {
        return data.map(item => ({
          name: item.name,
          path: item.path,
          sha: item.sha,
          size: item.size,
          type: item.type as 'file' | 'dir',
        }));
      }

      return [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  /**
   * Get file content
   */
  async getFileContent(path: string): Promise<{ content: string; sha: string }> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      if ('content' in data && data.type === 'file') {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return { content, sha: data.sha };
      }

      throw new Error('Not a file');
    } catch (error) {
      console.error('Error getting file content:', error);
      throw error;
    }
  }

  /**
   * Create or update a file
   */
  async saveFile(
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<void> {
    try {
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        sha, // Include sha for updates, omit for new files
      });
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(path: string, sha: string, message: string): Promise<void> {
    try {
      await this.octokit.repos.deleteFile({
        owner: this.owner,
        repo: this.repo,
        path,
        message,
        sha,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get repository info
   */
  async getRepoInfo() {
    try {
      const { data } = await this.octokit.repos.get({
        owner: this.owner,
        repo: this.repo,
      });
      return data;
    } catch (error) {
      console.error('Error getting repo info:', error);
      throw error;
    }
  }

  /**
   * List user's repositories
   */
  static async listUserRepos(accessToken: string): Promise<Array<{ name: string; full_name: string }>> {
    const octokit = new Octokit({ auth: accessToken });
    
    try {
      const { data } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });
      
      return data.map(repo => ({
        name: repo.name,
        full_name: repo.full_name,
      }));
    } catch (error) {
      console.error('Error listing repos:', error);
      throw error;
    }
  }
}
