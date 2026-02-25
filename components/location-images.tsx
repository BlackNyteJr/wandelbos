"use client"

import { useState } from "react"
import Image from "next/image"
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface LocationImage {
  id: string
  image_url: string
  caption: string | null
  is_historical: boolean
  year_taken: string | null
}

export function LocationImages({ images }: { images: LocationImage[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold">
        <Camera className="h-5 w-5 text-secondary" />
        Afbeeldingen
      </h2>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setLightbox(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"
          >
            <Image
              src={img.image_url}
              alt={img.caption || "Locatie afbeelding"}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            {img.is_historical && (
              <Badge className="absolute left-2 top-2 bg-primary/80 text-primary-foreground text-xs">
                {img.year_taken || "Historisch"}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-background hover:bg-background/20 hover:text-background"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </Button>

          {lightbox > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 text-background hover:bg-background/20 hover:text-background"
              onClick={() => setLightbox(lightbox - 1)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {lightbox < images.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 text-background hover:bg-background/20 hover:text-background"
              onClick={() => setLightbox(lightbox + 1)}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          <div className="flex max-h-[80vh] max-w-3xl flex-col items-center gap-4">
            <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-lg">
              <Image
                src={images[lightbox].image_url}
                alt={images[lightbox].caption || "Locatie afbeelding"}
                fill
                className="object-contain"
                sizes="80vw"
              />
            </div>
            {images[lightbox].caption && (
              <p className="text-center text-sm text-background/80">
                {images[lightbox].caption}
                {images[lightbox].year_taken && ` (${images[lightbox].year_taken})`}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
