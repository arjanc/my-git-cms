import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return <DashboardClient session={session} />;
}
