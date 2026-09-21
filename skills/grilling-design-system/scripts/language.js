import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ASSETS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets');

/** Load review text in the user's language. */
export function translated_copy(language, overrides = undefined, asset = 'studio-copy.json') {
  if (typeof language !== 'string' || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(language)) {
    throw new Error('Provide a language tag such as zh-CN, en or ja');
  }
  const copies = JSON.parse(fs.readFileSync(path.join(ASSETS, asset), 'utf8'));
  const base = language.toLowerCase().split('-')[0] === 'en' ? 'en' : null;
  const result = base ? { ...copies[base] } : {};
  if (overrides !== undefined && overrides !== null) {
    if (typeof overrides !== 'object' || Array.isArray(overrides)) {
      throw new Error('UI copy must be an object of translated strings');
    }
    Object.assign(result, overrides);
  }
  if (Object.keys(copies.en).some((key) => typeof result[key] !== 'string' || !result[key].trim())) {
    throw new Error(`Translate every UI text key for ${language} using --ui-copy`);
  }
  return result;
}
