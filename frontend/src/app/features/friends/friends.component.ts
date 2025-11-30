import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { Friend } from '../../shared/models/friend.model';
import { FriendService } from '../../shared/services/friend.service';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/models/user.model';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  private friendService = inject(FriendService);
  private userService = inject(UserService);
  private auth = inject(AuthService);

  friends: Friend[] = [];
  allUsers: User[] = [];
  availableChoices: User[] = [];
  loading = true;
  saving = false;
  error = false;
  searchTerm = '';
  note = '';
  readonly maxShownChoices = 5;
  fallbackUserLabel = $localize`:@@friends.list.unknownUser:Utilisateur`;
  fallbackCityLabel = $localize`:@@friends.list.unknownCity:Ville inconnue`;

  ngOnInit() {
    this.loadUsers();
    this.loadFriends();
  }

  addFriendFromUser(user: User) {
    if (!user || this.saving) return;
    const currentUser = this.auth.user();
    if (!currentUser) return;

    this.saving = true;
    this.friendService
      .addFriendForUser(String(currentUser.id), user.id, this.note)
      .subscribe({
        next: friend => {
          this.resetForm();
          this.loadFriends();
        },
        error: () => {
          this.error = true;
          this.saving = false;
        }
      });
  }

  removeFriend(id: string | number) {
    this.friendService.removeFriend(id).subscribe({
      next: () => {
        this.loadFriends();
      },
      error: () => (this.error = true)
    });
  }

  private loadFriends() {
    this.loading = true;
    const currentUser = this.auth.user();
    if (!currentUser) {
      this.friends = [];
      this.loading = false;
      return;
    }
    this.friendService.getFriendsForUser(String(currentUser.id)).subscribe({
      next: friends => {
        this.friends = friends;
        this.loading = false;
        this.saving = false;
        this.error = false;
        this.updateChoices();
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  private loadUsers() {
    this.userService.list().subscribe({
      next: users => {
        this.allUsers = users;
        this.updateChoices();
      },
      error: () => {
        this.error = true;
      }
    });
  }

  private updateChoices() {
    const currentUserId = this.auth.user()?.id;
    const friendIds = new Set(this.friends.map(f => String(f.friendUserId)));
    this.availableChoices = this.allUsers.filter(
      u => String(u.id) !== String(currentUserId || '') && !friendIds.has(String(u.id))
    );
  }

  private resetForm() {
    this.searchTerm = '';
    this.note = '';
  }

  get filteredChoices(): User[] {
    const term = this.searchTerm.trim().toLowerCase();
    const base = !term
      ? this.availableChoices
      : this.availableChoices.filter(u => {
        const name = (u.username || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return name.includes(term) || email.includes(term);
      });
    return base.slice(0, this.maxShownChoices);
  }
}
