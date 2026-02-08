"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageEditor } from "@/components/page-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditorClientProps {
  owner: string
  repo: string
  path?: string
}

export function EditorClient({ owner, repo, path }: EditorClientProps) {
  const router = useRouter()
  const [content, setContent] = useState<string>("")
  const [filePath, setFilePath] = useState<string>("")
  const [fileSha, setFileSha] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (path) {
      loadFile(path)
      setFilePath(path)
    } else {
      setLoading(false)
    }
  }, [path])

  const loadFile = async (filePath: string) => {
    try {
      setLoading(true)
      const response = await fetch(
        `/admin/api/github/${owner}/${repo}?path=${encodeURIComponent(filePath)}`
      )
      const data = await response.json()
      setContent(data.content)
      setFileSha(data.sha)
    } catch (error) {
      console.error("Error loading file:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (markdown: string) => {
    try {
      setSaving(true)

      let targetPath = filePath
      if (!targetPath) {
        const timestamp = Date.now()
        targetPath = `content/pages/page-${timestamp}.md`
        setFilePath(targetPath)
      }

      const response = await fetch(`/admin/api/github/${owner}/${repo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: targetPath,
          content: markdown,
          message: `Update ${targetPath}`,
          sha: fileSha || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save file")
      }

      if (!fileSha) {
        router.push(`/editor/${owner}/${repo}?path=${encodeURIComponent(targetPath)}`)
      } else {
        await loadFile(targetPath)
      }

      alert("Page saved successfully!")
    } catch (error) {
      console.error("Error saving file:", error)
      alert("Failed to save page. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading editor...</p>
      </div>
    )
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
              {filePath ? `Editing ${filePath.split("/").pop()}` : "New Page"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {owner}/{repo}
            </p>
          </div>
        </div>
      </header>

      <PageEditor initialContent={content} onSave={handleSave} isSaving={saving} />
    </div>
  )
}
