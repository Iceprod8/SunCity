import { bootstrapApplication } from '@angular/platform-browser';
import { loadTranslations } from '@angular/localize';
import { buildAppConfig } from './app/app.config';
import { App } from './app/app';
import { applyDocumentLanguage, getPreferredLanguage } from './app/shared/i18n';
import { applyTheme, getSavedTheme } from './app/shared/theme';

async function bootstrap() {
  const lang = getPreferredLanguage();
  applyDocumentLanguage(lang);
  applyTheme(getSavedTheme());

  if (lang !== 'fr') {
    try {
      const response = await fetch(`/i18n/${lang}.json`);
      if (response.ok) {
        const messages = await response.json();
        loadTranslations(messages);
      }
    } catch (err) {
      console.warn('Could not load translations for', lang, err);
    }
  }

  bootstrapApplication(App, buildAppConfig(lang)).catch(err => console.error(err));
}

bootstrap();
