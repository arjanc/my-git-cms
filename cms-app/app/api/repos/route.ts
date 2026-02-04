import { auth } from "@/auth"
import { GitHubAPI } from "@/lib/github-api"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check for specific repo in environment variables
    const envRepoOwner = process.env.gcs_REPO_OWNER
    const envRepoName = process.env.gcs_REPO

    if (envRepoOwner && envRepoName) {
      return NextResponse.json([{
        name: envRepoName,
        full_name: `${envRepoOwner}/${envRepoName}`
      }])
    }

    const repos = await GitHubAPI.listUserRepos(session.accessToken)
    return NextResponse.json(repos)
  } catch (error) {
    console.error("Error fetching repos:", error)
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}
