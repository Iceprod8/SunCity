import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { New } from '../models/new.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class NewsService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getNews() { 
    return this.http.get<New[]>(this.api.url('/news')); 
  }

  findById(id: number): Observable<New> {
    return this.http.get<New>(this.api.url(`/news/${id}`));
  }

  findByTitle(title: string): Observable<New[]> {
    return this.http.get<New[]>(this.api.url(`/news`), { params: { title } });
  }

  create(newItem: Omit<New, 'id'>): Observable<New> {
    return this.http.post<New>(this.api.url('/news'), newItem);
  }

  update(id: number, patch: Partial<New>): Observable<New> {
    return this.http.patch<New>(this.api.url(`/news/${id}`), patch);
  }
}