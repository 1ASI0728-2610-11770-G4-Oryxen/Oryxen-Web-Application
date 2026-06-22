import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

/** Supported UI locales. English is the default per the project requirement. */
export type AppLocale = 'en' | 'es';

const STORAGE_KEY = 'oryxen.lang';

function htmlLangFor(locale: AppLocale): string {
  // Latin American Spanish (es_419) and US English per the i18n requirement.
  return locale === 'es' ? 'es-419' : 'en-US';
}

function resolveInitialLocale(): AppLocale {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'es' || saved === 'en' ? saved : 'en';
}

export const i18n = createI18n({
  legacy: false,
  locale: resolveInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, es },
});

/** Switches the active locale, persists it and updates the document <html lang>. */
export function setLocale(locale: AppLocale): void {
  i18n.global.locale.value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = htmlLangFor(locale);
}

export function currentLocale(): AppLocale {
  return i18n.global.locale.value as AppLocale;
}

// Reflect the initial locale on the document element at startup.
document.documentElement.lang = htmlLangFor(resolveInitialLocale());
