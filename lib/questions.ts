export type FrameworkComponent = "Strategy" | "Implementation" | "Governance" | "Networking";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type QuestionStatus = "draft" | "published" | "archived" | "in_review";

export interface Question {
  id: string;
  title: string;
  body: string;
  category: FrameworkComponent;
  difficulty: Difficulty;
  tags: string[];
  status: QuestionStatus;
  createdAt: string;
}

export const frameworkComponents: FrameworkComponent[] = [
  "Strategy",
  "Implementation",
  "Governance",
  "Networking"
];

export const difficulties: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

export const statuses: QuestionStatus[] = ["draft", "in_review", "published", "archived"];

export const statusLabels: Record<QuestionStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  published: "Published",
  archived: "Archived"
};

export const tagPalette = [
  "AI",
  "Data",
  "Metrics",
  "Operations",
  "Culture",
  "Stakeholders",
  "Growth",
  "Risks",
  "Value",
  "Infrastructure",
  "Change Management",
  "Compliance"
];

export const QUESTIONS: Question[] = [
  {
    id: "q-001",
    title: "How does the initiative support the organisation's long-term vision?",
    body: "Detail how this proposal ladders up to the corporate strategy and identify the horizons it touches.",
    category: "Strategy",
    difficulty: "Beginner",
    tags: ["Growth", "Value"],
    status: "published",
    createdAt: "2024-01-05T08:30:00.000Z"
  },
  {
    id: "q-002",
    title: "What metrics signal success during rollout?",
    body: "List leading and lagging indicators that will let us know the implementation is on track.",
    category: "Implementation",
    difficulty: "Intermediate",
    tags: ["Metrics", "Operations"],
    status: "in_review",
    createdAt: "2024-01-12T14:00:00.000Z"
  },
  {
    id: "q-003",
    title: "Which governance controls are required before launch?",
    body: "Outline the approvals, safeguards, and compliance guardrails we must evidence prior to releasing anything externally.",
    category: "Governance",
    difficulty: "Advanced",
    tags: ["Compliance", "Risks"],
    status: "draft",
    createdAt: "2024-02-01T09:15:00.000Z"
  },
  {
    id: "q-004",
    title: "How will we activate the partner ecosystem?",
    body: "Describe how existing alliances can accelerate adoption and where new relationships are essential.",
    category: "Networking",
    difficulty: "Intermediate",
    tags: ["Stakeholders", "Growth"],
    status: "published",
    createdAt: "2024-02-18T11:45:00.000Z"
  },
  {
    id: "q-005",
    title: "What data foundations are prerequisites?",
    body: "Explain the datasets, integrations, and stewardship required to enable the solution at scale.",
    category: "Implementation",
    difficulty: "Advanced",
    tags: ["Data", "Infrastructure"],
    status: "published",
    createdAt: "2024-02-25T10:20:00.000Z"
  },
  {
    id: "q-006",
    title: "Where are the cultural pressure points?",
    body: "Identify behaviours that need to be reinforced or evolved to make sure the work sticks.",
    category: "Strategy",
    difficulty: "Intermediate",
    tags: ["Culture", "Change Management"],
    status: "in_review",
    createdAt: "2024-03-03T13:00:00.000Z"
  },
  {
    id: "q-007",
    title: "What is the escalation path for critical incidents?",
    body: "Describe the governance cadence and decision rights when unexpected events occur.",
    category: "Governance",
    difficulty: "Intermediate",
    tags: ["Risks", "Operations"],
    status: "published",
    createdAt: "2024-03-14T16:25:00.000Z"
  },
  {
    id: "q-008",
    title: "How do we protect customer and partner data?",
    body: "Detail privacy, data residency, and regulatory requirements that shape the execution approach.",
    category: "Governance",
    difficulty: "Advanced",
    tags: ["Compliance", "Data"],
    status: "archived",
    createdAt: "2024-03-26T07:40:00.000Z"
  },
  {
    id: "q-009",
    title: "Who are the must-have storytellers?",
    body: "List the internal champions and external advocates required to build momentum.",
    category: "Networking",
    difficulty: "Beginner",
    tags: ["Stakeholders", "Culture"],
    status: "in_review",
    createdAt: "2024-04-02T12:10:00.000Z"
  },
  {
    id: "q-010",
    title: "How do we sunset redundant capabilities?",
    body: "Explain the run-down plan for legacy tools and how we will keep teams productive during the change.",
    category: "Implementation",
    difficulty: "Intermediate",
    tags: ["Operations", "Change Management"],
    status: "draft",
    createdAt: "2024-04-10T17:55:00.000Z"
  },
  {
    id: "q-011",
    title: "Which value pools are we prioritising?",
    body: "Identify the financial and non-financial value sources and how they will be measured.",
    category: "Strategy",
    difficulty: "Advanced",
    tags: ["Value", "Metrics"],
    status: "published",
    createdAt: "2024-04-18T09:05:00.000Z"
  },
  {
    id: "q-012",
    title: "What dependencies exist on upstream platforms?",
    body: "Surface cross-team dependencies and contractual obligations that might shape delivery.",
    category: "Networking",
    difficulty: "Advanced",
    tags: ["Infrastructure", "Risks"],
    status: "published",
    createdAt: "2024-04-30T18:45:00.000Z"
  }
];

export const allTags = Array.from(
  QUESTIONS.reduce((set, question) => {
    question.tags.forEach((tag) => set.add(tag));
    return set;
  }, new Set<string>())
).sort((a, b) => a.localeCompare(b));
