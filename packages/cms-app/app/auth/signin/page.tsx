import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
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
          <form
            action={async () => {
              "use server"
              await signIn("github", { redirectTo: "/" })
            }}
          >
            <Button type="submit" className="w-full">
              Sign in with GitHub
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
