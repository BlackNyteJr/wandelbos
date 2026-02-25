import type { Metadata, Viewport } from "next"
import { Playfair_Display, Lora } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Wandelbos - Historische Wandelroute",
  description:
    "Ontdek de rijke geschiedenis van het Wandelbos via een interactieve wandelroute met QR-codes, historische foto's, quizzen en een digitale kaart.",
}

export const viewport: Viewport = {
  themeColor: "#5c4033",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className={`${playfair.variable} ${lora.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
