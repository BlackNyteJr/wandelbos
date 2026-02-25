import { createClient } from "@/lib/supabase/server"
import { TrailMap } from "@/components/trail-map"

export default async function MapPage() {
  const supabase = await createClient()
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name, slug, description, latitude, longitude, order_number")
    .order("order_number")

  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <h1 className="font-serif text-3xl font-bold text-primary md:text-4xl">
          Wandelroute Kaart
        </h1>
        <p className="mt-2 text-muted-foreground">
          Bekijk alle locaties op de kaart en plan je wandeling.
        </p>
      </div>
      <div className="relative h-[calc(100vh-14rem)] min-h-[400px] w-full">
        <TrailMap locations={locations || []} />
      </div>
    </div>
  )
}
