"use client";

import { useId, useState, type FormEvent } from "react";
import { CheckCircle2, ClipboardList, Send } from "lucide-react";
import type { UIBlock } from "@/lib/ui-schema";
import { cn } from "@/lib/utils";

type FormBlock = Extract<UIBlock, { type: "form" }>;

function initialValues(block: FormBlock) {
  return Object.fromEntries(
    block.fields.map((field) => [
      field.name,
      field.defaultValue ??
        (field.type === "select" ? field.options?.[0] ?? "" : ""),
    ])
  ) as Record<string, string>;
}

export function FormBlockView({
  block,
  onPrompt,
  disabled = false,
}: {
  block: FormBlock;
  onPrompt: (prompt: string) => void;
  disabled?: boolean;
}) {
  const baseId = useId();
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(block));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (name: string, value: string) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  };

  const buildMessage = () => {
    const template = block.promptTemplate?.trim();
    if (template) {
      return template.replace(
        /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g,
        (_match, key: string) => values[key]?.trim() || "—"
      );
    }

    const lines = block.fields.map(
      (field) => `- ${field.label} : ${values[field.name]?.trim() || "—"}`
    );
    return [block.title ? `${block.title} :` : "Informations :", ...lines].join("\n");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || submitted) return;

    const nextErrors: Record<string, string> = {};
    for (const field of block.fields) {
      if (field.required && !values[field.name]?.trim()) {
        nextErrors[field.name] = "Ce champ est nécessaire.";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitted(true);
    onPrompt(buildMessage());
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-line bg-ink/[0.02] p-5"
      noValidate
    >
      <div className="flex items-start gap-2">
        <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <div>
          <p className="text-sm font-medium text-ink">{block.title ?? "Formulaire"}</p>
          {block.description ? (
            <p className="mt-1 text-xs leading-relaxed text-muted">{block.description}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {block.fields.map((field) => {
          const fieldId = `${baseId}-${field.name}`;
          const errorId = `${fieldId}-error`;
          const error = errors[field.name];
          const commonClass = cn(
            "w-full rounded-xl border bg-canvas/60 px-3.5 py-2.5 text-sm text-ink placeholder:text-faint/70 outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-60",
            error ? "border-rose-300" : "border-line"
          );

          return (
            <div key={field.name}>
              <label
                htmlFor={fieldId}
                className="mb-1.5 block text-xs font-medium text-muted"
              >
                {field.label}
                {field.required ? <span className="ml-1 text-accent">*</span> : null}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  id={fieldId}
                  name={field.name}
                  value={values[field.name] ?? ""}
                  onChange={(event) => update(field.name, event.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={disabled || submitted}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  rows={3}
                  className={cn(commonClass, "resize-y")}
                />
              ) : field.type === "select" ? (
                <select
                  id={fieldId}
                  name={field.name}
                  value={values[field.name] ?? ""}
                  onChange={(event) => update(field.name, event.target.value)}
                  required={field.required}
                  disabled={disabled || submitted}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  className={cn(commonClass, "appearance-none")}
                >
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={fieldId}
                  name={field.name}
                  type={field.type === "number" ? "number" : "text"}
                  value={values[field.name] ?? ""}
                  onChange={(event) => update(field.name, event.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={disabled || submitted}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  className={commonClass}
                />
              )}

              {error ? (
                <p id={errorId} className="mt-1.5 text-xs text-rose-600">
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {submitted ? (
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-100 px-3.5 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-200"
          >
            <CheckCircle2 className="h-4 w-4" />
            Brief envoyé · Modifier
          </button>
        ) : (
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_-12px_rgba(1,57,183,0.8)] transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {block.submitLabel ?? "Envoyer"}
          </button>
        )}
        <span className="text-[11px] text-faint">Les valeurs restent dans cette conversation.</span>
      </div>
    </form>
  );
}
