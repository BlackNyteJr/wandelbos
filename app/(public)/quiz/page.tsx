import { createClient } from "@/lib/supabase/server"
import { QuizGame } from "@/components/quiz-game"

interface Props {
  searchParams: Promise<{ location?: string }>
}

export default async function QuizPage({ searchParams }: Props) {
  const { location } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("quiz_questions")
    .select("*, locations(name)")
    .order("created_at")

  if (location) {
    query = query.eq("location_id", location)
  }

  const { data: questions } = await query

  const { data: locations } = await supabase
    .from("locations")
    .select("id, name")
    .order("order_number")

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-primary md:text-4xl">
          Kennisquiz
        </h1>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Test je kennis over de geschiedenis van het Wandelbos.
        </p>
      </div>
      <QuizGame
        questions={questions || []}
        locations={locations || []}
        selectedLocation={location || null}
      />
    </div>
  )
}
