import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '../../shared/services/news.service';
import { New } from '../../shared/models/new.model';

@Component({
  selector: 'app-new',
  imports: [PageHeaderComponent, CommonModule],
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css'],
})
export class NewComponent {
  constructor(private route: ActivatedRoute) { }

  private newsService = inject(NewsService);
  public new: New | null = null;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.getNewDetails(id);

  }

  getNewDetails(id: number): void {
    this.newsService.findById(id).subscribe({
      next: (n) => {
        this.new = n;
      },
      error: () => {
        alert("Actualité introuvable.");
      }
    });
  }

  goBack(): void {
    window.history.back();
  }
}
