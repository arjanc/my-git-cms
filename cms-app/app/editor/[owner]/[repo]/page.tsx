import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { EditorClient } from "@/components/editor-client"

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: { owner: string; repo: string }
  searchParams: { path?: string }
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <EditorClient
      owner={params.owner}
      repo={params.repo}
      path={searchParams.path}
    />
  )
}
