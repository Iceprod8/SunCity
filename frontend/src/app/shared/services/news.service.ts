import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { New } from '../models/new.model';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private locale = inject(LOCALE_ID);

  constructor(private http: HttpClient, private api: ApiService) {}

  getNews(): Observable<New[]> {
    return this.http
      .get<New[]>(this.api.url('/news'))
      .pipe(map(list => list.map(n => this.withLocale(n))));
  }

  findById(id: number): Observable<New> {
    return this.http
      .get<New>(this.api.url(`/news/${id}`))
      .pipe(map(n => this.withLocale(n)));
  }

  private withLocale(item: New): New {
    const raw = (this.locale || 'fr').toString().toLowerCase();
    const lang: 'fr' | 'en' | 'de' =
      raw.startsWith('en') ? 'en' : raw.startsWith('de') ? 'de' : 'fr';

    if (lang === 'fr') {
      return item;
    }

    if (lang === 'en') {
      return {
        ...item,
        title: item.title_en || item.title,
        publisher: item.publisher_en || item.publisher,
        excerpt: item.excerpt_en || item.excerpt
      };
    }

    return {
      ...item,
      title: item.title_de || item.title,
      publisher: item.publisher_de || item.publisher,
      excerpt: item.excerpt_de || item.excerpt
    };
  }
}
