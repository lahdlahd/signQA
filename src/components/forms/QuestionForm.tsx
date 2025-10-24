"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";
import { useAuth } from "@/components/layout/AuthProvider";
import { questionSchema, type QuestionInput } from "@/lib/validation";

import styles from "./QuestionForm.module.css";

type QuestionFormProps = {
  mode: "create" | "edit";
  questionId?: number;
  initialValues?: {
    title: string;
    content: string;
    summary?: string | null;
    tags?: string | null;
  };
};

type ValidationErrors = Partial<Record<keyof QuestionInput, string>>;

type SubmitState = "idle" | "submitting" | "success" | "error";

export function QuestionForm({ mode, questionId, initialValues }: QuestionFormProps) {
  const router = useRouter();
  const { authedFetch } = useAuth();

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [summary, setSummary] = useState(initialValues?.summary ?? "");
  const [tags, setTags] = useState(initialValues?.tags ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    setSubmitState("submitting");

    const formValues = { title, summary, tags, content };
    const result = questionSchema.safeParse(formValues);

    if (!result.success) {
      const fieldErrors: ValidationErrors = {};
      for (const issue of result.error.issues) {
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
      mode === "create" ? "/api/questions" : `/api/questions/${questionId}`,
      {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(result.data)
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
        const payload = await response.json();
        setServerError(payload.error ?? "Unable to save question.");
      } catch (error) {
        console.error(error);
        setServerError("Unable to save question.");
      }
      return;
    }

    setSubmitState("success");

    const payload = await response.json();
    const destinationId = payload.id ?? questionId;
    router.push(`/questions/${destinationId}`);
    router.refresh();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What problem are you trying to solve?"
          required
        />
        {validationErrors.title && <p className={styles.error}>{validationErrors.title}</p>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="summary">Summary</label>
        <textarea
          id="summary"
          value={summary ?? ""}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Optional high-level overview for the list view"
          rows={3}
        />
        {validationErrors.summary && <p className={styles.error}>{validationErrors.summary}</p>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="tags">Tags</label>
        <input
          id="tags"
          type="text"
          value={tags ?? ""}
          onChange={(event) => setTags(event.target.value)}
          placeholder="comma separated tags"
        />
        <p className={styles.helpText}>Use up to 5 comma separated tags to help others find your question.</p>
        {validationErrors.tags && <p className={styles.error}>{validationErrors.tags}</p>}
      </div>

      <MarkdownEditor
        id="content"
        label="Question details"
        value={content}
        onChange={setContent}
        placeholder="Explain the context, what you tried, and share minimal code snippets using markdown."
        required
      />
      {validationErrors.content && <p className={styles.error}>{validationErrors.content}</p>}

      {serverError && <div className={styles.serverError}>{serverError}</div>}

      <div className={styles.actions}>
        <button type="submit" disabled={submitState === "submitting"}>
          {submitState === "submitting"
            ? "Saving…"
            : mode === "create"
              ? "Publish question"
              : "Update question"}
        </button>
      </div>
    </form>
  );
}
