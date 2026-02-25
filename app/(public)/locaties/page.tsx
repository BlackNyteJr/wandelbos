import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function LocationsPage() {
  const supabase = await createClient()
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .order("order_number")

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-primary md:text-4xl">
          Locaties
        </h1>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Ontdek alle historische locaties langs de wandelroute.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations?.map((location) => (
          <Link key={location.id} href={`/locaties/${location.slug}`}>
            <Card className="h-full border-border/60 transition-all hover:shadow-md hover:border-primary/30">
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="bg-secondary/10 text-secondary"
                  >
                    <MapPin className="mr-1 h-3 w-3" />
                    Stop {location.order_number}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <h2 className="font-serif text-xl font-semibold">
                  {location.name}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {location.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {(!locations || locations.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-lg text-muted-foreground">
            Er zijn nog geen locaties toegevoegd.
          </p>
        </div>
      )}
    </div>
  )
}
