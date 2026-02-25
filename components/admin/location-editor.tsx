"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUploader } from "./image-uploader"

type Location = {
  id: string
  name: string
  slug: string
  description: string
  historical_info: string
  latitude: number
  longitude: number
  order_number: number
  panorama_url: string | null
}

export function LocationEditor({
  location,
  onSave,
  onCancel,
}: {
  location?: Location
  onSave: () => void
  onCancel: () => void
}) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: location?.name ?? "",
    slug: location?.slug ?? "",
    description: location?.description ?? "",
    historical_info: location?.historical_info ?? "",
    latitude: location?.latitude ?? 51.5855,
    longitude: location?.longitude ?? 4.7936,
    order_number: location?.order_number ?? 1,
    panorama_url: location?.panorama_url ?? "",
  })

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const data = {
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      order_number: Number(form.order_number),
      panorama_url: form.panorama_url || null,
    }

    if (location) {
      await supabase.from("locations").update(data).eq("id", location.id)
    } else {
      await supabase.from("locations").insert(data)
    }

    setSaving(false)
    onSave()
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif">
          {location ? "Locatie bewerken" : "Nieuwe locatie"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Naam</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value
                setForm((f) => ({
                  ...f,
                  name,
                  slug: location ? f.slug : generateSlug(name),
                }))
              }}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="historical_info">Historische informatie</Label>
            <Textarea
              id="historical_info"
              rows={8}
              value={form.historical_info}
              onChange={(e) =>
                setForm((f) => ({ ...f, historical_info: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="latitude">Breedtegraad</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) =>
                  setForm((f) => ({ ...f, latitude: Number(e.target.value) }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="longitude">Lengtegraad</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) =>
                  setForm((f) => ({ ...f, longitude: Number(e.target.value) }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="order_number">Volgorde</Label>
              <Input
                id="order_number"
                type="number"
                value={form.order_number}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    order_number: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="panorama_url">360° Panorama URL</Label>
              <Input
                id="panorama_url"
                value={form.panorama_url ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, panorama_url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </div>

          {location && (
            <div className="flex flex-col gap-2">
              <Label>Afbeeldingen</Label>
              <ImageUploader locationId={location.id} />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuleren
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
