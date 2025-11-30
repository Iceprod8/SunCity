import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '../../shared/services/news.service';
import { New } from '../../shared/models/new.model';
import { EngagementService } from '../../shared/services/engagement.service';
import { AuthService } from '../auth/auth.service';
import { FeedComment, ItemEngagement } from '../../shared/models/engagement.model';

@Component({
  selector: 'app-new',
  standalone: true,
  imports: [PageHeaderComponent, CommonModule, FormsModule],
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css'],
})
export class NewComponent {
  constructor(private route: ActivatedRoute) {}

  private newsService = inject(NewsService);
  private engagement = inject(EngagementService);
  private auth = inject(AuthService);

  public new: New | null = null;
  likes = 0;
  liked = false;
  comments: FeedComment[] = [];
  newComment = '';
  private itemId = '';
  private commentAuthorFallback = $localize`:@@news.comment.authorFallback:Vous`;

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    this.itemId = `news-${idParam}`;
    this.getNewDetails(id);
    this.loadEngagement();
  }

  getNewDetails(id: number): void {
    this.newsService.findById(id).subscribe({
      next: (n) => {
        this.new = n;
      },
      error: () => {
        alert($localize`:@@news.notFound:Actualité introuvable.`);
      }
    });
  }

  private loadEngagement() {
    const user = this.auth.user();
    if (!user) return;
    this.engagement.getEngagement([this.itemId], String(user.id)).subscribe({
      next: (map: Record<string, ItemEngagement>) => {
        const e = map[this.itemId];
        if (e) {
          this.likes = e.likes;
          this.liked = e.liked;
          this.comments = e.comments;
        }
      }
    });
  }

  toggleLike() {
    const user = this.auth.user();
    if (!user) return;
    this.engagement.toggleLike(this.itemId, String(user.id)).subscribe({
      next: ({ likes, liked }) => {
        this.likes = likes;
        this.liked = liked;
      }
    });
  }

  addComment() {
    const text = this.newComment.trim();
    if (!text) return;
    const user = this.auth.user();
    if (!user) return;
    const author = user.username || this.commentAuthorFallback;
    this.engagement.addComment(this.itemId, user.id, author, text).subscribe({
      next: comment => {
        this.comments = [comment, ...this.comments];
        this.newComment = '';
      }
    });
  }

  goBack(): void {
    window.history.back();
  }
}
