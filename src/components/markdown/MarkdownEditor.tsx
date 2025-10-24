"use client";

import { useState, type ChangeEvent } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import styles from "./MarkdownEditor.module.css";

type MarkdownEditorProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  required?: boolean;
};

export function MarkdownEditor({
  id,
  label,
  value,
  onChange,
  placeholder,
  minRows = 12,
  required = false
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={mode === "edit" ? styles.activeToggle : styles.toggle}
            onClick={() => setMode("edit")}
          >
            Edit
          </button>
          <button
            type="button"
            className={mode === "preview" ? styles.activeToggle : styles.toggle}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <textarea
          id={id}
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={minRows}
          required={required}
        />
      ) : (
        <div className={styles.preview}>
          {value.trim().length === 0 ? (
            <p className={styles.placeholder}>Nothing to preview yet.</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {value}
            </ReactMarkdown>
          )}
        </div>
      )}
    </div>
  );
}
