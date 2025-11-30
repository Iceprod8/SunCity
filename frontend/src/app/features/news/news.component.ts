import { Component, inject } from '@angular/core';
import {PageHeaderComponent } from '../../shared/components/page-header.component';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../shared/services/news.service';
import { New } from '../../shared/models/new.model';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-news',
  imports: [PageHeaderComponent, CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
})
export class NewsComponent {
  private newsService = inject(NewsService);
  private router = inject(Router);

  newsList: New[] = [];
  page = 1;
  newsPerPage = 6;
  isLoading = true;
  searchQuery: string = '';
  sortedNews: New[] = [];
  news: New[] = [];

  
  ngOnInit() {
    this.getNews();
  }

  public getNews(): void {
    this.isLoading = true;
    this.newsService.getNews().subscribe({
      next: (n: New[]) => {
        this.isLoading = false;
        this.newsList = n;
        this.news = n;
        this.sortedNews = [];
      },
      error: () => {
        this.isLoading = false;
      }
    })
  }

  pageChangeEvent(event: number){
      this.page = event;
      this.getNews();
  }


  openModal(id: number) {
    const newItem = this.newsList.find(n => n.id === id);
    if (newItem) {
      this.router.navigate(['/new', id]);
    }
    else{
      alert("Actualité introuvable.");
    }
  }

  filterNews(): void {
    const source = this.sortedNews.length > 0 ? this.sortedNews : this.news;
    
    if(!this.searchQuery) {
      this.news = source;
      return;
    }
    this.isLoading = true;
    let query = this.searchQuery.toLowerCase().trim();
    this.news = source.filter(news => news.title.toLowerCase().trim().includes(query) || news.publisher?.toLowerCase().trim().includes(query));
  }

   sortNews(mode: string): void {
    if (!mode) {
      this.sortedNews = [];
      this.news = [...this.newsList];
      return;
    }
    this.sortedNews = [...this.news]; 

    if (mode === 'date-desc') {
      this.sortedNews.sort((a, b) => 
        {
          console.log(new Date(a.date).getTime(), new Date(b.date).getTime());
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    } else if (mode === 'date-asc') {
      this.sortedNews.sort((a, b) => 
        {
          console.log(new Date(b.date).getTime(), new Date(a.date).getTime());
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }
    this.news = this.sortedNews;
  }

}
