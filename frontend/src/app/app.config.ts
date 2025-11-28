import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { AppLanguage } from './shared/i18n';

export function buildAppConfig(lang: AppLanguage): ApplicationConfig {
  return {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes, withEnabledBlockingInitialNavigation()),
      provideHttpClient(),
      { provide: LOCALE_ID, useValue: lang }
    ]
  };
}
