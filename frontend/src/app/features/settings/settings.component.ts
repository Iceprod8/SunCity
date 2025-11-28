import { Component, LOCALE_ID, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { AuditService } from '../../shared/services/audit.service';
import { applyDocumentLanguage, AppLanguage, getPreferredLanguage, savePreferredLanguage } from '../../shared/i18n';
type SettingItem = { key: string; label: string; description: string; value: boolean };

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  private audit = inject(AuditService);
  localeId = inject(LOCALE_ID);
  languages = [
    { code: 'fr' as AppLanguage, label: $localize`:@@languages.fr:Français` },
    { code: 'en' as AppLanguage, label: $localize`:@@languages.en:English` },
    { code: 'de' as AppLanguage, label: $localize`:@@languages.de:Deutsch` }
  ];
  selectedLanguage = signal<AppLanguage>(getPreferredLanguage());

  settings = signal<SettingItem[]>([
    {
      key: 'autoLogout',
      label: $localize`:@@settings.items.autoLogout.label:Déconnexion automatique`,
      description: $localize`:@@settings.items.autoLogout.description:2 jours d'inactivité maximum avant fermeture de session (mock).`,
      value: true
    },
    {
      key: 'activityLog',
      label: $localize`:@@settings.items.activityLog.label:Journal local`,
      description: $localize`:@@settings.items.activityLog.description:Conserver un audit local des actions clés (connexion, déconnexion).`,
      value: true
    },
    {
      key: 'notifications',
      label: $localize`:@@settings.items.notifications.label:Notifications locales`,
      description: $localize`:@@settings.items.notifications.description:Recevoir des alertes mock pour les changements critiques.`,
      value: false
    }
  ]);

  auditEntries = this.audit.entries;
  stateEnabled = $localize`:@@settings.state.enabled:Activé`;
  stateDisabled = $localize`:@@settings.state.disabled:Désactivé`;

  changeLanguage(lang: AppLanguage) {
    if (lang === this.selectedLanguage()) return;
    this.selectedLanguage.set(lang);
    savePreferredLanguage(lang);
    applyDocumentLanguage(lang);
    this.audit.log('settings:language', `Langue: ${lang}`);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  toggleSetting(key: string) {
    this.settings.update(items =>
      items.map(item =>
        item.key === key ? { ...item, value: !item.value } : item
      )
    );
    const updated = this.settings().find(s => s.key === key);
    if (updated) {
      this.audit.log(
        'settings:update',
        `${updated.label}: ${updated.value ? this.stateEnabled : this.stateDisabled}`
      );
    }
  }
}
