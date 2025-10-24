const state = {
  users: [],
  questions: [],
  currentUser: null,
  adminData: null
};

const API_BASE =
  window.__SIGNQA_API__ ?? (window.location.protocol === 'file:' ? 'http://localhost:4000' : '');

const notificationEl = document.getElementById('notification');
const userSelectEl = document.getElementById('user-select');
const userProfileEl = document.getElementById('user-profile-body');
const questionListEl = document.getElementById('question-list');
const adminPanelEl = document.getElementById('admin-panel');
const adminBodyEl = document.getElementById('admin-body');
const refreshAdminBtn = document.getElementById('refresh-admin');

userSelectEl.addEventListener('change', (event) => {
  handleUserChange(event).catch((error) => {
    setNotification(error.message, 'error');
  });
});

refreshAdminBtn.addEventListener('click', (event) => {
  event.preventDefault();
  handleRefreshAdmin().catch((error) => setNotification(error.message, 'error'));
});

init().catch((error) => {
  console.error(error);
  setNotification('Failed to initialise the application.', 'error');
});

async function init() {
  await loadUsers();
  await loadQuestions();
  await ensureAdminData();
  renderAll();
  setNotification('Community data loaded.', 'info');
}

async function loadUsers() {
  try {
    const data = await apiFetch('/api/users');
    state.users = data.users || [];
    if (state.currentUser) {
      state.currentUser = state.users.find((user) => user.id === state.currentUser.id) || null;
    }
    if (!state.currentUser && state.users.length) {
      state.currentUser = state.users[0];
    }
  } catch (error) {
    setNotification(error.message, 'error');
    throw error;
  }
}

async function loadQuestions() {
  try {
    const data = await apiFetch('/api/questions');
    state.questions = data.questions || [];
  } catch (error) {
    setNotification(error.message, 'error');
    throw error;
  }
}

async function loadAdminDashboard() {
  if (!state.currentUser || state.currentUser.role !== 'admin') {
    state.adminData = null;
    return;
  }

  const data = await apiFetch('/api/admin/dashboard');
  state.adminData = data.dashboard;
}

async function ensureAdminData() {
  if (state.currentUser && state.currentUser.role === 'admin') {
    await loadAdminDashboard();
  } else {
    state.adminData = null;
  }
}

async function handleUserChange(event) {
  const userId = event.target.value;
  state.currentUser = state.users.find((user) => user.id === userId) || null;
  renderUserProfile();
  renderQuestions();
  await ensureAdminData();
  renderAdminPanel();
  if (state.currentUser) {
    setNotification(`Switched to ${state.currentUser.name}.`, 'info');
  }
}

async function handleRefreshAdmin() {
  await loadAdminDashboard();
  renderAdminPanel();
  setNotification('Moderation dashboard refreshed.', 'success');
}

async function handleVote(entityType, entityId, value) {
  if (!state.currentUser) {
    setNotification('Select a user before voting.', 'error');
    return;
  }

  const snapshot = JSON.parse(JSON.stringify(state.questions));
  const applied = applyOptimisticVote(entityType, entityId, value);
  if (!applied) {
    setNotification('Unable to locate content for voting.', 'error');
    return;
  }

  renderQuestions();

  try {
    const endpoint = entityType === 'question' ? `/api/questions/${entityId}/votes` : `/api/answers/${entityId}/votes`;
    await apiFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.currentUser.id, value })
    });
    await loadQuestions();
    await loadUsers();
    await ensureAdminData();
    renderAll();
    setNotification('Vote recorded.', 'success');
  } catch (error) {
    state.questions = snapshot;
    renderQuestions();
    setNotification(error.message, 'error');
  }
}

