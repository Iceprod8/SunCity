import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(passwordKey = 'password', confirmKey = 'confirmPassword'): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const pass = control.get(passwordKey)?.value;
    const confirm = control.get(confirmKey)?.value;
    if (pass && confirm && pass !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  };
}

