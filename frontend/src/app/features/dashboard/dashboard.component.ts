import { Component, LOCALE_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ContentService } from '../../shared/services/content.service';
import { Article } from '../../shared/models/article.model';
import { Activity } from '../../shared/models/activity.model';
import { Weather } from '../../shared/models/weather.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { AuditService } from '../../shared/services/audit.service';

type TrainingDayState = 'current' | 'done' | 'scheduled';
type TrainingDay = { day: number; date: string; state: TrainingDayState };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private content = inject(ContentService);
  private audit = inject(AuditService);
  private locale = inject(LOCALE_ID);
  user = this.auth.user;

  readonly targetYear = 2025;
  readonly targetMonthIndex = 10;
  articles: Article[] = [];
  activities: Activity[] = [];
  weather: Weather[] = [];
  trainingDays: TrainingDay[] = [];
  selectedDate = this.formatDate(new Date(this.targetYear, this.targetMonthIndex, 1));
  selectedWeather: Weather | null = null;
  auditEntries = this.audit.entries;
  noDataText = $localize`:@@dashboard.weather.noData:Pas de données pour cette date`;
  legendToday = $localize`:@@dashboard.legendToday:Aujourd'hui`;

  ngOnInit() {
    this.content.getArticles().subscribe(a => (this.articles = a.slice(0, 3)));
    this.content.getActivities().subscribe(a => (this.activities = a.slice(0, 3)));
    this.content.getWeather().subscribe(w => {
      this.weather = w;
      const todayIso = this.formatDate(new Date());
      const defaultDate = this.isTargetMonth(todayIso) ? todayIso : w[0]?.date || this.selectedDate;
      this.selectDate(defaultDate);
    });
    this.trainingDays = this.buildTrainingDays();
  }

  get monthLabel() {
    return new Intl.DateTimeFormat(this.locale, { month: 'long', year: 'numeric' }).format(
      new Date(this.targetYear, this.targetMonthIndex, 1)
    );
  }

  get weatherIcon() {
    const condition =
      (this.selectedWeather?.baseCondition ||
        this.selectedWeather?.displayCondition ||
        this.selectedWeather?.condition ||
        '').toLowerCase();
    if (condition.includes('sun') || condition.includes('soleil')) return '☀️';
    if (condition.includes('pluie') || condition.includes('rain')) return '🌧️';
    if (condition.includes('nuage') || condition.includes('cloud')) return '☁️';
    if (condition.includes('orage') || condition.includes('storm')) return '⛈️';
    if (condition.includes('brouillard') || condition.includes('fog')) return '🌫️';
    if (condition.includes('vent') || condition.includes('wind')) return '💨';
    return '⛅';
  }

  get selectedDateLabel() {
    if (!this.selectedDate) return this.noDataText;
    const date = this.dateFromIso(this.selectedDate);
    return new Intl.DateTimeFormat(this.locale, { day: 'numeric', month: 'long' }).format(date);
  }

  tooltipFor(date: string) {
    return $localize`:@@dashboard.calendarTooltip:Voir la météo du ${date}`;
  }

  temperatureRange() {
    const min = this.selectedWeather?.min ?? '--';
    const max = this.selectedWeather?.max ?? '--';
    return $localize`:@@dashboard.weather.tempRange:Mini ${min} C - Maxi ${max} C`;
  }

  activityScore(value: number) {
    return $localize`:@@dashboard.activities.score:Score ${value}/100`;
  }

  scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  selectDate(date: string) {
    this.selectedDate = date;
    this.selectedWeather = this.weather.find(w => w.date === date) || null;
  }

  private buildTrainingDays(): TrainingDay[] {
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === this.targetYear && today.getMonth() === this.targetMonthIndex;
    const todayDay = isCurrentMonth ? today.getDate() : null;
    const daysInMonth = new Date(this.targetYear, this.targetMonthIndex + 1, 0).getDate();

    return Array.from({ length: daysInMonth }).map((_, idx) => {
      const day = idx + 1;
      const date = this.formatDate(new Date(this.targetYear, this.targetMonthIndex, day));
      const state: TrainingDayState = todayDay && day === todayDay ? 'current' : 'scheduled';
      return { day, date, state };
    });
  }

  private formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isTargetMonth(dateStr: string) {
    const [year, month] = dateStr.split('-').map(Number);
    return year === this.targetYear && month === this.targetMonthIndex + 1;
  }

  private dateFromIso(dateStr: string) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
