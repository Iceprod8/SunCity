import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ContentService } from '../../shared/services/content.service';
import { Article } from '../../shared/models/article.model';
import { Activity } from '../../shared/models/activity.model';
import { Weather } from '../../shared/models/weather.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

type TrainingDayState = 'current' | 'done' | 'scheduled';
type TrainingDay = { day: number; state: TrainingDayState };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private content = inject(ContentService);
  user = this.auth.user;

  articles: Article[] = [];
  activities: Activity[] = [];
  weather: Weather[] = [];
  trainingDays: TrainingDay[] = [];

  ngOnInit() {
    this.content.getArticles().subscribe(a => (this.articles = a.slice(0, 3)));
    this.content.getActivities().subscribe(a => (this.activities = a.slice(0, 3)));
    this.content.getWeather().subscribe(w => (this.weather = w.slice(0, 1)));
    this.trainingDays = this.buildTrainingDays();
  }

  get todayWeather(): Weather | null {
    return this.weather[0] || null;
  }

  get weatherIcon() {
    const condition = (this.todayWeather?.condition || '').toLowerCase();
    if (condition.includes('sun')) return '☀️';
    if (condition.includes('pluie') || condition.includes('rain')) return '🌧️';
    if (condition.includes('nuage') || condition.includes('cloud')) return '☁️';
    if (condition.includes('orage')) return '⛈️';
    return '🌤️';
  }

  get monthLabel() {
    return new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date());
  }

  scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private buildTrainingDays(): TrainingDay[] {
    const today = new Date().getDate();
    const doneDays = new Set([1, 2, 4, 6, 9, 12, 15, 18, 20]);
    const scheduled = new Set([22, 24, 27]);
    return Array.from({ length: 30 }).map((_, idx) => {
      const day = idx + 1;
      let state: TrainingDayState = 'done';
      if (scheduled.has(day)) state = 'scheduled';
      if (day === today) state = 'current';
      if (!doneDays.has(day) && !scheduled.has(day) && day < today) state = 'done';
      return { day, state };
    });
  }
}
