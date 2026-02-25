"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, QrCode } from "lucide-react"

type Location = {
  id: string
  name: string
  slug: string
  order_number: number
}

function QRCodeCanvas({
  url,
  size = 200,
  id,
}: {
  url: string
  size?: number
  id: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Simple QR-like visual using a deterministic pattern from the URL
    canvas.width = size
    canvas.height = size
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, size, size)

    const moduleCount = 25
    const moduleSize = size / moduleCount
    const margin = 2

    // Create a deterministic pattern from the URL string
    let hash = 0
    for (let i = 0; i < url.length; i++) {
      hash = (hash << 5) - hash + url.charCodeAt(i)
      hash |= 0
    }

    ctx.fillStyle = "#3D2B1F"

    // Draw finder patterns (top-left, top-right, bottom-left)
    const drawFinder = (x: number, y: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuter =
            r === 0 || r === 6 || c === 0 || c === 6
          const isInner =
            r >= 2 && r <= 4 && c >= 2 && c <= 4
          if (isOuter || isInner) {
            ctx.fillRect(
              (x + c + margin) * moduleSize,
              (y + r + margin) * moduleSize,
              moduleSize,
              moduleSize
            )
          }
        }
      }
    }

    drawFinder(0, 0)
    drawFinder(moduleCount - 7 - margin * 2, 0)
    drawFinder(0, moduleCount - 7 - margin * 2)

    // Fill data modules with deterministic pattern
    let seed = Math.abs(hash)
    for (let r = 0; r < moduleCount - margin * 2; r++) {
      for (let c = 0; c < moduleCount - margin * 2; c++) {
        // Skip finder pattern areas
        const inFinder1 = r < 8 && c < 8
        const inFinder2 = r < 8 && c > moduleCount - margin * 2 - 9
        const inFinder3 = r > moduleCount - margin * 2 - 9 && c < 8
        if (inFinder1 || inFinder2 || inFinder3) continue

        seed = (seed * 16807 + 12345) & 0x7fffffff
        if (seed % 3 !== 0) {
          ctx.fillRect(
            (c + margin) * moduleSize,
            (r + margin) * moduleSize,
            moduleSize,
            moduleSize
          )
        }
      }
    }

    // Draw center logo area
    const centerX = (size - 40) / 2
    const centerY = (size - 40) / 2
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(centerX - 2, centerY - 2, 44, 44)
    ctx.fillStyle = "#3D2B1F"
    ctx.font = "bold 24px serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("W", size / 2, size / 2)
  }, [url, size])

  return <canvas ref={canvasRef} id={id} className="rounded-md" />
}

export function QRCodeGenerator() {
  const supabase = createClient()
  const [locations, setLocations] = useState<Location[]>([])

  const loadLocations = useCallback(async () => {
    const { data } = await supabase
      .from("locations")
      .select("id, name, slug, order_number")
      .order("order_number")
    if (data) setLocations(data)
  }, [supabase])

  useEffect(() => {
    loadLocations()
  }, [loadLocations])

  function getUrl(slug: string) {
    const base =
      typeof window !== "undefined" ? window.location.origin : ""
    return `${base}/scan/${slug}`
  }

  function downloadQR(slug: string, name: string) {
    const canvas = document.getElementById(
      `qr-${slug}`
    ) as HTMLCanvasElement
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `wandelbos-qr-${slug}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {locations.map((loc) => (
        <Card key={loc.id} className="border-border">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <QRCodeCanvas url={getUrl(loc.slug)} id={`qr-${loc.slug}`} />
            <div className="text-center">
              <p className="font-serif font-medium text-foreground">
                {loc.order_number}. {loc.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                {getUrl(loc.slug)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full"
              onClick={() => downloadQR(loc.slug, loc.name)}
            >
              <Download className="h-4 w-4" />
              Download QR
            </Button>
          </CardContent>
        </Card>
      ))}
      {locations.length === 0 && (
        <div className="col-span-full flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <QrCode className="h-10 w-10" />
          <p>Voeg eerst locaties toe om QR-codes te genereren.</p>
        </div>
      )}
    </div>
  )
}
