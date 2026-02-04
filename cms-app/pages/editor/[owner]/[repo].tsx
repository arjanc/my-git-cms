import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { PageEditor } from '../../../components/PageEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditorPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { owner, repo } = router.query;
  const [content, setContent] = useState<string>('');
  const [filePath, setFilePath] = useState<string>('');
  const [fileSha, setFileSha] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (router.isReady && owner && repo) {
      const path = router.query.path as string;
      
      if (path) {
        // Load existing file
        loadFile(path);
        setFilePath(path);
      } else {
        // New file
        setLoading(false);
      }
    }
  }, [router.isReady, owner, repo, router.query.path]);

  const loadFile = async (path: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/github/${owner}/${repo}?path=${encodeURIComponent(path)}`
      );
      const data = await response.json();
      setContent(data.content);
      setFileSha(data.sha);
    } catch (error) {
      console.error('Error loading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (markdown: string) => {
    try {
      setSaving(true);

      // If no file path, create a new one
      let targetPath = filePath;
      if (!targetPath) {
        const timestamp = Date.now();
        targetPath = `content/pages/page-${timestamp}.md`;
        setFilePath(targetPath);
      }

      const response = await fetch(`/api/github/${owner}/${repo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: targetPath,
          content: markdown,
          message: `Update ${targetPath}`,
          sha: fileSha || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save file');
      }

      // Reload to get new SHA
      if (!fileSha) {
        router.push(`/editor/${owner}/${repo}?path=${encodeURIComponent(targetPath)}`);
      } else {
        await loadFile(targetPath);
      }

      alert('Page saved successfully!');
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to use the editor</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">
              {filePath ? `Editing ${filePath.split('/').pop()}` : 'New Page'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {owner}/{repo}
            </p>
          </div>
        </div>
      </header>

      <PageEditor initialContent={content} onSave={handleSave} isSaving={saving} />
    </div>
  );
}
