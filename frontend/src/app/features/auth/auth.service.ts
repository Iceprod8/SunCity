import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/services/api.service';
import { User } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'suncity-user';
  private readonly currentUserSignal = signal<User | null>(null);
  readonly user = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private router: Router
  ) {
    this.hydrateFromStorage();
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .get<User[]>(this.api.url('/users'), { params: { email, password } })
      .pipe(
        map(users => {
          if (!users.length) {
            throw new Error('Identifiants invalides');
          }
          return users[0];
        }),
        tap(user => this.setUser(user))
      );
  }

  register(data: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.api.url('/users'), data).pipe(tap(u => this.setUser(u)));
  }

  logout() {
    this.currentUserSignal.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  private setUser(user: User) {
    this.currentUserSignal.set(user);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  private hydrateFromStorage() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const parsed: User = JSON.parse(raw);
      if (parsed && parsed.email) {
        this.currentUserSignal.set(parsed);
      }
    } catch {
      // ignore malformed storage
    }
  }
}

