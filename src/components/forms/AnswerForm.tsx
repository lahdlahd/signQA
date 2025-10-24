"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";
import { useAuth } from "@/components/layout/AuthProvider";
import { answerSchema, type AnswerInput } from "@/lib/validation";

import styles from "./AnswerForm.module.css";

type AnswerFormProps = {
  questionId: number;
  mode?: "create" | "edit";
  answerId?: number;
  initialValue?: string;
  onComplete?: () => void;
};

type ValidationErrors = Partial<Record<keyof AnswerInput, string>>;

type SubmitState = "idle" | "submitting" | "success" | "error";

export function AnswerForm({
  questionId,
  mode = "create",
  answerId,
  initialValue = "",
  onComplete
}: AnswerFormProps) {
  const router = useRouter();
  const { authedFetch } = useAuth();

  const [content, setContent] = useState(initialValue);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    setSubmitState("submitting");

    const payload = answerSchema.safeParse({ content });
    if (!payload.success) {
      const fieldErrors: ValidationErrors = {};
      for (const issue of payload.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          fieldErrors[field as keyof ValidationErrors] = issue.message;
        }
      }
      setValidationErrors(fieldErrors);
      setSubmitState("error");
      return;
    }

    setValidationErrors({});

    const response = await authedFetch(
      mode === "create"
        ? `/api/questions/${questionId}/answers`
        : `/api/answers/${answerId}`,
      {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload.data)
      }
    );

    if (!response.ok) {
      setSubmitState("error");
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        setServerError(
          retryAfter
            ? `Rate limit exceeded. Try again in ${retryAfter} seconds.`
            : "Rate limit exceeded. Please try again later."
        );
        return;
      }

      try {
        const data = await response.json();
        setServerError(data.error ?? "Unable to save answer.");
      } catch (error) {
        console.error(error);
        setServerError("Unable to save answer.");
      }
      return;
    }

    setSubmitState("success");
    if (mode === "create") {
      setContent("");
    }
    router.refresh();
    onComplete?.();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <MarkdownEditor
        id={mode === "create" ? "new-answer" : `answer-${answerId}`}
        label={mode === "create" ? "Your answer" : "Edit answer"}
        value={content}
        onChange={setContent}
        placeholder="Share your solution with markdown and runnable snippets"
        required
        minRows={8}
      />
      {validationErrors.content && <p className={styles.error}>{validationErrors.content}</p>}
      {serverError && <p className={styles.serverError}>{serverError}</p>}
      <div className={styles.actions}>
        <button type="submit" disabled={submitState === "submitting"}>
          {submitState === "submitting" ? "Submitting…" : mode === "create" ? "Post answer" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
