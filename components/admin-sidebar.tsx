"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { TreePine, MapPin, HelpCircle, QrCode, LogOut, Home, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Overzicht", icon: Home },
  { href: "/admin/dashboard/locaties", label: "Locaties", icon: MapPin },
  { href: "/admin/dashboard/quiz", label: "Quizvragen", icon: HelpCircle },
  { href: "/admin/dashboard/qr-codes", label: "QR Codes", icon: QrCode },
]

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  const navContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
        <TreePine className="h-5 w-5 text-sidebar-primary" />
        <span className="font-serif text-lg font-bold text-sidebar-foreground">
          Wandelbos
        </span>
        <span className="ml-auto rounded bg-sidebar-accent px-2 py-0.5 text-xs text-sidebar-accent-foreground">
          Admin
        </span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="flex flex-col gap-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-2 ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <p className="mb-2 truncate px-3 text-xs text-sidebar-foreground/50">
          {userEmail}
        </p>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Uitloggen
        </Button>
        <Link href="/" onClick={() => setOpen(false)}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <Home className="h-4 w-4" />
            Naar Website
          </Button>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(!open)}
          className="bg-background"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar-background transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>
    </>
  )
}
