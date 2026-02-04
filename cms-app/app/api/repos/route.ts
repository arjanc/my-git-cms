import { auth } from "@/auth"
import { GitHubAPI } from "@/lib/github-api"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const repos = await GitHubAPI.listUserRepos(session.accessToken)
    return NextResponse.json(repos)
  } catch (error) {
    console.error("Error fetching repos:", error)
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}
