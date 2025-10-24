# signQA

Community Q&A prototype demonstrating voting, reputation, and light-weight moderation flows for sign language learners and experts. The project is intentionally lightweight and splits the backend API and frontend experience into separate folders.

## Project structure

```
.
├── backend        # Express API with in-memory data store
├── frontend       # Static web client consuming the API
├── .gitignore
└── README.md
```

### Backend

* **Tech**: Node.js, Express, CORS
* **Features**:
  * Vote on questions or answers with duplicate vote prevention
  * Reputation updates for both content authors and down-voting users
  * Flagging workflow with tracked reporters and content owners
  * Admin dashboard endpoint for moderation teams

#### Getting started

```bash
cd backend
npm install
npm start
```

The API boots at `http://localhost:4000`. Key routes include:

* `GET /api/questions` – question catalogue with answers, votes, and flag counts
* `POST /api/questions/:id/votes` – up/downvote a question
* `POST /api/answers/:id/votes` – up/downvote an answer
* `POST /api/flags` – flag content for moderation
* `GET /api/admin/dashboard` – moderation and reputation overview

The data store currently seeds from `backend/data/defaultData.json` and keeps state in-memory for simplicity.

### Frontend

* **Tech**: Plain HTML/CSS/JS (no bundler required)
* **Features**:
  * Vote controls with optimistic updates and automatic reconciliation
  * Reputation badges beside authors across questions and answers
  * Flagging prompts for moderation with inline feedback
  * Admin-only dashboard readout of flagged content and top contributors

#### Getting started

Serve the files in the `frontend` directory with any static HTTP server (or open `index.html` directly while the backend is running on `http://localhost:4000`). Update fetch origins if you host the API on a different port or domain.

---

This scaffold is designed for iteration—extend the data store, plug in a real database, or integrate authentication as the platform evolves.
