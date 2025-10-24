import { loadKnowledgeBase, loadUseCases } from './data-service.js';
import { createDocModule, createImpactList, createTagPill } from './components.js';
import { convertMdxToHtml } from './mdx.js';

function findQuestion(knowledgeBase, questionId) {
  for (const category of knowledgeBase.categories) {
    const match = category.questions.find((question) => question.id === questionId);
    if (match) {
      return { category, question: match };
    }
  }
  return null;
}

function renderAnswer(answer, container) {
  container.innerHTML = '';
  answer.forEach((paragraph) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    container.appendChild(p);
  });
}

function renderKeyActions(actions, container) {
  container.innerHTML = '';
  if (!actions.length) {
    return;
  }

  const heading = document.createElement('h2');
  heading.textContent = 'Key actions';

  const list = document.createElement('ul');
  list.className = 'key-action-list';

  actions.forEach((action) => {
    const item = document.createElement('li');
    item.textContent = action;
    list.appendChild(item);
  });

  container.append(heading, list);
}

function renderRelatedUseCases(relatedIds, useCases, container) {
  container.innerHTML = '';

  if (!relatedIds.length) {
    container.removeAttribute('data-related-use-cases');
    return;
  }

  const heading = document.createElement('h2');
  heading.textContent = 'Related use cases';
  container.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'related-use-case-grid';

  relatedIds.forEach((id) => {
    const useCase = useCases.find((item) => item.id === id);
    if (!useCase) {
      return;
    }

    const card = document.createElement('article');
    card.className = 'related-use-case-card';
    card.id = `related-${useCase.id}`;

    const title = document.createElement('h3');
    title.textContent = useCase.title;

    const summary = document.createElement('p');
    summary.textContent = useCase.summary;

    const tags = document.createElement('div');
    tags.className = 'related-use-case-card__tags';
    useCase.tags.forEach((tag) => tags.appendChild(createTagPill(tag)));

    const metrics = createImpactList(useCase.impactMetrics.slice(0, 2));
    metrics.classList.add('related-use-case-card__metrics');

    const snippetContainer = document.createElement('div');
    snippetContainer.className = 'related-use-case-card__snippet';
    const snippetHtml = convertMdxToHtml(useCase.mdxBody.split(/\n\n/).slice(0, 1).join('\n\n'));
    snippetContainer.innerHTML = snippetHtml;

    const link = document.createElement('a');
    link.href = `use-case-explorer.html?useCase=${encodeURIComponent(useCase.id)}#use-case-${useCase.id}`;
    link.className = 'related-use-case-card__link';
    link.textContent = 'Explore this use case';

    card.append(title, summary, tags, metrics, snippetContainer, link);
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const questionId = params.get('id');
  const state = {
    containers: {
      title: document.querySelector('[data-question-title]'),
      summary: document.querySelector('[data-question-summary]'),
      category: document.querySelector('[data-question-category]'),
      answer: document.querySelector('[data-question-answer]'),
      actions: document.querySelector('[data-key-actions]'),
      docModule: document.querySelector('[data-doc-module]'),
      related: document.querySelector('[data-related-use-cases]')
    }
  };

  if (!questionId) {
    state.containers.answer.textContent = 'No question selected. Return to the knowledge base to explore available topics.';
    return;
  }

  try {
    const [knowledgeBase, useCases] = await Promise.all([loadKnowledgeBase(), loadUseCases()]);
    const matched = findQuestion(knowledgeBase, questionId);

    if (!matched) {
      state.containers.answer.textContent = 'We could not find that question. It may have been archived.';
      return;
    }

    const { category, question } = matched;
    document.title = `${question.question} · signQA`;

    if (state.containers.title) {
      state.containers.title.textContent = question.question;
    }

    if (state.containers.summary) {
      state.containers.summary.textContent = question.summary;
    }

    if (state.containers.category) {
      state.containers.category.textContent = category.title;
    }

    if (state.containers.docModule) {
      state.containers.docModule.innerHTML = '';
      state.containers.docModule.appendChild(createDocModule(category.docModule));
    }

    renderAnswer(question.answer, state.containers.answer);
    renderKeyActions(question.keyActions, state.containers.actions);
    renderRelatedUseCases(question.relatedUseCases, useCases, state.containers.related);
  } catch (error) {
    state.containers.answer.textContent = 'Something went wrong while loading this question. Please refresh the page.';
  }
});
