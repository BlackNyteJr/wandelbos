"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle, Trophy, RotateCcw, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  difficulty: string
  locations?: { name: string } | null
}

interface Location {
  id: string
  name: string
}

interface Props {
  questions: Question[]
  locations: Location[]
  selectedLocation: string | null
}

export function QuizGame({ questions, locations, selectedLocation }: Props) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<(boolean | null)[]>(
    questions.map(() => null)
  )
  const [finished, setFinished] = useState(false)
  const [ageGroup, setAgeGroup] = useState<string>("adult")
  const [playerName, setPlayerName] = useState("")

  const current = questions[currentIndex]

  const handleAnswer = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    const correct = index === current.correct_answer
    if (correct) setScore((s) => s + 1)
    const newAnswers = [...answers]
    newAnswers[currentIndex] = correct
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelected(null)
    } else {
      setFinished(true)
      // Save score
      const supabase = createClient()
      supabase.from("quiz_scores").insert({
        player_name: playerName || "Anoniem",
        score,
        total_questions: questions.length,
        age_group: ageGroup,
      })
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelected(null)
    setScore(0)
    setAnswers(questions.map(() => null))
    setFinished(false)
  }

  if (questions.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-muted-foreground">
            Er zijn nog geen quizvragen beschikbaar
            {selectedLocation ? " voor deze locatie" : ""}.
          </p>
          {selectedLocation && (
            <Button variant="outline" onClick={() => router.push("/quiz")}>
              Alle vragen bekijken
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <Card className="border-border/60">
        <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
          <Trophy className="h-16 w-16 text-secondary" />
          <div>
            <h2 className="font-serif text-2xl font-bold text-primary">
              Quiz Voltooid!
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Je score: {score} / {questions.length} ({percentage}%)
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {percentage >= 80 && "Uitstekend! Je kent het Wandelbos goed!"}
            {percentage >= 50 && percentage < 80 && "Goed gedaan! Er valt nog wat te ontdekken."}
            {percentage < 50 && "Geen zorgen, wandel nog eens langs de locaties!"}
          </div>
          <Button onClick={handleRestart} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Opnieuw Spelen
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedLocation || "all"}
            onValueChange={(val) =>
              router.push(val === "all" ? "/quiz" : `/quiz?location=${val}`)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Locatie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle locaties</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={ageGroup} onValueChange={setAgeGroup}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="child">Kind</SelectItem>
            <SelectItem value="teen">Tiener</SelectItem>
            <SelectItem value="adult">Volwassene</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-secondary transition-all"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Question */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={
                current.difficulty === "easy"
                  ? "border-secondary/50 text-secondary"
                  : current.difficulty === "hard"
                    ? "border-destructive/50 text-destructive"
                    : "border-primary/50 text-primary"
              }
            >
              {current.difficulty === "easy"
                ? "Makkelijk"
                : current.difficulty === "hard"
                  ? "Moeilijk"
                  : "Gemiddeld"}
            </Badge>
          </div>
          <CardTitle className="font-serif text-xl leading-relaxed">
            {current.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {current.options.map((option: string, i: number) => {
            let variant: "outline" | "default" | "destructive" | "secondary" =
              "outline"
            let extraClass = "justify-start text-left h-auto py-3 px-4"
            if (selected !== null) {
              if (i === current.correct_answer) {
                variant = "secondary"
                extraClass += " ring-2 ring-secondary"
              } else if (i === selected && i !== current.correct_answer) {
                variant = "destructive"
              }
            }
            return (
              <Button
                key={i}
                variant={variant}
                className={extraClass}
                onClick={() => handleAnswer(i)}
                disabled={selected !== null}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                  {selected !== null && i === current.correct_answer && (
                    <CheckCircle2 className="ml-auto h-5 w-5" />
                  )}
                  {selected !== null && i === selected && i !== current.correct_answer && (
                    <XCircle className="ml-auto h-5 w-5" />
                  )}
                </span>
              </Button>
            )
          })}

          {selected !== null && (
            <Button onClick={handleNext} className="mt-4">
              {currentIndex < questions.length - 1
                ? "Volgende Vraag"
                : "Resultaten Bekijken"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
