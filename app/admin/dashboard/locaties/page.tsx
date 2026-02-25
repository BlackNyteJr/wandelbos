import { createClient } from "@/lib/supabase/server"
import { LocationsManager } from "@/components/admin/locations-manager"

export default async function AdminLocationsPage() {
  const supabase = await createClient()
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .order("order_number")

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-primary">Locaties Beheren</h1>
      <p className="mt-1 text-muted-foreground">
        Voeg locaties toe, bewerk of verwijder ze.
      </p>
      <div className="mt-8">
        <LocationsManager locations={locations || []} />
      </div>
    </div>
  )
}
