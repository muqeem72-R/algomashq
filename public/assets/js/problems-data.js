// Loads the problem list and single problems from /problems/*.json (static files made by tools/problems/build.mjs).

let indexPromise = null;
const cache = new Map();

export function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch('/problems/index.json').then((r) => {
      if (!r.ok) throw new Error('The problem list could not be loaded.');
      return r.json();
    }).catch((error) => { indexPromise = null; throw error; });
  }
  return indexPromise;
}

export async function loadProblem(slug) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('That problem does not exist.');
  if (!cache.has(slug)) {
    const response = await fetch(`/problems/${slug}.json`);
    if (response.status === 404) throw new Error('That problem does not exist.');
    if (!response.ok) throw new Error('The problem could not be loaded.');
    cache.set(slug, await response.json());
  }
  return cache.get(slug);
}

// How many problems each topic has: { topicId: count }.
export async function countByTopic() {
  const { problems } = await loadIndex();
  const counts = {};
  for (const p of problems) counts[p.topic] = (counts[p.topic] || 0) + 1;
  return counts;
}
