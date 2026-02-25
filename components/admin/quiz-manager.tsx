"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"

type Question = {
  id: string
  location_id: string
  question: string
  options: string[]
  correct_answer: number
  difficulty: string
}

type Location = {
  id: string
  name: string
}

export function QuizManager() {
  const supabase = createClient()
  const [locations, setLocations] = useState<Location[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [editing, setEditing] = useState<Question | null>(null)
  const [isNew, setIsNew] = useState(false)

  const loadLocations = useCallback(async () => {
    const { data } = await supabase
      .from("locations")
      .select("id, name")
      .order("order_number")
    if (data) setLocations(data)
  }, [supabase])

  const loadQuestions = useCallback(async () => {
    let query = supabase.from("quiz_questions").select("*")
    if (selectedLocation !== "all") {
      query = query.eq("location_id", selectedLocation)
    }
    const { data } = await query.order("created_at")
    if (data) setQuestions(data)
  }, [supabase, selectedLocation])

  useEffect(() => {
    loadLocations()
  }, [loadLocations])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  function startNew() {
    setIsNew(true)
    setEditing({
      id: "",
      location_id: locations[0]?.id ?? "",
      question: "",
      options: ["", "", "", ""],
      correct_answer: 0,
      difficulty: "easy",
    })
  }

  async function saveQuestion() {
    if (!editing) return
    const payload = {
      location_id: editing.location_id,
      question: editing.question,
      options: editing.options,
      correct_answer: editing.correct_answer,
      difficulty: editing.difficulty,
    }

    if (isNew) {
      await supabase.from("quiz_questions").insert(payload)
    } else {
      await supabase
        .from("quiz_questions")
        .update(payload)
        .eq("id", editing.id)
    }
    setEditing(null)
    setIsNew(false)
    loadQuestions()
  }

  async function deleteQuestion(id: string) {
    await supabase.from("quiz_questions").delete().eq("id", id)
    loadQuestions()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter op locatie" />
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
        <Button onClick={startNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nieuwe vraag
        </Button>
      </div>

      {editing && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="font-serif text-lg">
              {isNew ? "Nieuwe vraag" : "Vraag bewerken"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Locatie</Label>
                <Select
                  value={editing.location_id}
                  onValueChange={(v) =>
                    setEditing({ ...editing, location_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Moeilijkheid</Label>
                <Select
                  value={editing.difficulty}
                  onValueChange={(v) =>
                    setEditing({ ...editing, difficulty: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Makkelijk (6-9 jaar)</SelectItem>
                    <SelectItem value="medium">Gemiddeld (10-14 jaar)</SelectItem>
                    <SelectItem value="hard">Moeilijk (15+ jaar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Vraag</Label>
              <Input
                value={editing.question}
                onChange={(e) =>
                  setEditing({ ...editing, question: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Antwoorden</Label>
              {editing.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={editing.correct_answer === i}
                    onChange={() =>
                      setEditing({ ...editing, correct_answer: i })
                    }
                    className="accent-primary"
                  />
                  <Input
                    value={opt}
                    placeholder={`Antwoord ${i + 1}`}
                    onChange={(e) => {
                      const opts = [...editing.options]
                      opts[i] = e.target.value
                      setEditing({ ...editing, options: opts })
                    }}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Selecteer het juiste antwoord met het bolletje.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(null)
                  setIsNew(false)
                }}
              >
                Annuleren
              </Button>
              <Button onClick={saveQuestion}>Opslaan</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {questions.map((q) => (
          <Card key={q.id} className="border-border">
            <CardContent className="flex items-start justify-between gap-4 pt-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{q.question}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {q.options.map((opt, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 rounded-md ${
                        i === q.correct_answer
                          ? "bg-primary/20 text-primary font-medium"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {opt}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  {q.difficulty === "easy"
                    ? "Makkelijk"
                    : q.difficulty === "medium"
                    ? "Gemiddeld"
                    : "Moeilijk"}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(q)
                    setIsNew(false)
                  }}
                >
                  Bewerken
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => deleteQuestion(q.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">Verwijder vraag</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {questions.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            Geen quizvragen gevonden.
          </p>
        )}
      </div>
    </div>
  )
}
