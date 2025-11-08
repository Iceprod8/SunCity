import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { passwordMatchValidator } from '../../../shared/services/password.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error: string | null = null;

  form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordMatchValidator() }
  );

  submit() {
    this.error = null;
    if (this.form.invalid) return;
    const { email, username, password } = this.form.getRawValue();
    this.auth
      .register({ email: email!, username: username!, password: password!})
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => (this.error = err.message || "Impossible de créer le compte")
      });
  }
}
