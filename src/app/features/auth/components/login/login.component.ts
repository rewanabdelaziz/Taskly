import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '../../services/auth-service.service';
import { UserLoginPayload } from '../../models/user';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RouterModule, IconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  host: { class: 'flex flex-col flex-1' },
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private _authServie = inject(AuthServiceService);
  private _router = inject(Router);
  _globalMsg = inject(ToastNotificationService);

  loginForm: FormGroup;
  isSubmitted = signal(false);
  loginPlayload!: UserLoginPayload;
  rememberMe = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  onSubmit(event: Event) {
    this.isSubmitted.set(true);
    event.preventDefault();

    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;
      this.loginPlayload = {
        email: email,
        password: password,
      };
      this.rememberMe.set(rememberMe);

      this._authServie.Login(this.loginPlayload, this.rememberMe()).subscribe({
        next: () => {
          // console.log(res);
          this.isSubmitted.set(false);
          this._globalMsg.showMsg('Logged in successfully!', 'success');
          this._router.navigate(['/project']);
        },
        error: (err: HttpErrorResponse) => {
          this.isSubmitted.set(false);
          // console.log(err);
          const fallbackMsg = 'Login failed. Please try again.';
          if (err?.error.msg == 'Invalid login credentials') {
            this._globalMsg.showMsg('Invalid email or password! Please try again.');
          } else {
            this._globalMsg.showMsg(fallbackMsg);
          }
        },
      });
    } else {
      this.isSubmitted.set(false);
      this.loginForm.markAllAsTouched();
      // console.log('errors', errors);
    }
  }

  navigateToSignUP() {
    this._router.navigate(['/sign-up']);
  }
}
