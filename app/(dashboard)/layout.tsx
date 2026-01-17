import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/nav";
import { Providers } from "@/components/providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Providers>
      <div className="flex min-h-screen">
        <DashboardNav user={session.user} />
        <main className="flex-1 p-8 bg-muted/30">{children}</main>
      </div>
    </Providers>
  );
}
