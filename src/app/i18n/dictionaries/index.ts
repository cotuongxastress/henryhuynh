import { NextIntlClientProvider } from 'next-intl';
import { Locale, defaultLocale } from '../settings';

export async function createGetDictionary() {
  return async function getDictionary(locale: Locale) {
    try {
      return (await import(`./dictionaries/${locale}.json`)).default;
    } catch (error) {
      console.error(`Error loading dictionary for locale ${locale}:`, error);
      return (await import(`./dictionaries/${defaultLocale}.json`)).default;
    }
  };
}
