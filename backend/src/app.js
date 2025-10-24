const express = require('express');
const cors = require('cors');

const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/questions', (_req, res, next) => {
  try {
    const questions = store.listQuestions();
    res.json({ questions });
  } catch (error) {
    next(error);
  }
});

app.post('/api/questions/:questionId/votes', (req, res, next) => {
  const { questionId } = req.params;
  const { userId, value } = req.body;

  try {
    const result = store.voteOnEntity('question', questionId, userId, value);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post('/api/answers/:answerId/votes', (req, res, next) => {
  const { answerId } = req.params;
  const { userId, value } = req.body;

  try {
    const result = store.voteOnEntity('answer', answerId, userId, value);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get('/api/users', (_req, res, next) => {
  try {
    res.json({ users: store.listUsers() });
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/:userId', (req, res, next) => {
  try {
    const profile = store.getUserProfile(req.params.userId);
    res.json({ user: profile });
  } catch (error) {
    next(error);
  }
});

app.post('/api/flags', (req, res, next) => {
  const { entityType, entityId, userId, reason } = req.body;

  try {
    const flag = store.flagEntity({ entityType, entityId, userId, reason });
    res.status(201).json({ flag });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/flags', (_req, res, next) => {
  try {
    res.json({ flags: store.getFlaggedEntities() });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/dashboard', (_req, res, next) => {
  try {
    res.json({ dashboard: store.getAdminDashboard() });
  } catch (error) {
    next(error);
  }
});

app.use((err, _req, res, _next) => {
  const status = err.statusCode || 400;
  res.status(status).json({
    error: err.message || 'Unexpected error',
    details: err.details
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`signQA backend listening on port ${PORT}`);
  });
}

module.exports = app;
