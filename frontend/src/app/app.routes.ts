import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';
import { NewsComponent } from './features/news/news.component';
import { WeatherComponent } from './features/weather/weather.component';
import { ActivitiesComponent } from './features/activities/activities.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'news',
    component: NewsComponent
  },
    {
    path: 'weather',
    component: WeatherComponent
  },
      {
    path: 'activities',
    component: ActivitiesComponent
  },
  { path: '**', redirectTo: 'login' },
];
