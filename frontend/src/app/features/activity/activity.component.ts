import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ActivityService } from '../../shared/services/activity.service';
import { Activity } from '../../shared/models/activity.model';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css'],
})
export class ActivityComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private activityService = inject(ActivityService);

  activity: Activity | null = null;

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/activities']);
      return;
    }
    this.loadActivity(idParam);
  }

  loadActivity(id: string) {
    this.activityService.getActivity(id).subscribe({
      next: act => (this.activity = act),
      error: () => {
        alert($localize`:@@activities.detail.notFound:Activité introuvable.`);
        this.router.navigate(['/activities']);
      }
    });
  }

  goBack() {
    window.history.back();
  }
}
