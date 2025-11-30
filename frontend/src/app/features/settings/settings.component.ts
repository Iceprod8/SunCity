import { Component, LOCALE_ID, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { applyDocumentLanguage, AppLanguage, getPreferredLanguage, savePreferredLanguage } from '../../shared/i18n';
import { applyTheme, getSavedTheme, ThemeChoice } from '../../shared/theme';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/models/user.model';

type SettingItem = { key: string; label: string; description: string; value: boolean };

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  localeId = inject(LOCALE_ID);

  languages = [
    { code: 'fr' as AppLanguage, label: $localize`:@@languages.fr:Français` },
    { code: 'en' as AppLanguage, label: $localize`:@@languages.en:English` },
    { code: 'de' as AppLanguage, label: $localize`:@@languages.de:Deutsch` }
  ];
  selectedLanguage = signal<AppLanguage>(getPreferredLanguage());
  selectedTheme = signal<ThemeChoice>(getSavedTheme());

  settings = signal<SettingItem[]>([
    {
      key: 'autoLogout',
      label: $localize`:@@settings.items.autoLogout.label:Déconnexion automatique`,
      description: $localize`:@@settings.items.autoLogout.description:2 jours d'inactivité maximum avant fermeture de session (mock).`,
      value: true
    },
    {
      key: 'notifications',
      label: $localize`:@@settings.items.notifications.label:Notifications locales`,
      description: $localize`:@@settings.items.notifications.description:Recevoir des alertes mock pour les changements critiques.`,
      value: false
    }
  ]);

  stateEnabled = $localize`:@@settings.state.enabled:Activé`;
  stateDisabled = $localize`:@@settings.state.disabled:Désactivé`;

  saveLabelIdle = $localize`:@@settings.account.saveLabel:Enregistrer le profil`;
  saveLabelSaving = $localize`:@@settings.account.saving:Enregistrement...`;
  private accountPasswordMismatch = $localize`:@@settings.account.error.passwordMismatch:Les mots de passe ne correspondent pas.`;
  private accountUpdated = $localize`:@@settings.account.success.updated:Profil mis à jour.`;
  private accountUpdateError = $localize`:@@settings.account.error.updateFailed:Impossible de mettre à jour le profil.`;

  account = signal<{ email: string; username: string; city: string; password: string; confirm: string }>({
    email: this.auth.user()?.email || '',
    username: this.auth.user()?.username || '',
    city: this.auth.user()?.city || '',
    password: '',
    confirm: ''
  });
  accountSaving = signal(false);
  accountError = signal<string | null>(null);
  accountSuccess = signal<string | null>(null);

  changeLanguage(lang: AppLanguage) {
    if (lang === this.selectedLanguage()) return;
    this.selectedLanguage.set(lang);
    savePreferredLanguage(lang);
    applyDocumentLanguage(lang);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  changeTheme(theme: ThemeChoice) {
    if (theme === this.selectedTheme()) return;
    this.selectedTheme.set(theme);
    applyTheme(theme);
  }

  toggleSetting(key: string) {
    this.settings.update(items =>
      items.map(item =>
        item.key === key ? { ...item, value: !item.value } : item
      )
    );
  }

  updateAccountField(key: 'email' | 'username' | 'city' | 'password' | 'confirm', value: string) {
    this.account.update(current => ({
      ...current,
      [key]: value
    }));
  }

  saveAccount() {
    const current = this.auth.user();
    if (!current) return;
    const value = this.account();
    const patch: Partial<User> = {
      email: value.email.trim(),
      username: value.username.trim(),
      city: value.city.trim()
    };
    if (value.password) {
      if (value.password !== value.confirm) {
        this.accountError.set(this.accountPasswordMismatch);
        this.accountSuccess.set(null);
        return;
      }
      patch.password = value.password;
    }
    this.accountSaving.set(true);
    this.accountError.set(null);
    this.accountSuccess.set(null);
    this.userService.update(current.id, patch).subscribe({
      next: updated => {
        this.refreshAuthUser(updated);
        this.accountSaving.set(false);
        this.accountSuccess.set(this.accountUpdated);
        this.account.set({
          email: updated.email,
          username: updated.username,
          city: updated.city || '',
          password: '',
          confirm: ''
        });
      },
      error: () => {
        this.accountSaving.set(false);
        this.accountError.set(this.accountUpdateError);
      }
    });
  }

  private refreshAuthUser(updated: User) {
    const current = this.auth.user();
    if (!current) return;
    const next = { ...current, ...updated };
    (this.auth as any)['currentUserSignal']?.set(next);
    localStorage.setItem('suncity-user', JSON.stringify(next));
  }
}
