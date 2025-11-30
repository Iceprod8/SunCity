import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/services/api.service';
import { User } from '../../shared/models/user.model';
import { AuditService } from '../../shared/services/audit.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'suncity-user';
  private readonly ACTIVITY_KEY = 'suncity-last-activity';
  private readonly INACTIVITY_LIMIT_MS = 2 * 24 * 60 * 60 * 1000;
  private readonly currentUserSignal = signal<User | null>(null);
  private activityCheckHandle: ReturnType<typeof setInterval> | null = null;
  private listenersAttached = false;
  readonly user = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private router: Router,
    private audit: AuditService
  ) {
    this.hydrateFromStorage();
    this.attachActivityListeners();
    this.startActivityCheck();
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .get<User[]>(this.api.url('/users'), { params: { email, password } })
      .pipe(
        map(users => {
          if (!users.length) {
            throw new Error($localize`:@@auth.errors.invalidCredentials:Identifiants invalides`);
          }
          return users[0];
        }),
        tap(user => this.setUser(user))
      );
  }

  register(data: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.api.url('/users'), data).pipe(tap(u => this.setUser(u)));
  }

  logout(reason?: string) {
    this.currentUserSignal.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.ACTIVITY_KEY);
    this.stopActivityCheck();
    if (reason) {
      this.audit.log('logout', reason);
    } else {
      this.audit.log('logout', $localize`:@@auth.logout.user:Déconnexion utilisateur`);
    }
    this.router.navigate(['/login']);
  }

  enforceInactivityLimit() {
    if (!this.isAuthenticated()) {
      return false;
    }
    const lastActivity = this.getLastActivity();
    if (!lastActivity) {
      this.markActivity(true);
      return true;
    }
    const idleTime = Date.now() - lastActivity;
    if (idleTime > this.INACTIVITY_LIMIT_MS) {
      this.logout($localize`:@@auth.logout.auto:Déconnexion automatique après 2 jours d'inactivité`);
      return false;
    }
    return true;
  }

  markActivity(force = false) {
    if (!force && !this.isAuthenticated()) return;
    const now = Date.now();
    localStorage.setItem(this.ACTIVITY_KEY, String(now));
  }

  private setUser(user: User) {
    this.currentUserSignal.set(user);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.markActivity(true);
    this.startActivityCheck();
    this.audit.log('login', $localize`:@@auth.audit.login:Connexion de ${user.email}`);
  }

  private hydrateFromStorage() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
        const parsed: User = JSON.parse(raw);
        if (parsed && parsed.email) {
          const lastActivity = this.getLastActivity();
          if (lastActivity && Date.now() - lastActivity > this.INACTIVITY_LIMIT_MS) {
          this.logout($localize`:@@auth.logout.expired:Session expirée après inactivité prolongée`);
            return;
          }
          this.currentUserSignal.set(parsed);
          this.markActivity(true);
        this.startActivityCheck();
      }
    } catch {
      // ignore malformed storage
    }
  }

  private getLastActivity() {
    const raw = localStorage.getItem(this.ACTIVITY_KEY);
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }

  private startActivityCheck() {
    if (this.activityCheckHandle || typeof window === 'undefined' || !this.isAuthenticated()) return;
    this.activityCheckHandle = window.setInterval(() => this.enforceInactivityLimit(), 60 * 1000);
  }

  private stopActivityCheck() {
    if (this.activityCheckHandle) {
      clearInterval(this.activityCheckHandle);
      this.activityCheckHandle = null;
    }
  }

  private attachActivityListeners() {
    if (this.listenersAttached || typeof document === 'undefined') return;
    const handler = () => this.markActivity();
    const events: Array<keyof DocumentEventMap> = ['click', 'keydown', 'scroll', 'visibilitychange', 'mousemove'];
    events.forEach(event => document.addEventListener(event, handler, { passive: true }));
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.markActivity();
      }
    });
    this.listenersAttached = true;
  }
}

