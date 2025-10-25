# signQA

A server-rendered Next.js experience for exploring questions organised by the SIGN framework. Apply component, difficulty, status, and tag filters to curate purposeful question sets backed by a reusable filtering system and JSON API.

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) to interact with the explorer.

## Key features

- **SIGN framework categorisation** – Every question is mapped to Strategy, Implementation, Governance, or Networking components with visual badges.
- **Multi-dimensional filtering** – Combine categories, difficulty levels, status, and arbitrary tags. Filters are reflected in the URL and fully server-rendered for SEO.
- **Reusable filter components** – Modular checkbox and pill filter primitives support consistent UX across future pages.
- **API-first architecture** – `/api/questions` accepts the same query parameters as the UI and responds with filtered results and facet summaries.
- **SSR-friendly design** – Listing pages parse query parameters, render on the server, and hydrate client controls without sacrificing performance.

## API usage

```
GET /api/questions?category=Strategy&difficulty=Advanced&status=published&tag=Value
```

Query parameters accept repeated values (e.g. `?category=Strategy&category=Governance`) or comma-delimited collections. The response includes:

```json
{
  "filters": { /* active filters */ },
  "summary": { /* facet counts for each filter category */ },
  "questions": [ /* filtered question list */ ]
}
```

## Project structure

```
app/
  api/questions/route.ts    # API route powering filterable data access
  layout.tsx                # Root layout and global metadata
  page.tsx                  # SIGN question explorer with SSR filters
components/
  filters/                  # Reusable filter UI primitives
  CategoryBadge.tsx
  QuestionCard.tsx
lib/
  questions.ts              # In-memory dataset and metadata constants
  filtering.ts              # Filtering, parsing, and facet helpers
```

This foundation is ready for integration with a real data source, additional pages, or expanded SIGN content catalogues.
