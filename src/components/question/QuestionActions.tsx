"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/layout/AuthProvider";

import styles from "./QuestionActions.module.css";

type QuestionActionsProps = {
  questionId: number;
  authorId: number;
};

export function QuestionActions({ questionId, authorId }: QuestionActionsProps) {
  const router = useRouter();
  const { currentUser, authedFetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentUser.id !== authorId) {
    return null;
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this question?");
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);
    const response = await authedFetch(`/api/questions/${questionId}`, {
      method: "DELETE"
    });
    setLoading(false);

    if (!response.ok) {
      try {
        const payload = await response.json();
        setError(payload.error ?? "Unable to delete question.");
      } catch (error) {
        console.error(error);
        setError("Unable to delete question.");
      }
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className={styles.actions}>
      <Link href={`/questions/${questionId}/edit`} className={styles.editButton}>
        Edit
      </Link>
      <button className={styles.deleteButton} onClick={handleDelete} disabled={loading}>
        {loading ? "Deleting…" : "Delete"}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
