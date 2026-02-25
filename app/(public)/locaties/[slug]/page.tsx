import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { MapPin, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationImages } from "@/components/location-images"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function LocationDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: location } = await supabase
    .from("locations")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!location) notFound()

  const { data: images } = await supabase
    .from("location_images")
    .select("*")
    .eq("location_id", location.id)
    .order("display_order")

  const { data: quizQuestions } = await supabase
    .from("quiz_questions")
    .select("id")
    .eq("location_id", location.id)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:py-12">
      <Link href="/locaties">
        <Button variant="ghost" size="sm" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Alle Locaties
        </Button>
      </Link>

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <Badge variant="secondary" className="mb-3 bg-secondary/10 text-secondary">
            <MapPin className="mr-1 h-3 w-3" />
            Stop {location.order_number}
          </Badge>
          <h1 className="font-serif text-3xl font-bold text-primary md:text-4xl text-balance">
            {location.name}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            {location.description}
          </p>
        </div>

        {/* Historical images */}
        {images && images.length > 0 && (
          <LocationImages images={images} />
        )}

        {/* Historical information */}
        {location.historical_info && (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-xl">
                <Calendar className="h-5 w-5 text-secondary" />
                Historische Informatie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-stone max-w-none">
                <p className="leading-relaxed text-foreground/80 whitespace-pre-line">
                  {location.historical_info}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz link */}
        {quizQuestions && quizQuestions.length > 0 && (
          <Card className="border-secondary/30 bg-secondary/5">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h3 className="font-serif text-lg font-semibold text-secondary">
                  Test je kennis
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Er {quizQuestions.length === 1 ? "is" : "zijn"}{" "}
                  {quizQuestions.length}{" "}
                  {quizQuestions.length === 1 ? "vraag" : "vragen"} over deze
                  locatie.
                </p>
              </div>
              <Link href={`/quiz?location=${location.id}`}>
                <Button variant="secondary" className="gap-2">
                  Start Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
