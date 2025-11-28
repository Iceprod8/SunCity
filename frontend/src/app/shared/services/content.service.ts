import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { Article } from '../models/article.model';
import { Weather } from '../models/weather.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getArticles() { return this.http.get<Article[]>(this.api.url('/articles')); }
  getWeather() { return this.http.get<Weather[]>(this.api.url('/weather')); }
}
