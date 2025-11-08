import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient, private api: ApiService) {}

  findById(id: number): Observable<User> {
    return this.http.get<User>(this.api.url(`/users/${id}`));
  }

  findByEmail(email: string): Observable<User[]> {
    return this.http.get<User[]>(this.api.url(`/users`), { params: { email } });
  }

  create(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.api.url('/users'), user);
  }

  update(id: number, patch: Partial<User>): Observable<User> {
    return this.http.patch<User>(this.api.url(`/users/${id}`), patch);
  }
}

