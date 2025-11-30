import { Component, LOCALE_ID, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { Weather } from '../../shared/models/weather.model';
import { WeatherService } from '../../shared/services/weather.service';

type Palette = { from: string; via: string; to: string; dark: boolean };
type CalendarDay = { day: number; date: string; hasData: boolean; isToday: boolean };

@Component({
  selector: 'app-weather',
  imports: [PageHeaderComponent, CommonModule],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
})
export class WeatherComponent implements OnInit {
  weather: Weather[] = [];
  selectedWeather: Weather | null = null;
  selectedDate = '';
  calendarDays: CalendarDay[] = [];

  private year = 2025;
  private monthIndex = 10;
  private locale = inject(LOCALE_ID);

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.weatherService.getWeather().subscribe(data => {
      this.weather = data;
      if (data.length) {
        const first = new Date(data[0].date);
        this.year = first.getFullYear();
        this.monthIndex = first.getMonth();
      }
      this.buildCalendar();
      const todayIso = this.todayIso();
      const todayInData = data.find(d => d.date === todayIso);
      const defaultDate = todayInData?.date || data[0]?.date;
      if (defaultDate) {
        this.selectDate(defaultDate);
      }
    });
  }

  get monthLabel() {
    return new Intl.DateTimeFormat(this.locale || 'fr-FR', {
      month: 'long',
      year: 'numeric'
    }).format(new Date(this.year, this.monthIndex, 1));
  }

  selectDate(date: string) {
    this.selectedDate = date;
    this.selectedWeather = this.weather.find(d => d.date === date) || null;
  }

  paletteForDay(day: Weather): Palette {
    return this.buildPalette(day.condition || '', (day.min + day.max) / 2);
  }

  paletteForPeriod(period: Weather['periods'][number], day: Weather): Palette {
    const temp = period?.temp ?? (day.min + day.max) / 2;
    return this.buildPalette(period?.condition || day.condition || '', temp);
  }

  gradientStyle(palette: Palette) {
    return {
      background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.via} 45%, ${palette.to} 100%)`
    };
  }

  formattedDate(date: string) {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  conditionIcon(condition?: string) {
    const value = (condition || '').toLowerCase();
    if (value.includes('sun')) return '☀️';
    if (value.includes('partly') || value.includes('cloud')) return '⛅';
    if (value.includes('rain')) return '🌧️';
    if (value.includes('storm')) return '⛈️';
    if (value.includes('wind')) return '💨';
    if (value.includes('fog')) return '🌫️';
    if (value.includes('snow')) return '❄️';
    return '🌙';
  }

  badges(condition?: string) {
    const value = (condition || '').toLowerCase();
    const badges: { icon: string; label: string }[] = [];
    if (value.includes('storm')) {
      badges.push({ icon: '⛈️', label: $localize`:@@weather.badge.storm:Risque d'orage` });
    }
    if (value.includes('rain')) {
      badges.push({ icon: '🌧️', label: $localize`:@@weather.badge.rain:Pluie prévue` });
    }
    if (value.includes('snow')) {
      badges.push({ icon: '❄️', label: $localize`:@@weather.badge.snow:Neige possible` });
    }
    if (value.includes('wind')) {
      badges.push({ icon: '💨', label: $localize`:@@weather.badge.wind:Vent soutenu` });
    }
    return badges;
  }

  alertFor(condition?: string) {
    const value = (condition || '').toLowerCase();

    if (!value) return null;

    if (value.includes('storm') || value.includes('orage')) {
      return {
        tone: 'storm',
        icon: '⛈️',
        title: $localize`:@@weather.alert.storm.title:Risque d'orage`,
        message: $localize`:@@weather.alert.storm.message:Éviter les longues sorties en extérieur et se tenir à l'abri lors des averses les plus fortes.`
      };
    }

    if (value.includes('rain') || value.includes('pluie')) {
      return {
        tone: 'rain',
        icon: '🌧️',
        title: $localize`:@@weather.alert.rain.title:Risque de pluie`,
        message: $localize`:@@weather.alert.rain.message:Privilégier une protection imperméable, des chaussures fermées et anticiper des temps de trajet un peu plus longs.`
      };
    }

    if (value.includes('snow') || value.includes('neige')) {
      return {
        tone: 'snow',
        icon: '❄️',
        title: $localize`:@@weather.alert.snow.title:Risque de neige`,
        message: $localize`:@@weather.alert.snow.message:Prévoir une tenue chaude, rester prudent sur les routes et les trottoirs glissants.`
      };
    }

    if (value.includes('wind') || value.includes('vent')) {
      return {
        tone: 'wind',
        icon: '💨',
        title: $localize`:@@weather.alert.wind.title:Vent soutenu`,
        message: $localize`:@@weather.alert.wind.message:Sécuriser les objets à l'extérieur et limiter les activités en hauteur ou en bord de mer.`
      };
    }

    return null;
  }

  private buildPalette(condition: string, temp: number): Palette {
    const value = condition.toLowerCase();

    if (value.includes('storm')) return this.palette('#020617', '#0f172a', '#111827', true);
    if (value.includes('rain')) return this.palette('#0f172a', '#1e293b', '#0ea5e9', true);
    if (value.includes('snow')) return this.palette('#e0f2fe', '#bae6fd', '#7dd3fc', false);
    if (value.includes('fog')) return this.palette('#e2e8f0', '#cbd5e1', '#94a3b8', false);
    if (value.includes('wind')) return this.palette('#38bdf8', '#0ea5e9', '#1e293b', true);
    if (value.includes('cloud')) return this.palette('#cbd5e1', '#a5b4fc', '#6366f1', false);

    if (temp >= 27) return this.palette('#f97316', '#fb923c', '#ef4444', true);
    if (temp >= 20) return this.palette('#fbbf24', '#f59e0b', '#f97316', false);
    if (temp >= 12) return this.palette('#fde68a', '#facc15', '#f59e0b', false);
    if (temp >= 5) return this.palette('#93c5fd', '#60a5fa', '#2563eb', false);
    return this.palette('#0ea5e9', '#2563eb', '#0b1120', true);
  }

  private palette(from: string, via: string, to: string, dark: boolean): Palette {
    return { from, via, to, dark };
  }

  private buildCalendar() {
    const daysInMonth = new Date(this.year, this.monthIndex + 1, 0).getDate();
    const todayIso = this.todayIso();
    const hasWeatherFor = new Set(this.weather.map(w => w.date));

    const days: CalendarDay[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = this.isoFromParts(this.year, this.monthIndex, day);
      days.push({
        day,
        date,
        hasData: hasWeatherFor.has(date),
        isToday: date === todayIso,
      });
    }
    this.calendarDays = days;
  }

  private todayIso() {
    const now = new Date();
    return this.isoFromParts(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private isoFromParts(year: number, monthIndex: number, day: number) {
    const m = String(monthIndex + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }
}

