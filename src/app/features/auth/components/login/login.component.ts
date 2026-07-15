import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '../../services/auth-service.service';
import { UserLoginPayload } from '../../models/user';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RouterModule, IconComponent,FormFieldComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  host: { class: 'flex flex-col flex-1' },
})
export class LoginComponent implements OnInit{
  private fb = inject(FormBuilder);
  private _authServie = inject(AuthServiceService);
  private _router = inject(Router);
  _globalMsg = inject(ToastNotificationService);

  loginForm!: FormGroup;
  isSubmitted = signal(false);
  loginPlayload!: UserLoginPayload;
  rememberMe = signal(false);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  get emailControl() {
    return this.loginForm.get('email') as FormControl;
  }
  get passwordControl() {
      return this.loginForm.get('password') as FormControl;
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
          this.isSubmitted.set(false);
          this._globalMsg.showMsg('Logged in successfully!', 'success');
          this._router.navigate(['/project']);
        },
        error: (err: HttpErrorResponse) => {
          this.isSubmitted.set(false);
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
    }
  }

  navigateToSignUP() {
    this._router.navigate(['/sign-up']);
  }
}
