export const locales = ['en', 'vi', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames = {
  en: 'English',
  vi: 'Tiếng Việt',
  es: 'Español',
};

export function getLocaleDirection(locale: Locale) {
  return 'ltr';
}
