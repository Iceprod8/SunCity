import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { AuditService } from '../../shared/services/audit.service';

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

  settings = signal<SettingItem[]>([
    {
      key: 'autoLogout',
      label: 'Deconnexion automatique',
      description: '2 jours d\'inactivite maximum avant fermeture de session (mock).',
      value: true
    },
    {
      key: 'activityLog',
      label: 'Journal local',
      description: 'Conserver un audit local des actions cles (connexion, deconnexion).',
      value: true
    },
    {
      key: 'notifications',
      label: 'Notifications locales',
      description: 'Recevoir des alertes mock pour les changements critiques.',
      value: false
    }
  ]);

  auditEntries = this.audit.entries;

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
        `${updated.label}: ${updated.value ? 'activé' : 'désactivé'}`
      );
    }
  }
}
