import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { applyDocumentLanguage, AppLanguage, getPreferredLanguage, savePreferredLanguage } from '../i18n';

const OPTIONS: Array<{ code: AppLanguage; label: string }> = [
  { code: 'fr', label: $localize`:@@languages.fr:Français` },
  { code: 'en', label: $localize`:@@languages.en:English` },
  { code: 'de', label: $localize`:@@languages.de:Deutsch` }
];

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="inline-flex items-center gap-2 text-xs text-slate-700 bg-white border border-amber-100 rounded-full px-3 py-1 shadow-sm">
      <span class="font-semibold" i18n="@@common.languageLabel">Langue</span>
      <select
        class="bg-transparent text-slate-900 text-sm focus:outline-none"
        [value]="language()"
        (change)="onChange($event)">
        <option *ngFor="let option of options" [value]="option.code">
          {{ option.label }}
        </option>
      </select>
    </label>
  `
})
export class LanguageSwitcherComponent {
  options = OPTIONS;
  language = computed(() => getPreferredLanguage());

  onChange(event: Event) {
    const value = (event.target as HTMLSelectElement | null)?.value as AppLanguage | undefined;
    if (!value || value === getPreferredLanguage()) return;
    savePreferredLanguage(value);
    applyDocumentLanguage(value);
    // Reload to let Angular re-bootstrap with the new locale and translations.
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
}
