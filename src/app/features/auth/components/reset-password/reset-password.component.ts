import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '../../services/auth-service.service';
import { Router, RouterLink } from '@angular/router';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { FormValidators, passwordMatchValidator } from '../../../../shared/validators/custom-validators';
import { AuthNavBarComponent } from '../auth-nav-bar/auth-nav-bar.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent, AuthNavBarComponent,FormFieldComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  host: { class: 'flex flex-col flex-1 h-full' },
})
export class ResetPasswordComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private _authServie = inject(AuthServiceService);
  private _router = inject(Router);
  _globalMsg = inject(ToastNotificationService);

  resetPasswordForm: FormGroup;
  resetPasswordPlayload!: { password: string };
  isSubmitted = signal(false);
  passwordValue
  private timeOutId: null | number = null;
  private state;
  

  passwordRequirements = computed(() => {
    const hasMinLength = this.passwordValue().length >= 8 && this.passwordValue().length <= 64;
    const hasUpper = /[A-Z]/.test(this.passwordValue());
    const hasLower = /[a-z]/.test(this.passwordValue());
    const hasDigit = /\d/.test(this.passwordValue());
    const hasSpecialChar = /[!@#$%^&*]/.test(this.passwordValue());

    return { hasMinLength, hasUpper, hasLower, hasDigit, hasSpecialChar };
  });

  constructor() {
    // init form
    this.resetPasswordForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(FormValidators.passwordRegex),
            Validators.minLength(8),
            Validators.maxLength(64),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator },
    );

    this.passwordValue = toSignal(
        this.resetPasswordForm.get('password')!.valueChanges,
        {initialValue: ''}
    )

    // store access token from state
    const currentNavigation = this._router.getCurrentNavigation();
    this.state = currentNavigation?.extras.state as { accessToken: string };

    if (!this.state || !this.state.accessToken) {
      this._globalMsg.showMsg('Invalid or expired reset link.');
      this._router.navigate(['/login']);
      return;
    }
  }

  get passwordControl() {
    return this.resetPasswordForm.get('password') as FormControl;
  }
  get confirmPasswordControl() {
    return this.resetPasswordForm.get('confirmPassword') as FormControl;
  }

  ngOnDestroy(): void {
    if (this.timeOutId) {
      clearTimeout(this.timeOutId);
    }
  }

  onSubmit(event: Event) {
    this.isSubmitted.set(true);
    event.preventDefault();

    if (this.resetPasswordForm.valid) {
      const { password } = this.resetPasswordForm.value;
      this.resetPasswordPlayload = {
        password: password,
      };

      this._authServie.resetPassword(this.resetPasswordPlayload, this.state.accessToken).subscribe({
        next: () => {
          // console.log(res);

          this._authServie.isLoggedIn.set(true);
          this.isSubmitted.set(false);
          this._globalMsg.showMsg('Your password has been updated successfully. You can now log in', 'success');

          this.timeOutId = window.setTimeout(() => {
            this._router.navigate(['/login']);
            this.timeOutId = null;
          }, 3000);
        },
        error: (err) => {
          this.isSubmitted.set(false);
          // console.log(err);
          const fallbackMsg = 'Reset password failed. Please try again.';
          if (err.error.error_code === 'same_password' || err.error.code === 422) {
            this._globalMsg.showMsg('New password should be different from the old password.');
          } else {
            this._globalMsg.showMsg(fallbackMsg);
          }
        },
      });
    } else {
      this.isSubmitted.set(false);
      this.resetPasswordForm.markAllAsTouched();
      // console.log("errors", errors)
    }
  }
}
