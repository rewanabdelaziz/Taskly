import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRegisterPayload } from '../../models/user';
import { AuthServiceService } from '../../services/auth-service.service';
import { Router } from '@angular/router';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { FormValidators, passwordMatchValidator } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private _authServie = inject(AuthServiceService);
  private _router = inject(Router);
  _globalMsg = inject(ToastNotificationService);

  registerForm: FormGroup;
  registerPlayload!: UserRegisterPayload;
  isSubmitted = signal(false);
  passwordValue = signal('');

  passwordRequirements = computed(() => {
    const hasMinLength = this.passwordValue().length >= 8;
    const hasUpperLowerDigit =
      /[A-Z]/.test(this.passwordValue()) && /[a-z]/.test(this.passwordValue()) && /\d/.test(this.passwordValue());
    const hasSpecialChar = /[!@#$%^&*]/.test(this.passwordValue());

    return { hasMinLength, hasUpperLowerDigit, hasSpecialChar };
  });

  constructor() {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
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
        data: this.fb.group({
          name: [
            '',
            [
              Validators.required,
              Validators.pattern(FormValidators.nameRegex),
              Validators.minLength(3),
              Validators.maxLength(50),
            ],
          ],
          department: [''],
        }),
      },
      { validators: passwordMatchValidator },
    );
  }

  onSubmit(event: Event) {
    this.isSubmitted.set(true);
    event.preventDefault();
    if (this.registerForm.valid) {
      const { email, password, data } = this.registerForm.value;
      this.registerPlayload = {
        email: email,
        password: password,
        data: {
          name: data.name,
          department: data.department,
        },
      };

      this._authServie.Register(this.registerPlayload).subscribe({
        next: () => {
          // console.log(res);

          this._authServie.isLoggedIn.set(true);
          this.isSubmitted.set(false);
          this._globalMsg.showMsg('Account created successfully!', 'success');
          this._router.navigate(['/project']);
        },
        error: (err) => {
          this.isSubmitted.set(false);
          // console.log(err);
          const fallbackMsg = 'Registration failed. Please try again.';
          if (err.error.msg === 'User already registered') {
            this._globalMsg.showMsg('User already registered');
          } else {
            this._globalMsg.showMsg(fallbackMsg);
          }
        },
      });
    } else {
      this.isSubmitted.set(false);
      this.registerForm.markAllAsTouched();
      // console.log("errors", errors)
    }
  }

  navigateToLogin() {
    this._router.navigate(['/login']);
  }
}
