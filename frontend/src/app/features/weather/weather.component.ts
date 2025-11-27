import { Component } from '@angular/core';
import {PageHeaderComponent } from '../../shared/components/page-header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weather',
  imports: [PageHeaderComponent, CommonModule],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
})
export class WeatherComponent {

}
