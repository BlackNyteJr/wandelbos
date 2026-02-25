import Link from "next/link"
import { TreePine } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <TreePine className="h-5 w-5" />
          <span className="font-serif text-lg font-semibold">Wandelbos</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 text-sm text-primary-foreground/80">
          <Link href="/kaart" className="hover:text-primary-foreground transition-colors">
            Kaart
          </Link>
          <Link href="/locaties" className="hover:text-primary-foreground transition-colors">
            Locaties
          </Link>
          <Link href="/quiz" className="hover:text-primary-foreground transition-colors">
            Quiz
          </Link>
          <Link href="/admin/login" className="hover:text-primary-foreground transition-colors">
            Beheer
          </Link>
        </nav>
        <p className="text-xs text-primary-foreground/60">
          {"Wandelbos Historische Wandelroute"}
        </p>
      </div>
    </footer>
  )
}
