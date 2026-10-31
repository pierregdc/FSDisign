"use client";

import { useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { CanvaToolbar } from "@/features/canva";
import { cn } from "@/lib/utils";

type QuizBlockData = Extract<UIBlock, { type: "quiz" }>;

export function QuizBlockView({ block }: { block: QuizBlockData }) {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const questions = block.questions;
  const currentQ = questions[currentQuestionIndex];

  // Calcul du score en direct
  const score = useMemo(() => {
    let correctCount = 0;
    for (const q of questions) {
      const selectedOptId = userAnswers[q.id];
      const correctOpt = q.options.find((opt) => opt.correct);
      if (selectedOptId && correctOpt && selectedOptId === correctOpt.id) {
        correctCount++;
      }
    }
    return correctCount;
  }, [questions, userAnswers]);

  const percentage = Math.round((score / questions.length) * 100);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (userAnswers[questionId]) return; // Empêcher de tricher après réponse
    setUserAnswers({ ...userAnswers, [questionId]: optionId });
  };

  const handleReset = () => {
    setUserAnswers({});
    setShowResults(false);
    setCurrentQuestionIndex(0);
  };

  // Génération de code HTML autonome pour export d'application mini-jeu / quiz
  const interactiveHtmlContent = useMemo(() => {
    return `<div class="max-w-xl mx-auto space-y-6">
      <div class="text-center">
        <h2 class="text-xl font-bold">${block.title || "Questionnaire d'évaluation"}</h2>
        <p class="text-slate-600 text-sm mt-1">${block.description || ""}</p>
      </div>
      <div class="space-y-6">
        ${questions
          .map(
            (q, i) => `
          <div class="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <p class="font-semibold text-sm mb-3">Question ${i + 1} : ${q.question}</p>
            <div class="space-y-2">
              ${q.options
                .map(
                  (opt) => `
                <div class="p-2.5 rounded-lg border border-slate-200 bg-white text-xs ${
                  opt.correct ? "font-semibold text-emerald-700" : ""
                }">
                  ${opt.label} ${opt.correct ? "(Réponse correcte)" : ""}
                </div>`
                )
                .join("")}
            </div>
            ${q.explanation ? `<p class="mt-3 text-xs text-slate-500 italic">💡 ${q.explanation}</p>` : ""}
          </div>`
          )
          .join("")}
      </div>
    </div>`;
  }, [block, questions]);

  return (
    <div className="space-y-3">
      {/* Barre d'outils Canva */}
      <CanvaToolbar
        title={block.title || "Questionnaire interactif (QCM)"}
        jsonData={block}
        htmlContent={interactiveHtmlContent}
      />

      <div className="rounded-2xl border border-line bg-card p-4 sm:p-5 shadow-xs">
        {/* En-tête */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" />
              <span>{block.title || "Questionnaire interactif & Quiz"}</span>
            </h3>
            {block.description && (
              <p className="mt-0.5 text-xs text-muted leading-relaxed">{block.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
              {score} / {questions.length} ({percentage}%)
            </span>
            <button
              type="button"
              onClick={handleReset}
              title="Recommencer le questionnaire"
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-line bg-panel px-2 text-[11px] font-medium text-muted hover:text-ink transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Recommencer</span>
            </button>
          </div>
        </div>

        {/* Barre de progression des questions */}
        <div className="mb-4 flex items-center justify-between text-xs text-muted">
          <span>
            Question <span className="font-bold text-ink">{currentQuestionIndex + 1}</span> sur {questions.length}
          </span>
          <div className="flex items-center gap-1">
            {questions.map((q, i) => {
              const answered = Boolean(userAnswers[q.id]);
              const correct = userAnswers[q.id] === q.options.find((o) => o.correct)?.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === currentQuestionIndex ? "w-6 bg-accent" : "w-2",
                    answered ? (correct ? "bg-emerald-500" : "bg-rose-500") : "bg-line"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Question active */}
        {currentQ && (
          <div className="rounded-xl border border-line bg-panel p-4 sm:p-5">
            <p className="text-sm font-bold text-ink mb-4">{currentQ.question}</p>

            {/* Options de réponse */}
            <div className="space-y-2">
              {currentQ.options.map((option) => {
                const selected = userAnswers[currentQ.id] === option.id;
                const isAnswered = Boolean(userAnswers[currentQ.id]);
                const isCorrect = option.correct;

                let stateClasses = "border-line bg-card hover:border-accent/40 text-ink";
                if (isAnswered) {
                  if (isCorrect) {
                    stateClasses = "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
                  } else if (selected && !isCorrect) {
                    stateClasses = "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300";
                  } else {
                    stateClasses = "border-line/40 bg-card/40 text-faint opacity-60";
                  }
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, option.id)}
                    disabled={isAnswered}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left text-xs transition-all flex items-center justify-between",
                      stateClasses
                    )}
                  >
                    <span>{option.label}</span>
                    {isAnswered && (
                      <span>
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : selected ? (
                          <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        ) : null}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explication pédagogique */}
            {userAnswers[currentQ.id] && currentQ.explanation && (
              <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-ink animate-fade-in flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-accent text-[11px] uppercase tracking-wider">
                    Explication pédagogique
                  </p>
                  <p className="mt-0.5 text-muted leading-relaxed">{currentQ.explanation}</p>
                </div>
              </div>
            )}

            {/* Navigation suivante */}
            <div className="mt-5 flex justify-between items-center border-t border-line pt-3">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                disabled={currentQuestionIndex === 0}
                className="text-xs font-medium text-muted hover:text-ink disabled:opacity-45 disabled:cursor-not-allowed transition-colors px-2.5 py-1 rounded-lg border border-line/60 disabled:border-line/20"
              >
                Précédente
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                  className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-strong transition-colors"
                >
                  <span>Suivante</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResults(true)}
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  Voir mon score
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal / Bilan de fin de quiz */}
        {showResults && (
          <div className="mt-4 rounded-xl border border-line bg-panel p-5 text-center animate-fade-in">
            <Sparkles className="mx-auto h-8 w-8 text-accent mb-2" />
            <h4 className="text-base font-bold text-ink">Bilan du Quiz</h4>
            <p className="text-2xl font-black text-accent mt-1">
              {score} / {questions.length} ({percentage}%)
            </p>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              {percentage >= 80
                ? "Excellent travail ! Vous maîtrisez parfaitement ces notions."
                : percentage >= 50
                  ? "Bon résultat ! Révisez les quelques questions manquées pour viser 100%."
                  : "Prenez le temps de relire les explications pédagogiques et réessayez !"}
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-strong"
            >
              Recommencer le test
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
