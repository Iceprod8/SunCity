import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private users = inject(UserService);

  userId = Number(this.route.snapshot.paramMap.get('id'));

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    city: ['', []]
  });

  status: 'idle' | 'saving' | 'saved' | 'error' = 'idle';

  ngOnInit() {
    if (this.userId) {
      this.users.findById(this.userId).subscribe((u) => {
        this.form.patchValue({
          username: u.username ?? '',
          city: u.city ?? '',
        });
      });
    }
  }

  save() {
    if (this.form.invalid || !this.userId) return;
    this.status = 'saving';
    this.users
      .update(this.userId, this.form.getRawValue())
      .subscribe({
        next: () => (this.status = 'saved'),
        error: () => (this.status = 'error')
      });
  }
}
