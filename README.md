# signQA data layer

This repository defines the initial PostgreSQL data model for the signQA knowledge base. It uses [Prisma](https://www.prisma.io/) to manage schema definitions, migrations, and seeds for common Q&A entities such as users, questions, answers, categories, tags, votes, and supporting metadata.

## Prerequisites

- **Node.js** v18 or later
- **npm** (comes bundled with Node.js)
- **PostgreSQL** 13 or later

## Environment configuration

1. Duplicate the sample environment file:
   ```bash
   cp .env.example .env
   ```
2. Update the `DATABASE_URL` to point at your PostgreSQL instance. The default example assumes a database named `signqa` with the `public` schema.

The connection string should follow the format:

```
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=<schema>"
```

## Install dependencies

```bash
npm install
```

This installs Prisma CLI tooling and the generated Prisma Client.

## Working with the database

- Generate the Prisma client after making changes to `prisma/schema.prisma`:
  ```bash
  npm run prisma:generate
  ```
- Apply migrations to your local database:
  ```bash
  npm run prisma:migrate:dev
  ```
- Deploy migrations in non-development environments:
  ```bash
  npm run prisma:migrate:deploy
  ```
- Seed baseline lookup data (difficulty levels, SIGN-aligned categories, and default tags):
  ```bash
  npm run prisma:seed
  ```

## Schema highlights

### Enums
- `SignCategory`: `STRATEGY`, `IMPLEMENTATION`, `GOVERNANCE`, `NURTURE`
- `Difficulty`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`
- `ActivityType`: Tracks lifecycle actions on questions and answers

### Core models
- `User`: Authors, contributors, and moderators
- `Category`: Topic groupings with optional alignment to the SIGN framework
- `Tag`: Additional free-form classification labels
- `Question`: Q&A prompts, difficulty, SIGN category, and publishing metadata
- `Answer`: Responses linked back to questions and authors
- `UseCase`: Ordered usage scenarios for each question
- `ExternalReference`: External resources that support question content
- `QuestionVote` / `AnswerVote`: Voting records for engagement tracking
- `DifficultyLevel`: Supplemental metadata for each difficulty enum
- `Activity`: Centralized audit trail for Q&A interactions

### Relations and timestamps
All major entities contain `createdAt` and `updatedAt` fields for bookkeeping. Questions track `lastActivityAt` to mirror engagement, while activities link back to questions, answers, and users where applicable.

## Project structure

```
prisma/
├── migrations/                # SQL migrations generated from the Prisma schema
│   └── 20241024131500_init/
│       └── migration.sql
├── schema.prisma              # Source of truth for the data model
└── seed.js                    # Database seeding script
```

Future application layers can import the generated Prisma Client to query against this schema. For additional model changes, update `schema.prisma`, regenerate the client, and create a new migration.
