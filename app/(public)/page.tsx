import Link from "next/link"
import { Map, TreePine, Camera, HelpCircle, QrCode, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: QrCode,
    title: "QR-Codes Scannen",
    description:
      "Scan de QR-codes bij elke locatie en ontdek de fascinerende geschiedenis van het Wandelbos.",
  },
  {
    icon: Map,
    title: "Interactieve Kaart",
    description:
      "Bekijk de volledige wandelroute op een digitale kaart en zie waar je bent.",
  },
  {
    icon: Camera,
    title: "Historische Foto's",
    description:
      "Vergelijk oude en nieuwe foto's en ontdek hoe het bos door de jaren heen is veranderd.",
  },
  {
    icon: HelpCircle,
    title: "Kennisquiz",
    description:
      "Test je kennis over de geschiedenis met leuke quizzen voor alle leeftijden.",
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-primary">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('/placeholder.svg?height=800&width=1200')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground">
            <TreePine className="h-4 w-4" />
            Historische Wandelroute
          </div>
          <h1 className="font-serif text-4xl font-bold leading-tight text-primary-foreground md:text-6xl text-balance">
            Ontdek de Geschiedenis van het Wandelbos
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
            Wandel door eeuwen geschiedenis. Scan QR-codes, bekijk historische
            foto{"'"}s en test je kennis langs een prachtige bosroute.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/kaart">
              <Button size="lg" variant="secondary" className="gap-2">
                <Map className="h-5 w-5" />
                Bekijk de Kaart
              </Button>
            </Link>
            <Link href="/locaties">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Alle Locaties
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold text-primary md:text-4xl text-balance">
            Beleef het Verleden
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
            Het Wandelbos biedt een unieke manier om de lokale geschiedenis te
            ontdekken, met moderne technologie en traditionele verhalen.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="border-border/60 bg-card transition-shadow hover:shadow-md"
              >
                <CardContent className="flex flex-col items-start gap-3 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                    <Icon className="h-5 w-5 text-secondary" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-accent/50">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center md:py-24">
          <h2 className="font-serif text-3xl font-bold text-primary md:text-4xl text-balance">
            Klaar om te Wandelen?
          </h2>
          <p className="max-w-lg text-muted-foreground leading-relaxed">
            Pak je telefoon, volg de route en ontdek verborgen verhalen op elke
            stap van het pad.
          </p>
          <Link href="/kaart">
            <Button size="lg" className="gap-2">
              <Map className="h-5 w-5" />
              Start de Route
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
