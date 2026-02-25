import { createClient } from "@/lib/supabase/server"
import { MapPin, Image, HelpCircle, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: locationCount },
    { count: imageCount },
    { count: questionCount },
    { count: scoreCount },
  ] = await Promise.all([
    supabase.from("locations").select("*", { count: "exact", head: true }),
    supabase.from("location_images").select("*", { count: "exact", head: true }),
    supabase.from("quiz_questions").select("*", { count: "exact", head: true }),
    supabase.from("quiz_scores").select("*", { count: "exact", head: true }),
  ])

  const stats = [
    { label: "Locaties", value: locationCount || 0, icon: MapPin },
    { label: "Afbeeldingen", value: imageCount || 0, icon: Image },
    { label: "Quizvragen", value: questionCount || 0, icon: HelpCircle },
    { label: "Quiz Scores", value: scoreCount || 0, icon: Trophy },
  ]

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-primary">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Beheer het Wandelbos.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
