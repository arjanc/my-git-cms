import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Folder, Plus, LogOut } from 'lucide-react';

interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
}

export default function CMSHome() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<Array<{ name: string; full_name: string }>>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      loadRepos();
    }
  }, [session]);

  const loadRepos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/repos');
      const data = await response.json();
      setRepos(data);
    } catch (error) {
      console.error('Error loading repos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async (repoFullName: string) => {
    try {
      setLoading(true);
      const [owner, repo] = repoFullName.split('/');
      const response = await fetch(`/api/github/${owner}/${repo}?path=content/pages`);
      const data = await response.json();
      setFiles(data);
      setSelectedRepo(repoFullName);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file: GitHubFile) => {
    if (file.type === 'file' && selectedRepo) {
      const [owner, repo] = selectedRepo.split('/');
      router.push(`/editor/${owner}/${repo}?path=${encodeURIComponent(file.path)}`);
    }
  };

  const handleNewPage = () => {
    if (selectedRepo) {
      const [owner, repo] = selectedRepo.split('/');
      router.push(`/editor/${owner}/${repo}`);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Git-based CMS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Sign in with GitHub to manage your content
            </p>
            <Button onClick={() => signIn('github')} className="w-full">
              Sign in with GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Git CMS</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{session.user?.name}</span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Repository Selector */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Your Repositories</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !repos.length ? (
                <p className="text-sm text-muted-foreground">Loading repositories...</p>
              ) : (
                <div className="space-y-2">
                  {repos.map((repo) => (
                    <button
                      key={repo.full_name}
                      onClick={() => loadFiles(repo.full_name)}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
                        selectedRepo === repo.full_name ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        <span className="text-sm font-medium">{repo.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Browser */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pages</CardTitle>
                {selectedRepo && (
                  <Button size="sm" onClick={handleNewPage}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Page
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedRepo ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Select a repository to view pages
                </p>
              ) : loading ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Loading files...
                </p>
              ) : files.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">
                    No pages found. Create your first page!
                  </p>
                  <Button onClick={handleNewPage}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Page
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => handleFileClick(file)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
