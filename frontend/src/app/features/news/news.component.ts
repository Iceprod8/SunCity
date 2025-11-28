import { Component, inject } from '@angular/core';
import {PageHeaderComponent } from '../../shared/components/page-header.component';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../shared/services/news.service';
import { New } from '../../shared/models/new.model';
import {MatPaginatorModule} from '@angular/material/paginator';

@Component({
  selector: 'app-news',
  imports: [PageHeaderComponent, CommonModule, MatPaginatorModule],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
})
export class NewsComponent {
  private newsService = inject(NewsService);

  newsList: New[] = [];
  firstPageLabel = `First page`;
  itemsPerPageLabel = `Items per page:`;
  lastPageLabel = `Last page`;
  nextPageLabel = 'Next page';
  previousPageLabel = 'Previous page';
  pageSize = 5;
  pageSizeOptions: number[] = [10, 20];
  
  ngOnInit() {
    this.newsService.getNews().subscribe(n => (this.newsList = n));
  }

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return `Page 1 of 1`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Page ${page + 1} of ${amountPages}`;
  }

  openModal(id: number) {
    const newsItem = this.newsList.find(n => n.id === id);
    if (newsItem) {
      alert(`Titre: ${newsItem.title}\n\nContenu: ${newsItem.excerpt}`);
    }
  }

}
