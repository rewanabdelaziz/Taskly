import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '../../services/auth-service.service';
import { Router } from '@angular/router';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { ResetPasswordSchema } from '../../reset-password.schema';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
private fb = inject(FormBuilder);
  private _authServie = inject(AuthServiceService);
  private _router = inject(Router);
  _globalMsg = inject(ToastNotificationService)

  resetPasswordForm: FormGroup;
  isSubmitted = signal(false);
  formValue = signal({});
  resetPasswordPlayload!: {password: string};
  passwordValue = signal('');

  private state;


  formErrors = computed(() => {
    const current = this.formValue();
    const res = ResetPasswordSchema.safeParse(current);
    let errors: Record<string, string> = {};

    if (res.success) {
      errors = {};
    } else {
      res.error.issues.forEach((issue) => {
        const path = issue.path.join('_');
        errors[path] = issue.message;
      });
    }

    return errors;
  });

  passwordRequirements = computed(() => {
    const hasMinLength = this.passwordValue().length >= 8;
    const hasUpperLowerDigit =
      /[A-Z]/.test(this.passwordValue()) && /[a-z]/.test(this.passwordValue()) && /\d/.test(this.passwordValue());
    const hasSpecialChar = /[!@#$%^&*]/.test(this.passwordValue());

    return { hasMinLength, hasUpperLowerDigit, hasSpecialChar };
  });

  isFormInvalid = computed(() => {
    return Object.keys(this.formErrors()).length > 0;
  });

  constructor() {
    // init form
    this.resetPasswordForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      
    });

    this.formValue.set(this.resetPasswordForm.value);

    this.resetPasswordForm.valueChanges.subscribe((v) => {
      this.formValue.set(v);
      this.passwordValue.set(v.password);
    });
    
    // store access token from state
    const currentNavigation = this._router.getCurrentNavigation();
    this.state = currentNavigation?.extras.state as { accessToken: string };

    if (!this.state || !this.state.accessToken) {
      this._router.navigate(['/login']);
      return
    }
  }

  onSubmit(event: Event) {
    this.isSubmitted.set(true);
    event.preventDefault();

    const errors = this.formErrors();

    if (Object.keys(errors).length === 0) {
      const {password} = this.resetPasswordForm.value;
      this.resetPasswordPlayload = {
        password: password,
      };

      this._authServie.resetPassword(this.resetPasswordPlayload,this.state.accessToken).subscribe({
        next: (res) => {
          console.log(res);

          this._authServie.isLoggedIn.set(true);
          this.isSubmitted.set(false);
          this._globalMsg.showMsg('Your password has been updated successfully. You can now log in', 'success');
          this._router.navigate(['/login']);
        },
        error: (err) => {
          this.isSubmitted.set(false);
          console.log(err);
          const fallbackMsg = 'Reset password failed. Please try again.';
          this._globalMsg.showMsg( fallbackMsg);
        },
      });
    } else {
      this.isSubmitted.set(false);
      this.resetPasswordForm.markAllAsTouched();
      // console.log("errors", errors)
    }
  }

  

}
