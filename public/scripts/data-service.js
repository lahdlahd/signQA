const cache = {};

async function loadJson(path) {
  if (!cache[path]) {
    cache[path] = fetch(path, { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }

  return cache[path];
}

export function loadKnowledgeBase() {
  return loadJson('./data/knowledge-base.json');
}

export function loadUseCases() {
  return loadJson('./data/useCases.json');
}
