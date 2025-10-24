"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AnswerForm } from "@/components/forms/AnswerForm";
import { useAuth } from "@/components/layout/AuthProvider";

import styles from "./AnswerActions.module.css";

type AnswerActionsProps = {
  answerId: number;
  questionId: number;
  authorId: number;
  content: string;
};

export function AnswerActions({ answerId, questionId, authorId, content }: AnswerActionsProps) {
  const router = useRouter();
  const { currentUser, authedFetch } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentUser.id !== authorId) {
    return null;
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this answer?");
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);
    const response = await authedFetch(`/api/answers/${answerId}`, {
      method: "DELETE"
    });
    setLoading(false);

    if (!response.ok) {
      try {
        const payload = await response.json();
        setError(payload.error ?? "Unable to delete answer.");
      } catch (error) {
        console.error(error);
        setError("Unable to delete answer.");
      }
      return;
    }

    router.refresh();
  };

  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        <button type="button" className={styles.editButton} onClick={() => setIsEditing((value) => !value)}>
          {isEditing ? "Cancel" : "Edit"}
        </button>
        <button type="button" className={styles.deleteButton} onClick={handleDelete} disabled={loading}>
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {isEditing && (
        <div className={styles.editorWrapper}>
          <AnswerForm
            questionId={questionId}
            answerId={answerId}
            mode="edit"
            initialValue={content}
            onComplete={() => setIsEditing(false)}
          />
        </div>
      )}
    </div>
  );
}
