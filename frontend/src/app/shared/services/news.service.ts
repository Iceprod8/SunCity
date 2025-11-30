import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { New } from '../models/new.model';

@Injectable({ providedIn: 'root' })
export class NewsService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getNews() { 
    return this.http.get<New[]>(this.api.url('/news')); 
  }

  findById(id: number): Observable<New> {
    return this.http.get<New>(this.api.url(`/news/${id}`));
  }

}