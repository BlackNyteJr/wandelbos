"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Upload, ImageIcon } from "lucide-react"

type LocationImage = {
  id: string
  image_url: string
  caption: string | null
  year_taken: string | null
  order_number: number
}

export function ImageUploader({ locationId }: { locationId: string }) {
  const supabase = createClient()
  const [images, setImages] = useState<LocationImage[]>([])
  const [uploading, setUploading] = useState(false)

  const loadImages = useCallback(async () => {
    const { data } = await supabase
      .from("location_images")
      .select("*")
      .eq("location_id", locationId)
      .order("order_number")
    if (data) setImages(data)
  }, [supabase, locationId])

  useEffect(() => {
    loadImages()
  }, [loadImages])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split(".").pop()
    const fileName = `${locationId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("location-images")
      .upload(fileName, file)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      setUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("location-images").getPublicUrl(fileName)

    await supabase.from("location_images").insert({
      location_id: locationId,
      image_url: publicUrl,
      order_number: images.length + 1,
    })

    await loadImages()
    setUploading(false)
  }

  async function handleDelete(image: LocationImage) {
    const path = image.image_url.split("location-images/").pop()
    if (path) {
      await supabase.storage.from("location-images").remove([path])
    }
    await supabase.from("location_images").delete().eq("id", image.id)
    await loadImages()
  }

  async function updateCaption(id: string, caption: string) {
    await supabase.from("location_images").update({ caption }).eq("id", id)
    setImages((imgs) =>
      imgs.map((img) => (img.id === id ? { ...img, caption } : img))
    )
  }

  async function updateYear(id: string, year_taken: string) {
    await supabase
      .from("location_images")
      .update({ year_taken })
      .eq("id", id)
    setImages((imgs) =>
      imgs.map((img) => (img.id === id ? { ...img, year_taken } : img))
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative rounded-lg overflow-hidden border border-border bg-muted"
          >
            <img
              src={img.image_url}
              alt={img.caption || "Locatie afbeelding"}
              className="w-full h-32 object-cover"
            />
            <div className="p-2 flex flex-col gap-1">
              <Input
                placeholder="Bijschrift"
                defaultValue={img.caption ?? ""}
                onBlur={(e) => updateCaption(img.id, e.target.value)}
                className="text-xs h-7"
              />
              <Input
                placeholder="Jaar (bijv. 1920)"
                defaultValue={img.year_taken ?? ""}
                onBlur={(e) => updateYear(img.id, e.target.value)}
                className="text-xs h-7"
              />
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => handleDelete(img)}
            >
              <Trash2 className="h-3 w-3" />
              <span className="sr-only">Verwijder afbeelding</span>
            </Button>
          </div>
        ))}
      </div>

      <Label
        htmlFor={`upload-${locationId}`}
        className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-lg p-4 hover:bg-muted transition-colors justify-center"
      >
        {uploading ? (
          <span className="text-sm text-muted-foreground">Uploaden...</span>
        ) : (
          <>
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Afbeelding uploaden
            </span>
          </>
        )}
        <Input
          id={`upload-${locationId}`}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleUpload}
          disabled={uploading}
        />
      </Label>

      {images.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          <p className="text-sm">Nog geen afbeeldingen</p>
        </div>
      )}
    </div>
  )
}
