const dictionaries = new Map();

function ensureDictionary(name) {
  const key = String(name || '').trim() || 'default';
  if (!dictionaries.has(key)) {
    dictionaries.set(key, new Map());
  }
  return dictionaries.get(key);
}

export { dictionaries, ensureDictionary };
