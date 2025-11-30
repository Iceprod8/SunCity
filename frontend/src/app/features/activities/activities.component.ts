import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../../shared/services/activity.service';
import { Activity } from '../../shared/models/activity.model';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-activities',
  styleUrls: ['./activities.component.css'],
  imports: [PageHeaderComponent, CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: './activities.component.html',
})
export class ActivitiesComponent {

  page = 1;
  activitiesPerPage = 8;
  isLoading = true;
  activities: Activity[] = [];
  allActivities: Activity[] = [];
  sortedActivities: Activity[] = [];
  searchQuery: string = '';

  activity = inject(ActivityService);

  ngOnInit() {
    this.getActivites();
  }

  public getActivites(): void {
    this.isLoading = true;
    this.activity.getActivities().subscribe({
      next: (a) => {
        this.isLoading = false;
        this.activities = a;
        this.allActivities = a;
        this.sortedActivities = [];
      },
      error: (e) => {
        this.isLoading = false;
      }
    })
  }

  pageChangeEvent(event: number){
    this.page = event;
  }

  filterActivities(): void {
    const source = this.sortedActivities.length > 0 ? this.sortedActivities : this.activities;
    
    if(!this.searchQuery) {
      this.activities = source;
      return;
    }

    let query = this.searchQuery.toLowerCase().trim();
    this.activities = source.filter(activity => activity.name.toLowerCase().trim().includes(query) || activity.type?.toLowerCase().trim().includes(query));
  }

  sortActivities(mode: string): void {
    if (!mode) {
      this.sortedActivities = [];
      this.activities = [...this.allActivities];
      return;
    }
    this.sortedActivities = [...this.activities]; 

    if (mode === 'distance-asc') {
      this.sortedActivities.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (mode === 'distance-desc') {
      this.sortedActivities.sort((a, b) => b.distanceKm - a.distanceKm);
    }
    else if (mode === 'score-asc') {
      this.sortedActivities.sort((a, b) => a.popularity - b.popularity);
    }
    else if (mode === 'score-desc') {
      this.sortedActivities.sort((a, b) => b.popularity - a.popularity);
    }

    this.activities = this.sortedActivities;
  }
}
