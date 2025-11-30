import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';
import { NewsComponent } from './features/news/news.component';
import { WeatherComponent } from './features/weather/weather.component';
import { ActivitiesComponent } from './features/activities/activities.component';
import { authGuard } from './features/auth/auth.guard';
import { SettingsComponent } from './features/settings/settings.component';
import { NewComponent } from './features/new/new.component';
import { FriendsComponent } from './features/friends/friends.component';
import { ActivityComponent } from './features/activity/activity.component';

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
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'friends',
    component: FriendsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'news',
    component: NewsComponent,
    canActivate: [authGuard]
  },
    {
    path: 'weather',
    component: WeatherComponent,
    canActivate: [authGuard]
  },
  {
    path: 'activities/:id',
    component: ActivityComponent,
    canActivate: [authGuard]
  },
  {
    path: 'activities',
    component: ActivitiesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard]
  },
    {
    path: 'new/:id',
    component: NewComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' },
];
