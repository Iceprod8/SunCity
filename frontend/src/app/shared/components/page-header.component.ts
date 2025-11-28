import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

type NavLink = { label: string; path: string };

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between min-h-[110px]">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6 lg:flex-1">
        <div class="min-w-[240px] space-y-2">
          <h1 class="text-2xl md:text-3xl font-semibold text-slate-900">{{ title }}</h1>
          <p class="text-sm text-slate-600">{{ subtitle }}</p>
        </div>

        <nav class="flex md:hidden items-center gap-3 text-sm text-slate-700" aria-label="Liens de navigation">
          <a *ngFor="let link of links"
             [routerLink]="link.path"
             routerLinkActive="bg-amber-200 text-slate-900 border-amber-200"
             class="px-3 py-2 rounded-full hover:bg-white shadow-sm border border-amber-100 transition">
            {{ link.label }}
          </a>
        </nav>
      </div>

      <nav class="hidden md:flex items-center gap-3 text-sm text-slate-700 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" aria-label="Liens de navigation">
        <a *ngFor="let link of links"
           [routerLink]="link.path"
           routerLinkActive="bg-amber-200 text-slate-900 border-amber-200"
           class="px-3 py-2 rounded-full hover:bg-white shadow-sm border border-amber-100 transition">
          {{ link.label }}
        </a>
      </nav>

      <div class="flex items-center gap-3 lg:pl-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-slate-900">{{ user()?.username || 'Profil' }}</span>
          <div class="w-9 h-9 rounded-full bg-brand-600 text-white grid place-items-center font-semibold">
            {{ initials() || 'SC' }}
          </div>
        </div>
        <a
          routerLink="/settings"
          class="w-9 h-9 rounded-full bg-white shadow border border-amber-100 text-slate-700 grid place-items-center hover:text-slate-900"
          aria-label="Paramètres">
          &#9881;
        </a>
        <button class="w-9 h-9 rounded-full bg-white shadow border border-amber-100 text-red-600 grid place-items-center hover:text-red-700" aria-label="Se deconnecter" (click)="logout()">
          &#x23FB;
        </button>
      </div>
    </header>
  `
})
export class PageHeaderComponent {
  private auth = inject(AuthService);

  @Input() title = '';
  @Input() subtitle = '';

  links = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Meteo', path: '/weather' },
    { label: 'Actualites', path: '/news' },
    { label: 'Activites', path: '/activities' },
  ];

  user = this.auth.user;
  initials = computed(() => {
    const name = this.user()?.username?.trim() || '';
    if (!name) return '';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  });

  logout() {
    this.auth.logout();
  }
}
