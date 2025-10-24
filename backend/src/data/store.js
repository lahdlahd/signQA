const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const DATA_PATH = path.join(__dirname, '../../data/defaultData.json');

const REPUTATION_RULES = {
  question: {
    up: 10,
    down: -2
  },
  answer: {
    up: 15,
    down: -5
  },
  voterDownPenalty: -1
};

const clone = (input) => JSON.parse(JSON.stringify(input));

const loadFromDisk = () => {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
};

let state = clone(loadFromDisk());

const findUser = (userId) => state.users.find((user) => user.id === userId);

const aggregateVotes = (entityType, entityId) => {
  const votes = state.votes.filter(
    (vote) => vote.entityType === entityType && vote.entityId === entityId
  );

  const summary = votes.reduce(
    (acc, vote) => {
      if (vote.value === 1) {
        acc.upVotes += 1;
      }
      if (vote.value === -1) {
        acc.downVotes += 1;
      }
      return acc;
    },
    { upVotes: 0, downVotes: 0 }
  );

  return {
    ...summary,
    score: summary.upVotes - summary.downVotes
  };
};

const countFlags = (entityType, entityId) =>
  state.flags.filter((flag) => flag.entityType === entityType && flag.entityId === entityId).length;

const serializeUser = (user) => {
  if (!user) return null;

  const questionsAuthored = state.questions.filter((q) => q.authorId === user.id).length;
  const answersAuthored = state.answers.filter((a) => a.authorId === user.id).length;
  const positiveAnswers = state.answers.filter((answer) => {
    if (answer.authorId !== user.id) return false;
    const votes = aggregateVotes('answer', answer.id);
    return votes.score > 0;
  }).length;

  return {
    id: user.id,
    name: user.name,
    role: user.role,
    reputation: user.reputation,
    bio: user.bio,
    stats: {
      questionsAuthored,
      answersAuthored,
      positiveAnswers
    }
  };
};

const serializeAnswer = (answer) => {
  const author = findUser(answer.authorId);
  return {
    id: answer.id,
    questionId: answer.questionId,
    body: answer.body,
    createdAt: answer.createdAt,
    author: serializeUser(author),
    votes: aggregateVotes('answer', answer.id),
    flagCount: countFlags('answer', answer.id)
  };
};

const serializeQuestion = (question) => {
  const author = findUser(question.authorId);
  const answers = state.answers
    .filter((answer) => answer.questionId === question.id)
    .map(serializeAnswer);

  return {
    id: question.id,
    title: question.title,
    body: question.body,
    createdAt: question.createdAt,
    author: serializeUser(author),
    votes: aggregateVotes('question', question.id),
    flagCount: countFlags('question', question.id),
    answers
  };
};

const getVoteReputationDelta = (entityType, value) => {
  if (!['question', 'answer'].includes(entityType)) return 0;
  if (![1, -1].includes(value)) return 0;
  return value === 1
    ? REPUTATION_RULES[entityType].up
    : REPUTATION_RULES[entityType].down;
};

const applyReputationDelta = (userId, delta) => {
  const user = findUser(userId);
  if (!user) {
    throw new Error('User not found for reputation update.');
  }
  user.reputation += delta;
  if (user.reputation < 0) {
    user.reputation = 0;
  }
  return user.reputation;
};

const getFlaggedEntities = () =>
  state.flags.map((flag) => {
    const entityCollection = flag.entityType === 'question' ? state.questions : state.answers;
    const entity = entityCollection.find((item) => item.id === flag.entityId);

    return {
      id: flag.id,
      entityType: flag.entityType,
      entityId: flag.entityId,
      status: flag.status,
      reason: flag.reason,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
      reporter: serializeUser(findUser(flag.userId)),
      entity: entity
        ? {
            id: entity.id,
            body: entity.body ?? entity.title,
            author: serializeUser(findUser(entity.authorId))
          }
        : null
    };
  });

const getAdminDashboard = () => {
  const openFlags = state.flags.filter((flag) => flag.status === 'open');
  const resolvedFlags = state.flags.filter((flag) => flag.status !== 'open');

  const topContributors = clone(state.users)
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, 5)
    .map(serializeUser);

  return {
    totals: {
      questions: state.questions.length,
      answers: state.answers.length,
      users: state.users.length,
      openFlags: openFlags.length,
      resolvedFlags: resolvedFlags.length
    },
    flaggedItems: getFlaggedEntities(),
    topContributors
  };
};

