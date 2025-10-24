import { loadKnowledgeBase } from './data-service.js';
import { createDocModule, createTagPill } from './components.js';

function createQuestionCard(question) {
  const card = document.createElement('article');
  card.className = 'question-card';

  const questionTitle = document.createElement('h3');
  questionTitle.className = 'question-card__title';
  questionTitle.textContent = question.question;

  const summary = document.createElement('p');
  summary.className = 'question-card__summary';
  summary.textContent = question.summary;

  const actionsList = document.createElement('ul');
  actionsList.className = 'question-card__actions';
  question.keyActions.slice(0, 2).forEach((action) => {
    const item = document.createElement('li');
    item.textContent = action;
    actionsList.appendChild(item);
  });

  const link = document.createElement('a');
  link.className = 'question-card__link';
  link.href = `question.html?id=${encodeURIComponent(question.id)}`;
  link.setAttribute('aria-label', `${question.question} – view details`);
  link.textContent = 'Read answer';

  const useCaseContainer = document.createElement('div');
  useCaseContainer.className = 'question-card__use-cases';
  useCaseContainer.setAttribute('aria-label', 'Related use cases');

  question.relatedUseCases.forEach((useCaseId) => {
    useCaseContainer.appendChild(createTagPill(useCaseId.replace(/-/g, ' ')));
  });

  card.append(questionTitle, summary, actionsList, useCaseContainer, link);
  return card;
}

function renderCategories(baseData) {
  const container = document.querySelector('[data-category-list]');
  container.innerHTML = '';

  baseData.categories.forEach((category) => {
    const section = document.createElement('section');
    section.className = 'category-block';
    section.id = `category-${category.id}`;

    const header = document.createElement('header');
    header.className = 'category-block__header';

    const title = document.createElement('h2');
    title.textContent = category.title;

    const summary = document.createElement('p');
    summary.textContent = category.summary;

    header.append(title, summary);

    const content = document.createElement('div');
    content.className = 'category-block__content';

    const questionsWrapper = document.createElement('div');
    questionsWrapper.className = 'category-block__questions';

    category.questions.forEach((question) => {
      questionsWrapper.appendChild(createQuestionCard(question));
    });

    const docsWrapper = document.createElement('div');
    docsWrapper.className = 'category-block__docs';
    docsWrapper.appendChild(createDocModule(category.docModule));

    content.append(questionsWrapper, docsWrapper);
    section.append(header, content);
    container.appendChild(section);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const knowledgeBase = await loadKnowledgeBase();
    const updatedAt = document.querySelector('[data-updated-at]');
    if (updatedAt && knowledgeBase.updatedAt) {
      updatedAt.textContent = new Date(knowledgeBase.updatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    renderCategories(knowledgeBase);
  } catch (error) {
    const container = document.querySelector('[data-category-list]');
    if (container) {
      container.innerHTML = '<p class="error">We could not load the knowledge base right now. Please refresh and try again.</p>';
    }
  }
});
