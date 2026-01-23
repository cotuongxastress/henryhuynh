import { createGetDictionary } from './dictionaries';
import { Locale, defaultLocale } from './settings';

export async function getDictionary(locale: Locale = defaultLocale) {
  const getDictionary = createGetDictionary();
  return getDictionary(locale);
}
