# signQA

A collaborative Q&A experience for developers built with Next.js, Prisma, and a markdown-first editing workflow. The app demonstrates authenticated CRUD flows for questions, answers, and comments with syntax highlighted previews and lightweight rate limiting.

## Getting started

```bash
npm install
npm run dev
```

The development server runs on [http://localhost:3000](http://localhost:3000).

### Demo accounts

Authentication is simulated with a small pool of demo users. Use the account switcher in the header to impersonate different authors. All API requests send the required `x-user-id` header automatically.

| User            | Email             |
|-----------------|-------------------|
| Ada Lovelace    | ada@example.com   |
| Grace Hopper    | grace@example.com |
| Alan Turing     | alan@example.com  |

## Features

- **Questions & answers** — full CRUD API implemented with Prisma and exposed via Next.js route handlers.
- **Markdown editor** — live preview with GitHub-flavored markdown and syntax highlighted code blocks.
- **Question detail view** — rich metadata, threaded answers, contextual comments, and related content suggestions.
- **Authorization rules** — edit/delete actions restricted to the original author of the post.
- **Rate limiting** — basic throttling to prevent abuse of create/update/delete operations.

## Tech stack

- [Next.js 14](https://nextjs.org/) with the App Router
- [Prisma](https://www.prisma.io/) ORM (SQLite development database)
- [React Markdown](https://github.com/remarkjs/react-markdown) + [rehype-highlight](https://github.com/rehypejs/rehype-highlight)
- [Zod](https://zod.dev/) for input validation

## Database

The Prisma schema is stored in `prisma/schema.prisma` and uses a local SQLite database (`prisma/dev.db`). The client is generated automatically via the `postinstall` script, but you can regenerate it manually:

```bash
npm run prisma:generate
```

To evolve the schema you can create a new migration:

```bash
npm run prisma:migrate -- --name your_migration_name
```
