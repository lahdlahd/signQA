import { loadUseCases } from './data-service.js';
import { convertMdxToHtml } from './mdx.js';
import { createImpactList, createTagPill } from './components.js';

const state = {
  useCases: [],
  selectedSector: 'all',
  selectedTags: new Set()
};

function buildMediaElement(media) {
  if (!media) {
    return null;
  }

  if (media.type === 'video') {
    const video = document.createElement('video');
    video.className = 'use-case-card__media';
    video.controls = true;
    video.preload = 'metadata';
    video.innerHTML = `<source src="${media.src}" type="video/mp4">`;
    if (media.poster) {
      video.poster = media.poster;
    }
    video.setAttribute('aria-label', media.alt || 'Use case video');
    return video;
  }

  if (media.type === 'image') {
    const img = document.createElement('img');
    img.className = 'use-case-card__media';
    img.src = media.src;
    img.alt = media.alt || '';
    loadingFallback(img);
    return img;
  }

  return null;
}

function loadingFallback(img) {
  img.loading = 'lazy';
  img.decoding = 'async';
}

function createUseCaseCard(useCase) {
  const card = document.createElement('article');
  card.className = 'use-case-card';
  card.id = `use-case-${useCase.id}`;

  const mediaEl = buildMediaElement(useCase.media);
  if (mediaEl) {
    card.appendChild(mediaEl);
  }

  const title = document.createElement('h3');
  title.textContent = useCase.title;

  const sector = document.createElement('p');
  sector.className = 'use-case-card__sector';
  sector.textContent = useCase.sector;

  const summary = document.createElement('p');
  summary.className = 'use-case-card__summary';
  summary.textContent = useCase.summary;

  const tagsContainer = document.createElement('div');
  tagsContainer.className = 'use-case-card__tags';
  useCase.tags.forEach((tag) => tagsContainer.appendChild(createTagPill(tag)));

  const metrics = createImpactList(useCase.impactMetrics);
  metrics.classList.add('use-case-card__metrics');

  const details = document.createElement('details');
  details.className = 'use-case-card__details';

  const summaryToggle = document.createElement('summary');
  summaryToggle.textContent = 'View implementation playbook';

  const body = document.createElement('div');
  body.className = 'use-case-card__body';
  body.innerHTML = convertMdxToHtml(useCase.mdxBody);

  const resources = document.createElement('div');
  resources.className = 'use-case-card__resources';
  if (useCase.resources && useCase.resources.length) {
    const heading = document.createElement('h4');
    heading.textContent = 'Resources';
    const list = document.createElement('ul');
    useCase.resources.forEach((resource) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = resource.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = resource.label;
      item.appendChild(link);
      list.appendChild(item);
    });
    resources.append(heading, list);
  }

  details.append(summaryToggle, body, resources);
  card.append(title, sector, summary, tagsContainer, metrics, details);
  return card;
}

function deriveSectors(useCases) {
  const sectors = new Set();
  useCases.forEach((useCase) => sectors.add(useCase.sector));
  return ['all', ...Array.from(sectors).sort()];
}

function deriveTags(useCases) {
  const tags = new Set();
  useCases.forEach((useCase) => useCase.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

function renderSectorFilters(filters) {
  const container = document.querySelector('[data-sector-filters]');
  container.innerHTML = '';

  filters.forEach((filter) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-chip';
    button.textContent = filter === 'all' ? 'All sectors' : filter;
    if (filter === state.selectedSector) {
      button.classList.add('filter-chip--active');
    }

    button.addEventListener('click', () => {
      state.selectedSector = filter;
      renderSectorFilters(filters);
      renderResults();
    });

    container.appendChild(button);
  });
}

function renderTagFilters(tags) {
  const container = document.querySelector('[data-tag-filters]');
  container.innerHTML = '';

  tags.forEach((tag) => {
    const label = document.createElement('label');
    label.className = 'filter-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = tag;
    checkbox.checked = state.selectedTags.has(tag);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        state.selectedTags.add(tag);
      } else {
        state.selectedTags.delete(tag);
      }
      renderResults();
    });

    const span = document.createElement('span');
    span.textContent = tag;

    label.append(checkbox, span);
    container.appendChild(label);
  });
}

function filterUseCases() {
  return state.useCases.filter((useCase) => {
    const sectorMatch = state.selectedSector === 'all' || useCase.sector === state.selectedSector;
    const tagsMatch = state.selectedTags.size === 0 || Array.from(state.selectedTags).every((tag) => useCase.tags.includes(tag));
    return sectorMatch && tagsMatch;
  });
}

function renderResults() {
  const container = document.querySelector('[data-use-case-results]');
  container.innerHTML = '';

  const filtered = filterUseCases();
  const countElement = document.querySelector('[data-results-count]');
  if (countElement) {
    countElement.textContent = `${filtered.length} use case${filtered.length === 1 ? '' : 's'}`;
  }

  if (!filtered.length) {
    container.innerHTML = '<p class="empty-state">No use cases match the selected filters yet. Adjust your filters to explore more scenarios.</p>';
    return;
  }

  const grouped = filtered.reduce((acc, useCase) => {
    const group = useCase.sector;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(useCase);
    return acc;
  }, {});

  Object.keys(grouped)
    .sort()
    .forEach((sector) => {
      const section = document.createElement('section');
      section.className = 'use-case-group';

      const heading = document.createElement('h2');
      heading.textContent = sector;
      section.appendChild(heading);

      const grid = document.createElement('div');
      grid.className = 'use-case-grid';

      grouped[sector].forEach((useCase) => {
        grid.appendChild(createUseCaseCard(useCase));
      });

      section.appendChild(grid);
      container.appendChild(section);
    });

  highlightFromQuery();
}

function highlightFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const useCaseId = params.get('useCase');
  if (!useCaseId) {
    return;
  }
  const target = document.getElementById(`use-case-${useCaseId}`);
  if (!target) {
    return;
  }
  target.classList.add('use-case-card--highlight');
  target.scrollIntoView({ block: 'start', behavior: 'smooth' });
  window.setTimeout(() => {
    target.classList.remove('use-case-card--highlight');
  }, 3000);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    state.useCases = await loadUseCases();
    const sectors = deriveSectors(state.useCases);
    const tags = deriveTags(state.useCases);

    const params = new URLSearchParams(window.location.search);
    if (params.get('sector')) {
      const sectorParam = params.get('sector');
      if (sectors.includes(sectorParam)) {
        state.selectedSector = sectorParam;
      }
    }

    if (params.getAll('tag').length) {
      params.getAll('tag').forEach((tag) => {
        if (tags.includes(tag)) {
          state.selectedTags.add(tag);
        }
      });
    }

    renderSectorFilters(sectors);
    renderTagFilters(tags);
    renderResults();
  } catch (error) {
    const container = document.querySelector('[data-use-case-results]');
    container.innerHTML = '<p class="error">We could not load use cases right now. Please try again later.</p>';
  }
});
