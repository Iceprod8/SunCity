import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { Weather } from '../models/weather.model';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getWeather() {
    return this.http.get<Weather[]>(this.api.url('/weather'));
  }
}
