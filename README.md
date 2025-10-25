# signQA authentication starter

A secure foundation for signQA with credential-based authentication, optional OAuth providers, and rich user profile management. The stack combines **Next.js 14 (App Router)**, **Auth.js/NextAuth v5**, **Prisma**, and **SQLite** for rapid iteration with production-ready patterns.

## Features

- 🔐 Username/email + password authentication with bcrypt hashing
- 🌐 Optional GitHub OAuth provider via Auth.js (NextAuth) v5
- 🗂️ Prisma adapter with database-backed sessions
- 👤 User profile model with display name, bio, and expertise fields
- 🛡️ Protected routes (middleware + API guards) for dashboard/profile flows
- 📝 Comprehensive API validation powered by Zod
- 📘 Documentation-driven setup with `.env` template and migration workflow

## Project structure

```
src/
  app/
    (auth)/            // Login & registration routes
    api/               // Auth + profile management APIs
    dashboard/         // Authenticated landing experience
    profile/           // Profile editor (protected)
  components/
    auth/              // Client-side auth forms
    layout/            // Navigation header
    profile/           // Profile management form
  lib/
    prisma.ts          // Prisma client helper
  auth.ts              // Centralised Auth.js configuration
prisma/
  schema.prisma        // Database schema
  migrations/          // Generated migrations
```

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Bootstrap environment variables**

   Copy the provided template and then edit values as required:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   | --- | --- |
   | `DATABASE_URL` | Connection string used by Prisma. Defaults to the bundled SQLite database (`file:./dev.db`). |
   | `AUTH_SECRET` | Required by Auth.js to encrypt cookies/tokens. Generate one via `openssl rand -base64 32`. |
   | `NEXTAUTH_URL` | Base URL of the application (e.g. `http://localhost:3000`). |
   | `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth credentials (optional). Omit to disable the GitHub sign-in button. |

3. **Generate the Prisma client and apply migrations**

   ```bash
   npx prisma migrate dev
   ```

   This creates `prisma/dev.db` (ignored by git) and ensures the schema is in sync.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to explore the app.

## Authentication & authorisation

- **Credential flow** – Users register via `/register`. Passwords are hashed with `bcryptjs` before storage. Sign-ins accept either the username or the email address.
- **OAuth flow** – GitHub is configured out of the box. Provide `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` to surface the sign-in button. Additional providers can be added in `src/auth.ts`.
- **Sessions** – Stored in the database using the Prisma adapter, enabling server-side session lookups and middleware guards.
- **Protected routes** – `middleware.ts` enforces auth on `/dashboard`, `/profile`, and `/api/profile`. Unauthenticated visitors are redirected to `/login`. Authenticated users visiting `/login` or `/register` are sent to `/dashboard`.
- **API guards** – Server routes call `auth()` to verify sessions before performing privileged operations.

## User profile management

Profiles extend the default Auth.js `User` model with the following fields:

- `displayName`
- `bio`
- `expertise`

The `/profile` page exposes a rich form that PATCHes to `/api/profile`, ensuring only authenticated users can update their information. The dashboard renders a summary of the stored profile data.

## Running Prisma Studio (optional)

Inspect or edit the local database using:

```bash
npx prisma studio
```

## Future enhancements

- Add additional OAuth providers (e.g. Google, Azure AD) by extending the providers array in `src/auth.ts`.
- Expand the profile model with social links, avatars, or role management.
- Swap SQLite for PostgreSQL/MySQL by updating `DATABASE_URL` and running a new migration.

---

With this baseline in place, you can focus on building signQA’s domain features while relying on dependable authentication and profile tooling.
