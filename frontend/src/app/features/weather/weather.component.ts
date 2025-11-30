import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { Weather } from '../../shared/models/weather.model';
import { WeatherService } from '../../shared/services/weather.service';

@Component({
  selector: 'app-weather',
  imports: [PageHeaderComponent, CommonModule],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
})
export class WeatherComponent implements OnInit {
  weather: Weather[] = [];
  selectedWeather: Weather | null = null;

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.weatherService.getWeather().subscribe(data => {
      this.weather = data;
      this.selectedWeather = data[0] || null;
    });
  }

  selectWeather(day: Weather) {
    this.selectedWeather = day;
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
    return '🌡️';
  }
}
