import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterSchema } from '../../register.schema';
import { UserRegisterPayload } from '../../models/user';
import { AuthServiceService } from '../../services/auth-service.service';
import { Router } from '@angular/router';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private _authServie = inject(AuthServiceService);
  private _router = inject(Router);
  _globalMsg = inject(ToastNotificationService);

  registerForm: FormGroup;
  isSubmitted = signal(false);
  formValue = signal({});
  registerPlayload!: UserRegisterPayload;
  passwordValue = signal('');

  formErrors = computed(() => {
    const current = this.formValue();
    const res = RegisterSchema.safeParse(current);
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
    this.registerForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      data: this.fb.group({
        name: ['', Validators.required],
        department: [''],
      }),
    });

    this.formValue.set(this.registerForm.value);

    this.registerForm.valueChanges.subscribe((v) => {
      this.formValue.set(v);
      this.passwordValue.set(v.password);
    });
  }

  onSubmit(event: Event) {
    this.isSubmitted.set(true);
    event.preventDefault();

    const errors = this.formErrors();

    if (Object.keys(errors).length === 0) {
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
        error: () => {
          this.isSubmitted.set(false);
          // console.log(err);
          const fallbackMsg = 'Registration failed. Please try again.';
          this._globalMsg.showMsg(fallbackMsg);
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
