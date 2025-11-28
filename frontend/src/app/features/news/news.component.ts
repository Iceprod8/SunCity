import { Component, inject } from '@angular/core';
import {PageHeaderComponent } from '../../shared/components/page-header.component';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../shared/services/news.service';
import { New } from '../../shared/models/new.model';

@Component({
  selector: 'app-news',
  imports: [PageHeaderComponent, CommonModule],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
})
export class NewsComponent {
  private newsService = inject(NewsService);

  newsList: New[] = [];
  
  ngOnInit() {
    this.newsService.getNews().subscribe(n => (this.newsList = n));
  }

}
