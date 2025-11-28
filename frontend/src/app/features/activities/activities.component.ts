import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../../shared/services/activity.service';
import { Activity } from '../../shared/models/activity.model';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-activities',
  imports: [PageHeaderComponent, CommonModule, NgxPaginationModule],
  templateUrl: './activities.component.html',
})
export class ActivitiesComponent {

  page = 1;
  activitiesPerPage = 8;
  isLoading = true;
  activities: Activity[] = [];

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
      },
      error: (e) => {
        this.isLoading = false;
      }
    })
  }

  pageChangeEvent(event: number){

      this.page = event;

      this.getActivites();
  }

}
