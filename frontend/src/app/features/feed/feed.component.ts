import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { NewsService } from '../../shared/services/news.service';
import { WeatherService } from '../../shared/services/weather.service';
import { ActivityService } from '../../shared/services/activity.service';
import { EngagementService } from '../../shared/services/engagement.service';
import { New } from '../../shared/models/new.model';
import { Weather } from '../../shared/models/weather.model';
import { Activity } from '../../shared/models/activity.model';
import { AuthService } from '../auth/auth.service';
import { FeedComment } from '../../shared/models/engagement.model';
import { Friend } from '../../shared/models/friend.model';
import { FriendService } from '../../shared/services/friend.service';
import { Router } from '@angular/router';

type FeedType = 'news' | 'weather' | 'activity';

interface FeedItem {
  id: string;
  type: FeedType;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  badge: string;
  dateLabel: string;
  timestamp: number;
  likes: number;
  liked: boolean;
  comments: FeedComment[];
  weatherCondition?: string;
  minTemp?: number;
  maxTemp?: number;
  activityType?: string;
  activityDistanceKm?: number;
  activityScore?: number;
  payload: New | Weather | Activity;
}

interface Notice {
  id: string;
  message: string;
  level: 'info' | 'warn';
}

interface SnapshotState {
  newsIds: string[];
  weatherByDate: Record<string, { condition: string; min: number; max: number }>;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  private newsService = inject(NewsService);
  private weatherService = inject(WeatherService);
  private activityService = inject(ActivityService);
  private engagement = inject(EngagementService);
  private auth = inject(AuthService);
  private friendService = inject(FriendService);
  private router = inject(Router);

  feedItems: FeedItem[] = [];
  loading = true;
  error = false;
  notificationsEnabled = true;
  openComments: Record<string, boolean> = {};
  newComment: Record<string, string> = {};
  inAppNotices: Notice[] = [];

  friends: Friend[] = [];
  loadingFriends = false;
  openShareFor: string | null = null;

  ngOnInit() {
    this.refreshFriends();
    this.refreshFeed();
  }