async function handleFlag(entityType, entityId) {
  if (!state.currentUser) {
    setNotification('Select a user before flagging.', 'error');
    return;
  }

  const reason = prompt('Why should this content be reviewed?');
  if (!reason) {
    return;
  }

  const snapshot = JSON.parse(JSON.stringify(state.questions));
  const applied = applyOptimisticFlag(entityType, entityId);
  if (!applied) {
    setNotification('Unable to locate content to flag.', 'error');
    return;
  }

  renderQuestions();

  try {
    await apiFetch('/api/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType, entityId, userId: state.currentUser.id, reason })
    });
    await loadQuestions();
    await ensureAdminData();
    renderQuestions();
    renderAdminPanel();
    setNotification('Flag submitted for moderation.', 'success');
  } catch (error) {
    state.questions = snapshot;
    renderQuestions();
    setNotification(error.message, 'error');
  }
}

function resolveUrl(path) {
  if (typeof path !== 'string') {
    return path;
  }
  if (/^https?:/i.test(path)) {
    return path;
  }
  return `${API_BASE}${path}`;
}

async function apiFetch(url, options = {}) {
  const response = await fetch(resolveUrl(url), options);
  if (!response.ok) {
    let message = 'Request failed.';
    try {
      const payload = await response.json();
      message = payload.error || message;
    } catch (parseError) {
      // ignore JSON parse errors
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

function renderAll() {
  renderUserSelector();
  renderUserProfile();
  renderQuestions();
  renderAdminPanel();
}

function renderUserSelector() {
  userSelectEl.innerHTML = '';
  state.users.forEach((user) => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = `${user.name} (${user.role})`;
    if (state.currentUser && state.currentUser.id === user.id) {
      option.selected = true;
    }
    userSelectEl.appendChild(option);
  });
}

function renderUserProfile() {
  userProfileEl.innerHTML = '';
  if (!state.currentUser) {
    userProfileEl.textContent = 'No user selected.';
    return;
  }

  const name = document.createElement('h3');
  name.textContent = state.currentUser.name;

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = `${state.currentUser.role} · ${state.currentUser.reputation} rep`;

  const bio = document.createElement('p');
  bio.textContent = state.currentUser.bio || 'No bio information provided.';

  const statGrid = document.createElement('div');
  statGrid.className = 'stat-grid';

  const stats = state.currentUser.stats || {};
  statGrid.appendChild(createStatCard('Questions', stats.questionsAuthored || 0));
  statGrid.appendChild(createStatCard('Answers', stats.answersAuthored || 0));
  statGrid.appendChild(createStatCard('Helpful answers', stats.positiveAnswers || 0));

  userProfileEl.appendChild(name);
  userProfileEl.appendChild(badge);
  userProfileEl.appendChild(bio);
  userProfileEl.appendChild(statGrid);
}

function renderQuestions() {
  questionListEl.innerHTML = '';

  if (!state.questions.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No questions have been asked yet.';
    questionListEl.appendChild(empty);
    return;
  }

  state.questions.forEach((question) => {
    const card = document.createElement('article');
    card.className = 'question-card';

    const title = document.createElement('h3');
    title.textContent = question.title;

    const body = document.createElement('p');
    body.textContent = question.body;

    const meta = document.createElement('div');
    meta.className = 'question-meta';
    meta.appendChild(createAuthorBadge(question.author));

    const created = document.createElement('span');
    created.textContent = `Asked ${formatDate(question.createdAt)}`;
    meta.appendChild(created);

    if (question.flagCount && question.flagCount > 0) {
      meta.appendChild(createFlagBadge(question.flagCount));
    }

    const actions = document.createElement('div');
    actions.className = 'question-actions';
    actions.appendChild(createVoteControls('question', question.id, question.votes));

    const flagButton = document.createElement('button');
    flagButton.type = 'button';
    flagButton.className = 'button button--danger';
    flagButton.textContent = 'Flag question';
    flagButton.addEventListener('click', () => handleFlag('question', question.id));
    actions.appendChild(flagButton);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(body);
    card.appendChild(actions);

    const answerHeading = document.createElement('h4');
    answerHeading.className = 'section-title';
    answerHeading.textContent = `${question.answers.length} Answer${question.answers.length === 1 ? '' : 's'}`;
    card.appendChild(answerHeading);

    const answerList = document.createElement('ul');
    answerList.className = 'answer-list';

    question.answers.forEach((answer) => {
      const item = document.createElement('li');
      item.className = 'answer-card';

      const answerBody = document.createElement('p');
      answerBody.textContent = answer.body;

      const answerMeta = document.createElement('div');
      answerMeta.className = 'answer-meta';
      answerMeta.appendChild(createAuthorBadge(answer.author));

      const answeredOn = document.createElement('span');
      answeredOn.textContent = `Answered ${formatDate(answer.createdAt)}`;
      answerMeta.appendChild(answeredOn);

      if (answer.flagCount && answer.flagCount > 0) {
        answerMeta.appendChild(createFlagBadge(answer.flagCount));
      }

      const answerActions = document.createElement('div');
      answerActions.className = 'answer-actions';
      answerActions.appendChild(createVoteControls('answer', answer.id, answer.votes));

      const answerFlagButton = document.createElement('button');
      answerFlagButton.type = 'button';
      answerFlagButton.className = 'button button--danger';
      answerFlagButton.textContent = 'Flag answer';
      answerFlagButton.addEventListener('click', () => handleFlag('answer', answer.id));
      answerActions.appendChild(answerFlagButton);

      item.appendChild(answerMeta);
      item.appendChild(answerBody);
      item.appendChild(answerActions);
      answerList.appendChild(item);
    });

    if (!question.answers.length) {
      const emptyAnswer = document.createElement('li');
      emptyAnswer.className = 'answer-card';
      emptyAnswer.textContent = 'No answers yet.';
      answerList.appendChild(emptyAnswer);
    }

    card.appendChild(answerList);
    questionListEl.appendChild(card);
  });
}

function renderAdminPanel() {
  if (!state.currentUser || state.currentUser.role !== 'admin') {
    adminPanelEl.classList.add('hidden');
    adminBodyEl.innerHTML = '';
    return;
  }

  adminPanelEl.classList.remove('hidden');
  adminBodyEl.innerHTML = '';

  if (!state.adminData) {
    const placeholder = document.createElement('p');
    placeholder.textContent = 'No moderation data available.';
    adminBodyEl.appendChild(placeholder);
    return;
  }

  const totals = document.createElement('div');
  totals.className = 'stat-grid';
  Object.entries(state.adminData.totals || {}).forEach(([label, value]) => {
    totals.appendChild(createStatCard(label, value));
  });

  const topHeading = document.createElement('h3');
  topHeading.textContent = 'Top contributors';

  const contributorList = document.createElement('ul');
  contributorList.className = 'answer-list';
  (state.adminData.topContributors || []).forEach((user) => {
    const li = document.createElement('li');
    li.className = 'answer-card';
    li.textContent = `${user.name} • ${user.reputation} rep`;
    contributorList.appendChild(li);
  });

  const flagHeading = document.createElement('h3');
  flagHeading.textContent = 'Flagged items';

  const flagList = document.createElement('div');
  flagList.className = 'flag-list';

  if (!state.adminData.flaggedItems || !state.adminData.flaggedItems.length) {
    const none = document.createElement('p');
    none.textContent = 'No active flags. Great job community!';
    flagList.appendChild(none);
  } else {
    state.adminData.flaggedItems.forEach((flag) => {
      flagList.appendChild(createFlagCard(flag));
    });
  }

  adminBodyEl.appendChild(totals);
  adminBodyEl.appendChild(topHeading);
  adminBodyEl.appendChild(contributorList);
  adminBodyEl.appendChild(flagHeading);
  adminBodyEl.appendChild(flagList);
}

function createVoteControls(entityType, entityId, votes = { upVotes: 0, downVotes: 0, score: 0 }) {
  const container = document.createElement('div');
  container.className = 'vote-controls';

  const upButton = document.createElement('button');
  upButton.type = 'button';
  upButton.className = 'vote-button';
  upButton.textContent = '▲';
  upButton.title = 'Upvote';
  upButton.addEventListener('click', () => handleVote(entityType, entityId, 1));

  const downButton = document.createElement('button');
  downButton.type = 'button';
  downButton.className = 'vote-button';
  downButton.textContent = '▼';
  downButton.title = 'Downvote';
  downButton.addEventListener('click', () => handleVote(entityType, entityId, -1));

  const score = document.createElement('span');
  score.className = 'vote-score';
  score.textContent = votes.score ?? 0;
  score.title = `↑ ${votes.upVotes || 0} · ↓ ${votes.downVotes || 0}`;

  container.appendChild(upButton);
  container.appendChild(score);
  container.appendChild(downButton);

  return container;
}

function createAuthorBadge(author) {
  const badge = document.createElement('span');
  badge.className = 'badge';
  if (!author) {
    badge.textContent = 'Unknown user';
  } else {
    badge.textContent = `${author.name} · ${author.reputation} rep`;
  }
  return badge;
}

function createFlagBadge(count) {
  const badge = document.createElement('span');
  badge.className = 'badge badge--danger';
  badge.textContent = `${count} flag${count === 1 ? '' : 's'}`;
  return badge;
}

function createStatCard(label, value) {
  const wrapper = document.createElement('div');
  wrapper.className = 'stat-card';

  const labelEl = document.createElement('span');
  labelEl.textContent = label;

  const valueEl = document.createElement('span');
  valueEl.textContent = value;

  wrapper.appendChild(labelEl);
  wrapper.appendChild(valueEl);
  return wrapper;
}

function createFlagCard(flag) {
  const card = document.createElement('div');
  card.className = 'flag-card';

  const title = document.createElement('h4');
  title.textContent = `${flag.entityType.toUpperCase()} • ${flag.status.toUpperCase()}`;

  const reason = document.createElement('p');
  reason.textContent = `Reason: ${flag.reason}`;

  const meta = document.createElement('div');
  meta.className = 'flag-meta';
  if (flag.reporter) {
    meta.appendChild(createAuthorBadge(flag.reporter));
  }
  if (flag.entity && flag.entity.author) {
    const owner = document.createElement('span');
    owner.textContent = `Author: ${flag.entity.author.name}`;
    meta.appendChild(owner);
  }
  const created = document.createElement('span');
  created.textContent = `Created ${formatDate(flag.createdAt)}`;
  meta.appendChild(created);

  card.appendChild(title);
  card.appendChild(reason);
  card.appendChild(meta);
  return card;
}

function applyOptimisticVote(entityType, entityId, value) {
  const { entity } = locateEntity(entityType, entityId);
  if (!entity) return false;
  if (!entity.votes) {
    entity.votes = { upVotes: 0, downVotes: 0, score: 0 };
  }
  if (value === 1) {
    entity.votes.upVotes = (entity.votes.upVotes || 0) + 1;
  } else {
    entity.votes.downVotes = (entity.votes.downVotes || 0) + 1;
  }
  entity.votes.score = (entity.votes.score || 0) + value;
  return true;
}

function applyOptimisticFlag(entityType, entityId) {
  const { entity } = locateEntity(entityType, entityId);
  if (!entity) return false;
  entity.flagCount = (entity.flagCount || 0) + 1;
  return true;
}

function locateEntity(entityType, entityId) {
  for (const question of state.questions) {
    if (entityType === 'question' && question.id === entityId) {
      return { question, entity: question };
    }
    if (entityType === 'answer') {
      const answer = (question.answers || []).find((item) => item.id === entityId);
      if (answer) {
        return { question, entity: answer };
      }
    }
  }
  return { question: null, entity: null };
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function setNotification(message, type = 'info') {
  notificationEl.textContent = message || '';
  notificationEl.className = type || '';
}
