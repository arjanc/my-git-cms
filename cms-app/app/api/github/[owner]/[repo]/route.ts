import { auth } from "@/auth"
import { GitHubAPI } from "@/lib/github-api"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const session = await auth()

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { owner, repo } = params
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get("path") || "content/pages"

  const github = new GitHubAPI(session.accessToken, owner, repo)

  try {
    if (path === "content/pages") {
      // List files in directory
      const files = await github.listFiles(path)
      return NextResponse.json(files)
    } else {
      // Get specific file content
      const fileData = await github.getFileContent(path)
      return NextResponse.json(fileData)
    }
  } catch (error) {
    console.error("GitHub API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const session = await auth()

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { owner, repo } = params
  const body = await request.json()
  const { path, content, message, sha } = body

  if (!path || !content || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const github = new GitHubAPI(session.accessToken, owner, repo)

  try {
    await github.saveFile(path, content, message, sha)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("GitHub API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const session = await auth()

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { owner, repo } = params
  const body = await request.json()
  const { path, sha, message } = body

  if (!path || !sha || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const github = new GitHubAPI(session.accessToken, owner, repo)

  try {
    await github.deleteFile(path, sha, message)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("GitHub API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
