import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ContentService } from '../../shared/services/content.service';
import { Article } from '../../shared/models/article.model';
import { Activity } from '../../shared/models/activity.model';
import { Weather } from '../../shared/models/weather.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private content = inject(ContentService);
  user = this.auth.user;
  initials = computed(() => {
    const name = this.user()?.username?.trim() || '';
    if (!name) return '';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  });
  articles: Article[] = [];
  activities: Activity[] = [];
  weather: Weather[] = [];

  ngOnInit() {
    this.content.getArticles().subscribe(a => (this.articles = a.slice(0, 3)));
    this.content.getActivities().subscribe(a => (this.activities = a.slice(0, 3)));
    this.content.getWeather().subscribe(w => (this.weather = w.slice(0, 1)));
  }

  logout() {
    this.auth.logout();
  }
}
