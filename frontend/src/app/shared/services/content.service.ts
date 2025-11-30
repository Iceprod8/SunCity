import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Activity } from '../models/activity.model';
import { Weather } from '../models/weather.model';
import { getPreferredLanguage, AppLanguage } from '../i18n';
import { New } from '../models/new.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getArticles() {
    const lang = getPreferredLanguage();
    return this.http.get<New[]>(this.api.url('/articles')).pipe(
      map(list => list.map(article => this.localizeArticle(article, lang)))
    );
  }

  getActivities() {
    const lang = getPreferredLanguage();
    return this.http.get<Activity[]>(this.api.url('/activities')).pipe(
      map(list => list.map(activity => this.localizeActivity(activity, lang)))
    );
  }

  getWeather() {
    const lang = getPreferredLanguage();
    return this.http.get<Weather[]>(this.api.url('/weather')).pipe(
      map(list => list.map(weather => this.localizeWeather(weather, lang)))
    );
  }

  private localizeArticle(article: New, lang: AppLanguage): New {
    return {
      ...article,
      title: this.pick(article, 'title', lang),
      publisher: this.pick(article, 'publisher', lang),
      excerpt: this.pick(article, 'excerpt', lang)
    };
  }

  private localizeActivity(activity: Activity, lang: AppLanguage): Activity {
    return {
      ...activity,
      name: this.pick(activity, 'name', lang),
      type: this.pick(activity, 'type', lang)
    };
  }

  private localizeWeather(weather: Weather, lang: AppLanguage): Weather {
    const baseCondition = weather.condition;
    return {
      ...weather,
      baseCondition,
      displayCondition: this.pick(weather, 'condition', lang) || baseCondition
    };
  }

  private pick<T extends Record<string, any>>(source: T, key: string, lang: AppLanguage) {
    const localized = source[`${key}_${lang}`];
    return localized ?? source[key];
  }
}
