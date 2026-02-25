"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"

interface Location {
  id: string
  name: string
  slug: string
  description: string | null
  historical_info: string | null
  latitude: number
  longitude: number
  order_number: number
  panorama_url: string | null
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function LocationsManager({ locations: initialLocations }: { locations: Location[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    historical_info: "",
    latitude: "0",
    longitude: "0",
    order_number: "0",
    panorama_url: "",
  })

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      historical_info: "",
      latitude: "0",
      longitude: "0",
      order_number: "0",
      panorama_url: "",
    })
    setEditing(null)
  }

  const openEdit = (loc: Location) => {
    setEditing(loc)
    setForm({
      name: loc.name,
      slug: loc.slug,
      description: loc.description || "",
      historical_info: loc.historical_info || "",
      latitude: String(loc.latitude),
      longitude: String(loc.longitude),
      order_number: String(loc.order_number),
      panorama_url: loc.panorama_url || "",
    })
    setDialogOpen(true)
  }

  const openNew = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setLoading(true)
    const supabase = createClient()
    const data = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description || null,
      historical_info: form.historical_info || null,
      latitude: parseFloat(form.latitude) || 0,
      longitude: parseFloat(form.longitude) || 0,
      order_number: parseInt(form.order_number) || 0,
      panorama_url: form.panorama_url || null,
    }

    if (editing) {
      await supabase.from("locations").update(data).eq("id", editing.id)
    } else {
      await supabase.from("locations").insert(data)
    }

    setDialogOpen(false)
    resetForm()
    setLoading(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze locatie wilt verwijderen?")) return
    const supabase = createClient()
    await supabase.from("locations").delete().eq("id", id)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Nieuwe Locatie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editing ? "Locatie Bewerken" : "Nieuwe Locatie"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Naam</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: editing ? form.slug : slugify(e.target.value),
                    })
                  }
                  placeholder="Naam van de locatie"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Slug (URL)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="de-oude-eik"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Beschrijving</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Korte beschrijving van de locatie"
                  rows={2}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Historische Informatie</Label>
                <Textarea
                  value={form.historical_info}
                  onChange={(e) => setForm({ ...form, historical_info: e.target.value })}
                  placeholder="Uitgebreide historische informatie..."
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Breedtegraad</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Lengtegraad</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Volgorde</Label>
                  <Input
                    type="number"
                    value={form.order_number}
                    onChange={(e) => setForm({ ...form, order_number: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Panorama URL</Label>
                  <Input
                    value={form.panorama_url}
                    onChange={(e) => setForm({ ...form, panorama_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Annuleren
                </Button>
                <Button onClick={handleSave} disabled={loading || !form.name}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Opslaan..." : "Opslaan"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {initialLocations.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nog geen locaties. Klik op &quot;Nieuwe Locatie&quot; om te beginnen.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {initialLocations.map((loc) => (
            <Card key={loc.id} className="border-border/60">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-serif font-bold text-primary">
                  {loc.order_number}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{loc.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {loc.description || "Geen beschrijving"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(loc)}
                    aria-label="Bewerken"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(loc.id)}
                    className="text-destructive hover:text-destructive"
                    aria-label="Verwijderen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
