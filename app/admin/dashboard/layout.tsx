import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userEmail={user.email || ""} />
      <main className="flex-1 overflow-auto bg-background">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
