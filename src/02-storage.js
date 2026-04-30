const dictionaries = new Map();

function ensureDictionary(name) {
  const normalizedName = name === null || name === undefined ? "" : String(name);
  const key = normalizedName.trim() || "default";
  if (!dictionaries.has(key)) {
    dictionaries.set(key, new Map());
  }
  return dictionaries.get(key);
}

export { ensureDictionary };
