"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/components/layout/AuthProvider";
import { commentSchema, type CommentInput } from "@/lib/validation";

import styles from "./CommentForm.module.css";

type CommentFormProps = {
  questionId?: number;
  answerId?: number;
  mode?: "create" | "edit";
  commentId?: number;
  initialValue?: string;
  onComplete?: () => void;
};

type ValidationErrors = Partial<Record<keyof CommentInput, string>>;

type SubmitState = "idle" | "submitting" | "success" | "error";

export function CommentForm({
  questionId,
  answerId,
  mode = "create",
  commentId,
  initialValue = "",
  onComplete
}: CommentFormProps) {
  const router = useRouter();
  const { authedFetch } = useAuth();

  const [body, setBody] = useState(initialValue);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    setSubmitState("submitting");

    const payload = commentSchema.safeParse({ body });
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

    let endpoint = "";
    if (mode === "edit") {
      endpoint = `/api/comments/${commentId}`;
    } else if (answerId) {
      endpoint = `/api/answers/${answerId}/comments`;
    } else if (questionId) {
      endpoint = `/api/questions/${questionId}/comments`;
    } else {
      setServerError("Missing association for comment");
      setSubmitState("error");
      return;
    }

    const response = await authedFetch(endpoint, {
      method: mode === "edit" ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload.data)
    });

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
        setServerError(data.error ?? "Unable to save comment.");
      } catch (error) {
        console.error(error);
        setServerError("Unable to save comment.");
      }
      return;
    }

    setSubmitState("success");
    if (mode === "create") {
      setBody("");
    }
    router.refresh();
    onComplete?.();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label} htmlFor={commentId ? `comment-${commentId}` : "new-comment"}>
        {mode === "edit" ? "Edit comment" : "Add a comment"}
      </label>
      <textarea
        id={commentId ? `comment-${commentId}` : "new-comment"}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Keep it constructive and on-topic"
        rows={3}
        required
      />
      {validationErrors.body && <p className={styles.error}>{validationErrors.body}</p>}
      {serverError && <p className={styles.serverError}>{serverError}</p>}
      <div className={styles.actions}>
        <button type="submit" disabled={submitState === "submitting"}>
          {submitState === "submitting" ? "Saving…" : mode === "edit" ? "Update" : "Comment"}
        </button>
      </div>
    </form>
  );
}