  refreshFeed() {
    this.loading = true;
    forkJoin({
      news: this.newsService.getNews(),
      weather: this.weatherService.getWeather(),
      activities: this.activityService.getActivities()
    }).subscribe({
      next: ({ news, weather, activities }) => {
        this.buildFeed(news, weather, activities);
        this.loadEngagement();
        this.loading = false;
        this.error = false;
        this.handleChangeNotifications(news, weather);
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  toggleLike(item: FeedItem) {
    const user = this.auth.user();
    if (!user) return;
    this.engagement.toggleLike(item.id, String(user.id)).subscribe({
      next: ({ likes, liked }) => {
        item.likes = likes;
        item.liked = liked;
      }
    });
  }

  toggleComments(item: FeedItem) {
    this.openComments[item.id] = !this.openComments[item.id];
  }

  addComment(item: FeedItem) {
    const raw = this.newComment[item.id] ?? '';
    const text = raw.trim();
    if (!text) {
      return;
    }
    const user = this.auth.user();
    if (!user) return;
    const author = user.username || 'Vous';
    this.engagement.addComment(item.id, user.id, author, text).subscribe({
      next: comment => {
        item.comments = [comment, ...item.comments];
        this.newComment[item.id] = '';
      }
    });
  }

  share(item: FeedItem, channel: 'system' | 'link') {
    const url = this.buildShareUrl(item);
    if (channel === 'system' && typeof navigator !== 'undefined' && 'share' in navigator) {
      navigator
        .share({
          title: item.title,
          text: item.description || item.subtitle,
          url
        })
        .catch(() =>
          this.pushNotice(
            $localize`:@@feed.notice.shareCancelled:Partage annulé ou non supporté.`,
            'warn'
          )
        );
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          this.pushNotice(
            $localize`:@@feed.notice.linkCopied:Lien copié dans le presse-papiers.`,
            'info'
          );
        })
        .catch(() =>
          this.pushNotice(
            $localize`:@@feed.notice.linkError:Impossible de copier le lien.`,
            'warn'
          )
        );
    } else {
      this.pushNotice(
        $localize`:@@feed.notice.shareUnavailable:Partage indisponible sur ce navigateur.`,
        'warn'
      );
    }
  }

  toggleSharePanel(item: FeedItem) {
    this.openShareFor = this.openShareFor === item.id ? null : item.id;
  }

  shareToFriend(item: FeedItem, friend: Friend) {
    const friendId = String(friend.friendUserId);
    const friendLabel = friend.user?.username || friendId;
    this.pushNotice(
      $localize`:@@feed.notice.shareToFriend:Partage envoyé à ${friendLabel}.`,
      'info'
    );
  }

  requestNotifications() {
    this.notificationsEnabled = !this.notificationsEnabled;
    this.pushNotice(
      this.notificationsEnabled
        ? $localize`:@@feed.notice.notificationsEnabled:Notifications du fil perso activées.`
        : $localize`:@@feed.notice.notificationsDisabled:Notifications du fil perso désactivées.`,
      'info'
    );
  }

  dismissNotice(id: string) {
    this.inAppNotices = this.inAppNotices.filter(n => n.id !== id);
  }

  private buildFeed(news: New[], weather: Weather[], activities: Activity[]) {
    const newsItems = news.map(item => this.toNewsItem(item));
    const weatherItems = weather.slice(0, 5).map(item => this.toWeatherItem(item));
    const activityItems = activities.slice(0, 6).map((a, index) => this.toActivityItem(a, index));
    this.feedItems = [...newsItems, ...weatherItems, ...activityItems].sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  private toNewsItem(item: New): FeedItem {
    const id = `news-${item.id}`;
    return {
      id,
      type: 'news',
      title: item.title,
      subtitle: `${item.publisher} - ${this.humanDate(item.date)}`,
      description: this.buildPreview(item.excerpt || ''),
      image: item.photo ? `assets/${item.photo}` : undefined,
      badge: $localize`:@@feed.badge.news:Actualité`,
      dateLabel: this.humanDate(item.date),
      timestamp: this.timestampFromIso(item.date),
      likes: 0,
      liked: false,
      comments: [],
      payload: item
    };
  }

  private buildPreview(text: string, maxLength = 260): string {
    const value = (text || '').trim();
    if (!value) return '';
    if (value.length <= maxLength) return value;
    const slice = value.slice(0, maxLength);
    const lastSpace = slice.lastIndexOf(' ');
    const cut = lastSpace > 40 ? slice.slice(0, lastSpace) : slice;
    return `${cut}…`;
  }

  private toWeatherItem(item: Weather): FeedItem {
    const id = `weather-${item.date}`;
    const label = item.displayCondition || item.baseCondition || item.condition;
    const subtitleFallback = $localize`:@@feed.weather.subtitleDefault:Prévision locale`;
    const descriptionPrefix = $localize`:@@feed.weather.descriptionPrefix:Prévision`;
    const subtitleText = label || subtitleFallback;
    return {
      id,
      type: 'weather',
      title: $localize`:@@feed.weather.title:Météo du ${this.humanDate(item.date)}`,
      subtitle: subtitleText,
      description: `${label || descriptionPrefix} - ${item.min}C / ${item.max}C`,
      image: undefined,
      badge: $localize`:@@feed.badge.weather:Météo`,
      dateLabel: this.humanDate(item.date),
      timestamp: this.timestampFromIso(item.date),
      likes: 0,
      liked: false,
      comments: [],
      weatherCondition: label || '',
      minTemp: item.min,
      maxTemp: item.max,
      payload: item
    };
  }

  private toActivityItem(item: Activity, index: number): FeedItem {
    const id = `activity-${item.id}`;
    const distanceLabel = `${item.distanceKm} km`;
    const scoreLabel = `${item.popularity}/100`;
    const typeLabel = item.type;
    const subtitle = `${typeLabel} · ${distanceLabel}`;

    return {
      id,
      type: 'activity',
      title: item.name,
      subtitle,
      description: $localize`:@@feed.activity.description:Activité à proximité - ${typeLabel} (${distanceLabel}, score ${scoreLabel})`,
      image: item.photo ? `assets/${item.photo}` : undefined,
      badge: $localize`:@@feed.badge.activity:Activité`,
      dateLabel: $localize`:@@feed.activity.dateLabel:Aujourd'hui`,
      // léger décalage pour garder un ordre stable
      timestamp: Date.now() - index * 1000,
      likes: 0,
      liked: false,
      comments: [],
      activityType: item.type,
      activityDistanceKm: item.distanceKm,
      activityScore: item.popularity,
      payload: item
    };
  }

  private handleChangeNotifications(news: New[], weather: Weather[]) {
    const snapshot = this.loadSnapshot();
    const isFirstHydration = !snapshot.newsIds.length && !Object.keys(snapshot.weatherByDate).length;

    const freshNews = news.filter(n => !snapshot.newsIds.includes(String(n.id)));
    const changedWeather = weather.filter(w => {
      const prev = snapshot.weatherByDate[w.date];
      if (!prev) return false;
      const label = w.displayCondition || w.condition || '';
      return prev.condition !== label || prev.min !== w.min || prev.max !== w.max;
    });

    if (!isFirstHydration && this.notificationsEnabled) {
      freshNews.forEach(n =>
        this.pushNotice(
          $localize`:@@feed.notice.newNews:Nouvelle actualité : ${n.title} - ${n.publisher}`,
          'info'
        )
      );
      changedWeather.slice(0, 3).forEach(w => {
        const dayLabel = this.humanDate(w.date);
        this.pushNotice(
          $localize`:@@feed.notice.weatherUpdated:Météo mise à jour ${dayLabel} : ${w.condition} (${w.min}C/${w.max}C)`,
          'info'
        );
      });
    }

    this.saveSnapshot(news, weather);
  }

  private pushNotice(message: string, level: 'info' | 'warn' = 'info') {
    const notice: Notice = { id: this.buildId('notice'), message, level };
    this.inAppNotices = [notice, ...this.inAppNotices].slice(0, 3);
    setTimeout(() => this.dismissNotice(notice.id), 5000);
  }

  private buildShareUrl(item: FeedItem) {
    const base =
      typeof window !== 'undefined' && window.location ? window.location.origin : 'https://suncity.local';
    if (item.type === 'news' && 'id' in item.payload) {
      return `${base}/new/${(item.payload as New).id}`;
    }
    if (item.type === 'activity' && 'id' in item.payload) {
      return `${base}/activities/${(item.payload as Activity).id}`;
    }
    return `${base}/dashboard`;
  }

  openItem(item: FeedItem) {
    if (item.type === 'news') {
      const news = item.payload as New;
      this.router.navigate(['/new', news.id]);
    } else if (item.type === 'activity') {
      const activity = item.payload as Activity;
      this.router.navigate(['/activities', activity.id]);
    }
  }

  private loadSnapshot(): SnapshotState {
    try {
      const raw = localStorage.getItem('suncity-feed-snapshot');
      if (raw) {
        return JSON.parse(raw) as SnapshotState;
      }
    } catch {
      console.warn('Failed to load feed snapshot from localStorage');
    }
    return { newsIds: [], weatherByDate: {} };
  }

  private saveSnapshot(news: New[], weather: Weather[]) {
    const state: SnapshotState = {
      newsIds: news.map(n => String(n.id)),
      weatherByDate: weather.reduce<Record<string, { condition: string; min: number; max: number }>>(
        (acc, w) => {
          acc[w.date] = {
            condition: w.displayCondition || w.condition || '',
            min: w.min,
            max: w.max
          };
          return acc;
        },
        {}
      )
    };
    localStorage.setItem('suncity-feed-snapshot', JSON.stringify(state));
  }

  private humanDate(input: string) {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return input;
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
  }

  private timestampFromIso(input: string) {
    const date = new Date(input);
    const ts = date.getTime();
    return Number.isNaN(ts) ? Date.now() : ts;
  }

  private buildId(prefix: string) {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private loadEngagement() {
    const user = this.auth.user();
    if (!user || !this.feedItems.length) {
      return;
    }
    const ids = this.feedItems.map(i => i.id);
    this.engagement.getEngagement(ids, String(user.id)).subscribe({
      next: map => {
        this.feedItems = this.feedItems.map(item => {
          const e = map[item.id];
          if (!e) return item;
          return { ...item, likes: e.likes, liked: e.liked, comments: e.comments };
        });
      }
    });
  }

  private refreshFriends() {
    this.loadingFriends = true;
    const currentUser = this.auth.user();
    if (!currentUser) {
      this.friends = [];
      this.loadingFriends = false;
      return;
    }
    this.friendService.getFriendsForUser(String(currentUser.id)).subscribe({
      next: friends => {
        this.friends = friends;
        this.loadingFriends = false;
      },
      error: () => {
        this.friends = [];
        this.loadingFriends = false;
      }
    });
  }
}
