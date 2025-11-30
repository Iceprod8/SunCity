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

  
  ngOnInit() {
    this.getNews();
  }

  public getNews(): void {
    this.isLoading = true;
    this.newsService.getNews().subscribe({
      next: (n: New[]) => {
        this.isLoading = false;
        this.newsList = n;
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
    if(!this.searchQuery) {
      this.getNews();
      return;
    }
    this.isLoading = true;
    let query = this.searchQuery.toLowerCase().trim();
    this.newsList = this.newsList.filter(news => news.title.toLowerCase().trim().includes(query) || news.publisher?.toLowerCase().trim().includes(query));
  }

}
