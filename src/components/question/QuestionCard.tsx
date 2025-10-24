import Link from "next/link";

import { formatRelative } from "@/lib/format";

import styles from "./QuestionCard.module.css";

type QuestionCardProps = {
  question: {
    id: number;
    title: string;
    summary: string | null;
    tags: string | null;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    answers: { id: number }[];
    author: {
      id: number;
      name: string;
      avatarUrl: string | null;
    };
  };
};

export function QuestionCard({ question }: QuestionCardProps) {
  const hasUpdates = question.updatedAt.getTime() - question.createdAt.getTime() > 60_000;
  const tags = question.tags
    ?.split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <article className={styles.card}>
      <div className={styles.meta}>
        <div className={styles.avatar}>
          {question.author.avatarUrl ? (
            <img src={question.author.avatarUrl} alt={question.author.name} />
          ) : (
            <span>{question.author.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div>
          <p className={styles.author}>{question.author.name}</p>
          <p className={styles.time}>
            asked {formatRelative(question.createdAt)}
            {hasUpdates && ` • edited ${formatRelative(question.updatedAt)}`}
          </p>
        </div>
      </div>

      <Link href={`/questions/${question.id}`} className={styles.title}>
        {question.title}
      </Link>

      <p className={styles.summary}>
        {question.summary ?? question.content.slice(0, 140)}
        {question.content.length > 140 && "…"}
      </p>

      <div className={styles.footer}>
        <span className={styles.answerCount}>{question.answers.length} answers</span>
        <div className={styles.tags}>
          {tags?.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
