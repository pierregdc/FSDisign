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

type NormalizedQuestion = {
  id: string;
  question: string;
  explanation?: string;
  options: {
    id: string;
    label: string;
    correct?: boolean;
  }[];
};

export function QuizBlockView({ block }: { block: QuizBlockData }) {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Normalisation tolérante : gère block.questions[] OU block.question (format unitaire)
  const questions = useMemo<NormalizedQuestion[]>(() => {
    if (Array.isArray(block.questions) && block.questions.length > 0) {
      return block.questions.map((q) => ({
        id: q.id,
        question: q.question,
        explanation: q.explanation,
        options: q.options.map((opt) => ({
          id: opt.id,
          label: opt.label,
          correct: Boolean(opt.correct),
        })),
      }));
    }

    const legacyBlock = block as unknown as {
      question?: string;
      explanation?: string;
      correctOptionId?: string;
      options?: { id: string; label: string; correct?: boolean }[];
    };

    if (legacyBlock.question && Array.isArray(legacyBlock.options)) {
      return [
        {
          id: "q1",
          question: legacyBlock.question,
          explanation: legacyBlock.explanation,
          options: legacyBlock.options.map((opt) => ({
            id: opt.id,
            label: opt.label,
            correct: Boolean(opt.correct ?? (legacyBlock.correctOptionId === opt.id)),
          })),
        },
      ];
    }

    return [
      {
        id: "default-q",
        question: "Questionnaire d'auto-évaluation",
        options: [
          { id: "a", label: "Option A", correct: true },
          { id: "b", label: "Option B", correct: false },
        ],
      },
    ];
  }, [block]);

  const currentQ = questions[currentQuestionIndex] || questions[0];

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

  const totalQuestions = Math.max(1, questions.length);
  const percentage = Math.round((score / totalQuestions) * 100);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (userAnswers[questionId]) return; // Empêcher de tricher après réponse
    setUserAnswers({ ...userAnswers, [questionId]: optionId });
  };

  const handleReset = () => {
    setUserAnswers({});
    setShowResults(false);
    setCurrentQuestionIndex(0);
  };

  // Génération de code HTML autonome pour export Canva
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
          <div class="p-4 rounded-xl bg-slate-50 border-none">
            <p class="font-semibold text-sm mb-3">Question ${i + 1} : ${q.question}</p>
            <div class="space-y-2">
              ${q.options
                .map(
                  (opt) => `
                <div class="p-2.5 rounded-lg bg-white text-xs ${
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
    <div className="w-full space-y-6">
      {/* Barre d'outils Canva (masquée globalement) */}
      <CanvaToolbar
        title={block.title || "Questionnaire interactif (QCM)"}
        jsonData={block}
        htmlContent={interactiveHtmlContent}
      />

      <div className="w-full">
        {/* En-tête épuré sans bordure */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Award className="h-3.5 w-3.5" />
              <span>QCM & Auto-Évaluation</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {block.title || "Test de Connaissances & Validation"}
            </h3>
            {block.description && (
              <p className="mt-1 text-xs text-slate-400 leading-relaxed max-w-xl">
                {block.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-bold text-sky-400 font-mono">
              Score : {score} / {questions.length} ({percentage}%)
            </span>
            <button
              type="button"
              onClick={handleReset}
              title="Recommencer le questionnaire"
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 px-3 text-xs font-medium text-slate-300 hover:text-white transition-all border-none"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>

        {/* Barre de progression fluide */}
        <div className="mb-5 flex items-center justify-between text-xs text-slate-400">
          <span>
            Question <span className="font-bold text-white">{currentQuestionIndex + 1}</span> sur {questions.length}
          </span>
          <div className="flex items-center gap-1.5">
            {questions.map((q, i) => {
              const answered = Boolean(userAnswers[q.id]);
              const correct = userAnswers[q.id] === q.options.find((o) => o.correct)?.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all border-none",
                    i === currentQuestionIndex ? "w-8 bg-sky-400" : "w-2.5",
                    answered ? (correct ? "bg-emerald-500" : "bg-rose-500") : "bg-slate-800"
                  )}
                  title={`Aller à la question ${i + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Question active sans contour général superflu */}
        {currentQ && (
          <div className="w-full space-y-4">
            <div className="w-full">
              <p className="text-base font-bold text-white mb-5 leading-relaxed">
                {currentQ.question}
              </p>

              {/* Options de réponse interactives */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, optIdx) => {
                  const selected = userAnswers[currentQ.id] === option.id;
                  const isAnswered = Boolean(userAnswers[currentQ.id]);
                  const isCorrect = option.correct;

                  let stateClasses = "bg-slate-800/60 hover:bg-slate-800 text-slate-200";
                  if (isAnswered) {
                    if (isCorrect) {
                      stateClasses = "bg-emerald-500/20 text-emerald-300 font-semibold ring-1 ring-emerald-500/50";
                    } else if (selected && !isCorrect) {
                      stateClasses = "bg-rose-500/20 text-rose-300 font-semibold ring-1 ring-rose-500/50";
                    } else {
                      stateClasses = "bg-slate-800/30 text-slate-500 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, option.id)}
                      disabled={isAnswered}
                      className={cn(
                        "w-full rounded-xl p-4 text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 border-none cursor-pointer disabled:cursor-default",
                        stateClasses
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                            isAnswered && isCorrect
                              ? "bg-emerald-500 text-slate-950"
                              : isAnswered && selected && !isCorrect
                                ? "bg-rose-500 text-white"
                                : "bg-slate-700/60 text-slate-300"
                          )}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed">{option.label}</span>
                      </div>

                      {isAnswered && (
                        <span className="shrink-0">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : selected ? (
                            <XCircle className="h-5 w-5 text-rose-400" />
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explication pédagogique */}
              {userAnswers[currentQ.id] && currentQ.explanation && (
                <div className="mt-5 rounded-xl bg-sky-500/10 p-4 text-xs text-slate-200 animate-in fade-in flex items-start gap-3 border-none">
                  <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">
                      Explication pédagogique & Justification
                    </p>
                    <p className="mt-1 text-slate-300 leading-relaxed">{currentQ.explanation}</p>
                  </div>
                </div>
              )}

              {/* Navigation de bas de page */}
              <div className="mt-6 flex justify-between items-center pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 border-none"
                >
                  ← Précédente
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500 transition-all border-none shadow-sm"
                  >
                    <span>Question suivante</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowResults(true)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all border-none shadow-sm"
                  >
                    Voir mon bilan final
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bilan final sans boîte rigide */}
        {showResults && (
          <div className="mt-6 rounded-2xl bg-slate-900/50 p-6 sm:p-8 text-center animate-in fade-in border-none shadow-xl">
            <Sparkles className="mx-auto h-10 w-10 text-amber-400 mb-3" />
            <h4 className="text-lg font-bold text-white">Bilan de l'évaluation</h4>
            <p className="text-3xl font-black text-sky-400 mt-2 font-mono">
              {score} / {questions.length} ({percentage}%)
            </p>
            <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
              {percentage >= 80
                ? "Félicitations ! Vous maîtrisez les concepts clés du programme académique."
                : percentage >= 50
                  ? "Bon résultat d'ensemble ! Révisez les quelques questions manquées pour viser 100%."
                  : "Prenez le temps d'approfondir les fiches méthode associées avant de retenter le test."}
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-5 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-500 transition-all border-none shadow-md"
            >
              Recommencer le questionnaire
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