const voteOnEntity = (entityType, entityId, voterId, value) => {
  if (!['question', 'answer'].includes(entityType)) {
    throw new Error('Invalid entity type.');
  }

  if (![1, -1].includes(value)) {
    throw new Error('Vote value must be 1 or -1.');
  }

  const voter = findUser(voterId);
  if (!voter) {
    throw new Error('Voting user does not exist.');
  }

  let entity;
  if (entityType === 'question') {
    entity = state.questions.find((question) => question.id === entityId);
  } else {
    entity = state.answers.find((answer) => answer.id === entityId);
  }

  if (!entity) {
    throw new Error('Entity to vote on does not exist.');
  }

  const existingVote = state.votes.find(
    (vote) => vote.entityType === entityType && vote.entityId === entityId && vote.userId === voterId
  );

  if (existingVote && existingVote.value === value) {
    throw new Error('Duplicate vote detected for entity.');
  }

  const entityOwnerId = entity.authorId;
  const newDelta = getVoteReputationDelta(entityType, value);
  const newPenalty = value === -1 ? REPUTATION_RULES.voterDownPenalty : 0;

  if (existingVote) {
    const previousDelta = getVoteReputationDelta(entityType, existingVote.value);
    const previousPenalty = existingVote.value === -1 ? REPUTATION_RULES.voterDownPenalty : 0;

    existingVote.value = value;
    existingVote.updatedAt = new Date().toISOString();

    applyReputationDelta(entityOwnerId, newDelta - previousDelta);
    applyReputationDelta(voterId, newPenalty - previousPenalty);
  } else {
    state.votes.push({
      id: uuid(),
      entityType,
      entityId,
      userId: voterId,
      value,
      createdAt: new Date().toISOString()
    });

    applyReputationDelta(entityOwnerId, newDelta);
    applyReputationDelta(voterId, newPenalty);
  }

  if (entityType === 'question') {
    return {
      question: serializeQuestion(entity)
    };
  }

  const parentQuestion = state.questions.find((question) => question.id === entity.questionId);
  return {
    question: serializeQuestion(parentQuestion),
    answer: serializeAnswer(entity)
  };
};

const listQuestions = () => state.questions.map((question) => serializeQuestion(question));

const listUsers = () => state.users.map((user) => serializeUser(user));

const getUserProfile = (userId) => {
  const user = findUser(userId);
  if (!user) {
    throw new Error('User not found.');
  }
  return serializeUser(user);
};

const flagEntity = ({ entityType, entityId, userId, reason }) => {
  if (!['question', 'answer'].includes(entityType)) {
    throw new Error('Invalid entity type for flagging.');
  }

  if (!reason || reason.trim().length < 3) {
    throw new Error('Flag reason must contain at least three characters.');
  }

  const reportingUser = findUser(userId);
  if (!reportingUser) {
    throw new Error('Reporting user does not exist.');
  }

  const exists = state.flags.find(
    (flag) =>
      flag.entityType === entityType &&
      flag.entityId === entityId &&
      flag.userId === userId &&
      flag.status === 'open'
  );

  if (exists) {
    throw new Error('You have already flagged this content.');
  }

  const entityCollection = entityType === 'question' ? state.questions : state.answers;
  const entity = entityCollection.find((item) => item.id === entityId);
  if (!entity) {
    throw new Error('Content to flag does not exist.');
  }

  const newFlag = {
    id: uuid(),
    entityType,
    entityId,
    userId,
    reason: reason.trim(),
    status: 'open',
    createdAt: new Date().toISOString()
  };

  state.flags.push(newFlag);

  return getFlaggedEntities().find((flag) => flag.id === newFlag.id);
};

const resolveFlag = (flagId, status = 'resolved') => {
  const flag = state.flags.find((item) => item.id === flagId);
  if (!flag) {
    throw new Error('Flag not found.');
  }
  flag.status = status;
  flag.updatedAt = new Date().toISOString();
  return flag;
};

module.exports = {
  listQuestions,
  listUsers,
  getUserProfile,
  voteOnEntity,
  flagEntity,
  resolveFlag,
  getFlaggedEntities,
  getAdminDashboard
};
