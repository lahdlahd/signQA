import Link from "next/link";

import { AnswerForm } from "@/components/forms/AnswerForm";
import { CommentForm } from "@/components/forms/CommentForm";
import { MarkdownPreview } from "@/components/markdown/MarkdownPreview";
import { formatRelative } from "@/lib/format";

import { AnswerActions } from "./AnswerActions";
import { QuestionActions } from "./QuestionActions";

import styles from "./QuestionDetailView.module.css";
import type { Answer, Comment, Question, User } from "@prisma/client";

type CommentWithAuthor = Comment & { author: User };

type AnswerWithAuthor = Answer & {
  author: User;
  comments: CommentWithAuthor[];
};

type QuestionWithRelations = Question & {
  author: User;
  comments: CommentWithAuthor[];
  answers: AnswerWithAuthor[];
};

type RelatedQuestion = {
  id: number;
  title: string;
  createdAt: Date;
};

type QuestionDetailViewProps = {
  question: QuestionWithRelations;
  relatedQuestions: RelatedQuestion[];
};

function renderTags(value: string | null) {
  if (!value) {
    return [] as string[];
  }

  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function QuestionDetailView({ question, relatedQuestions }: QuestionDetailViewProps) {
  const tags = renderTags(question.tags);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <p className={styles.meta}>
            Asked {formatRelative(question.createdAt)} by <span>{question.author.name}</span>
            {question.updatedAt > question.createdAt && (
              <> • edited {formatRelative(question.updatedAt)}</>
            )}
          </p>
          <h1 className={styles.title}>{question.title}</h1>
          {question.summary && <p className={styles.summary}>{question.summary}</p>}
          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <QuestionActions questionId={question.id} authorId={question.authorId} />
      </header>

      <section>
        <MarkdownPreview content={question.content} />
      </section>

      <section className={styles.commentsSection}>
        <h2>Comments</h2>
        {question.comments.length === 0 ? (
          <p className={styles.empty}>No comments yet.</p>
        ) : (
          <ul className={styles.commentList}>
            {question.comments.map((comment) => (
              <li key={comment.id} className={styles.commentItem}>
                <p className={styles.commentBody}>{comment.body}</p>
                <p className={styles.commentMeta}>
                  {comment.author.name} • {formatRelative(comment.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <CommentForm questionId={question.id} />
      </section>

      <section className={styles.answersSection}>
        <div className={styles.answersHeader}>
          <h2>
            {question.answers.length} {question.answers.length === 1 ? "Answer" : "Answers"}
          </h2>
        </div>

        {question.answers.length === 0 ? (
          <p className={styles.empty}>There are no answers yet. Share what you know!</p>
        ) : (
          <div className={styles.answerList}>
            {question.answers.map((answer) => (
              <article key={answer.id} className={styles.answerCard}>
                <div className={styles.answerMeta}>
                  <div className={styles.answerAuthorAvatar}>
                    {answer.author.avatarUrl ? (
                      <img src={answer.author.avatarUrl} alt={answer.author.name} />
                    ) : (
                      <span>{answer.author.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className={styles.answerAuthor}>{answer.author.name}</p>
                    <p className={styles.answerTime}>answered {formatRelative(answer.createdAt)}</p>
                  </div>
                </div>
                <MarkdownPreview content={answer.content} />
                <AnswerActions
                  answerId={answer.id}
                  questionId={question.id}
                  authorId={answer.authorId}
                  content={answer.content}
                />

                <div className={styles.answerComments}>
                  <h3>Comments</h3>
                  {answer.comments.length === 0 ? (
                    <p className={styles.empty}>No comments on this answer yet.</p>
                  ) : (
                    <ul className={styles.commentList}>
                      {answer.comments.map((comment) => (
                        <li key={comment.id} className={styles.commentItem}>
                          <p className={styles.commentBody}>{comment.body}</p>
                          <p className={styles.commentMeta}>
                            {comment.author.name} • {formatRelative(comment.createdAt)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                  <CommentForm answerId={answer.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.answerComposer}>
        <h2>Your Answer</h2>
        <AnswerForm questionId={question.id} />
      </section>

      <aside className={styles.relatedPanel}>
        <h3>Related questions</h3>
        {relatedQuestions.length === 0 ? (
          <p className={styles.empty}>Nothing related yet.</p>
        ) : (
          <ul className={styles.relatedList}>
            {relatedQuestions.map((item) => (
              <li key={item.id}>
                <Link href={`/questions/${item.id}`}>{item.title}</Link>
                <span>{formatRelative(item.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
