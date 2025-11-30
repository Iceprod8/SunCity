import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { FeedComment, FeedLikeRecord, ItemEngagement, FeedCommentRecord } from '../models/engagement.model';

@Injectable({ providedIn: 'root' })
export class EngagementService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getEngagement(itemIds: string[], userId: string | number): Observable<Record<string, ItemEngagement>> {
    const ids = new Set(itemIds);
    return forkJoin({
      likes: this.http.get<FeedLikeRecord[]>(this.api.url('/feedLikes')),
      comments: this.http.get<FeedCommentRecord[]>(this.api.url('/feedComments'))
    }).pipe(
      map(({ likes, comments }) => {
        const result: Record<string, ItemEngagement> = {};
        likes
          .filter(like => ids.has(like.itemId))
          .forEach(like => {
            if (!result[like.itemId]) {
              result[like.itemId] = { likes: 0, liked: false, comments: [] };
            }
            result[like.itemId].likes++;
            if (String(like.userId) === String(userId)) {
              result[like.itemId].liked = true;
            }
          });
        comments
          .filter(c => ids.has(c.itemId))
          .sort((a, b) => b.at.localeCompare(a.at))
          .forEach(c => {
            if (!result[c.itemId]) {
              result[c.itemId] = { likes: 0, liked: false, comments: [] };
            }
            result[c.itemId].comments.push({
              id: String(c.id),
              author: c.author,
              text: c.text,
              at: c.at
            });
          });
        return result;
      })
    );
  }

  toggleLike(itemId: string, userId: string | number): Observable<{ likes: number; liked: boolean }> {
    const baseUrl = this.api.url('/feedLikes');
    const user = String(userId);
    return this.http.get<FeedLikeRecord[]>(baseUrl).pipe(
      switchMap(all => {
        const existing = all.find(like => like.itemId === itemId && String(like.userId) === user);

        if (existing) {
          return this.http
            .delete<void>(`${baseUrl}/${existing.id}`)
            .pipe(switchMap(() => this.http.get<FeedLikeRecord[]>(baseUrl)));
        }

        return this.http
          .post<FeedLikeRecord>(baseUrl, {
            itemId,
            userId,
            createdAt: new Date().toISOString()
          })
          .pipe(switchMap(() => this.http.get<FeedLikeRecord[]>(baseUrl)));
      }),
      map((nextAll: FeedLikeRecord[]) => {
        const likesForItem = nextAll.filter(l => l.itemId === itemId);
        const likedNow = likesForItem.some(l => String(l.userId) === user);
        return { likes: likesForItem.length, liked: likedNow };
      })
    );
  }

  addComment(itemId: string, userId: string | number, author: string, text: string): Observable<FeedComment> {
    const record: Omit<FeedCommentRecord, 'id'> = {
      itemId,
      userId,
      author,
      text,
      at: new Date().toISOString()
    };
    return this.http
      .post<FeedCommentRecord>(this.api.url('/feedComments'), record)
      .pipe(map(res => ({ id: String(res.id), author: res.author, text: res.text, at: res.at })));
  }

  logShare(itemId: string, channel: string, target?: string): void {
    // Optionally extend to backend later; for now we ignore persistence for shares.
  }
}
