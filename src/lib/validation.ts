import { z } from "zod";

export const questionSchema = z.object({
  title: z
    .string()
    .min(8, "Title should be at least 8 characters long")
    .max(160, "Title cannot exceed 160 characters"),
  content: z
    .string()
    .min(30, "Please provide more detail in the question body")
    .max(20000, "Question content is too long"),
  summary: z
    .string()
    .max(280, "Summary cannot exceed 280 characters")
    .optional()
    .or(z.literal("")),
  tags: z
    .string()
    .max(120, "Tag list cannot exceed 120 characters")
    .optional()
    .or(z.literal(""))
});

export type QuestionInput = z.infer<typeof questionSchema>;

export const answerSchema = z.object({
  content: z
    .string()
    .min(20, "Answer should be at least 20 characters long")
    .max(20000, "Answer content is too long")
});

export type AnswerInput = z.infer<typeof answerSchema>;

export const commentSchema = z.object({
  body: z
    .string()
    .min(6, "Comment should be at least 6 characters")
    .max(400, "Comment cannot exceed 400 characters")
});

export type CommentInput = z.infer<typeof commentSchema>;
