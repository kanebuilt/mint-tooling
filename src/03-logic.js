import { ensureDictionary } from "./02-storage.js";

function setDictionaryValue(dictName, key, value) {
  const dict = ensureDictionary(dictName);
  dict.set(String(key), value);
}

function getDictionaryValue(dictName, key) {
  const dict = ensureDictionary(dictName);
  const value = dict.get(String(key));
  return value === undefined ? "" : value;
}

function dictionarySize(dictName) {
  return ensureDictionary(dictName).size;
}

function listDictionaryKeys(dictName) {
  return Array.from(ensureDictionary(dictName).keys());
}

export {
  setDictionaryValue,
  getDictionaryValue,
  dictionarySize,
  listDictionaryKeys,
};
