import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { Friend, FriendRecord } from '../models/friend.model';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class FriendService {
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private userService: UserService
  ) {}

  getFriendsForUser(userId: string | number): Observable<Friend[]> {
    const ownerId = String(userId);
    return forkJoin({
      friends: this.http.get<FriendRecord[]>(this.api.url('/friends'), {
        params: { ownerId }
      }),
      users: this.userService.list()
    }).pipe(
      map(({ friends, users }) =>
        friends.map(f => ({
          ...f,
          user: this.resolveUser(users, f.friendUserId)
        }))
      )
    );
  }

  addFriendForUser(ownerId: string | number, friendUserId: string | number, note?: string) {
    const payload: Omit<FriendRecord, 'id'> = {
      ownerId,
      friendUserId,
      note: note?.trim()
    };
    return this.http.post<FriendRecord>(this.api.url('/friends'), payload);
  }

  removeFriend(id: string | number) {
    return this.http.delete<void>(this.api.url(`/friends/${id}`));
  }

  updateFriend(id: string | number, changes: Partial<FriendRecord>) {
    return this.http.patch<FriendRecord>(this.api.url(`/friends/${id}`), changes);
  }

  private resolveUser(users: User[], id: string | number) {
    return users.find(u => String(u.id) === String(id));
  }
}
