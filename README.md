# signQA knowledge hub

This repository contains a lightweight knowledge base and use case explorer for sign.global. It ships as a static site so you can review curated documentation, common implementation questions, and real-world playbooks without any build tooling.

## Features

- **Curated documentation modules** surface relevant sign.global docs alongside each knowledge base category and question.
- **Question detail pages** highlight actionable guidance and link straight into the use case explorer.
- **Use case explorer** groups real implementations by sector, supports multi-tag filtering, and renders rich MDX-style content with media.
- **Structured content** lives in JSON/MDX-inspired data files so future updates are a matter of editing content instead of code.

## Project structure

```
public/
  index.html              # Entry point for the knowledge base
  question.html           # Question detail view with doc references
  use-case-explorer.html  # Interactive use case explorer with filters
  data/
    knowledge-base.json   # Categories, questions, and documentation modules
    useCases.json         # Use case definitions, media, metrics, and resources
  scripts/
    data-service.js       # Shared data loading helpers
    questions-page.js     # Knowledge base category rendering
    question-detail.js    # Question detail controller
    use-case-explorer.js  # Filter logic and use case rendering
    components.js         # UI helpers for shared components
    mdx.js                # Minimal MDX-to-HTML renderer for rich content
  styles/
    main.css              # Styling for the entire experience
```

## Getting started

1. Open the `public/index.html` file in your browser to explore the knowledge base.
2. Navigate to a question to see the detailed answer, documentation module, and related use cases.
3. Jump into `public/use-case-explorer.html` to filter playbooks by sector or tags.

Because everything is static, no additional dependencies or build steps are required. Update the JSON content files to keep the knowledge base and explorer fresh.
