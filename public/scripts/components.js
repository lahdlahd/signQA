export function createDocModule(moduleData) {
  const wrapper = document.createElement('aside');
  wrapper.className = 'doc-module';

  const badge = document.createElement('span');
  badge.className = 'doc-module__badge';
  badge.textContent = 'Documentation';

  const title = document.createElement('h3');
  title.className = 'doc-module__title';
  title.textContent = moduleData.title;

  const description = document.createElement('p');
  description.className = 'doc-module__description';
  description.textContent = moduleData.description;

  const list = document.createElement('ul');
  list.className = 'doc-module__list';

  moduleData.links.forEach((link) => {
    const listItem = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = link.label;
    listItem.appendChild(anchor);
    list.appendChild(listItem);
  });

  wrapper.append(badge, title, description, list);
  return wrapper;
}

export function createTagPill(text) {
  const pill = document.createElement('span');
  pill.className = 'tag-pill';
  pill.textContent = text;
  return pill;
}

export function createImpactList(metrics) {
  const list = document.createElement('ul');
  list.className = 'impact-list';
  metrics.forEach((metric) => {
    const item = document.createElement('li');
    item.textContent = metric;
    list.appendChild(item);
  });
  return list;
}
