import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { Activity } from '../models/activity.model';
import { Weather } from '../models/weather.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getActivities() { 
    return this.http.get<Activity[]>(this.api.url('/activities')); 
  }

  getWeather() { 
    return this.http.get<Weather[]>(this.api.url('/weather')); 
  }
}
