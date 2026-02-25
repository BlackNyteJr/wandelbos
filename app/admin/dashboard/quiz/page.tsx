import { QuizManager } from "@/components/admin/quiz-manager"

export default function AdminQuizPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">
          Quiz Beheer
        </h1>
        <p className="text-muted-foreground mt-1">
          Beheer quizvragen per locatie en per leeftijdscategorie.
        </p>
      </div>
      <QuizManager />
    </div>
  )
}
