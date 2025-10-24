import { QuestionCard } from "@/components/question/QuestionCard";

import styles from "./QuestionList.module.css";

type QuestionListProps = {
  questions: Array<React.ComponentProps<typeof QuestionCard>["question"]>;
};

export function QuestionList({ questions }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No questions yet</h2>
        <p>Be the first to ask something! Use the Ask page to create a question.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
}
