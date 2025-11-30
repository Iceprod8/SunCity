import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localeFr);
registerLocaleData(localeEn);
registerLocaleData(localeDe);

export type AppLanguage = 'fr' | 'en' | 'de';
const STORAGE_KEY = 'suncity-lang';

export function getPreferredLanguage(): AppLanguage {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY) as AppLanguage | null;
    if (stored === 'fr' || stored === 'en' || stored === 'de') {
      return stored;
    }
  }
  if (typeof navigator !== 'undefined') {
    const nav = navigator.language.toLowerCase();
    if (nav.startsWith('fr')) return 'fr';
    if (nav.startsWith('de')) return 'de';
  }
  return 'fr';
}

export function savePreferredLanguage(lang: AppLanguage) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
  }
}

export function applyDocumentLanguage(lang: AppLanguage) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }
}
