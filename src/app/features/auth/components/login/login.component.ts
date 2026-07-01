import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '../../services/auth-service.service';
import { UserLoginPayload } from '../../models/user';
import { LoginSchema } from '../../login.schema';
import { Router } from '@angular/router';
import { GlobalErrorMessageService } from '../../../../shared/services/global-error-message.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private _authServie = inject(AuthServiceService);
  private _router = inject(Router);
  _globalErrMsg = inject(GlobalErrorMessageService)

  loginForm: FormGroup;
  isSubmitted = signal(false);
  formValue = signal({});
  loginPlayload!: UserLoginPayload;
  rememberMe = signal(false);

  formErrors = computed(() => {
    const current = this.formValue();
    const res = LoginSchema.safeParse(current);
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

  isFormInvalid = computed(() => {
    return Object.keys(this.formErrors()).length > 0;
  });

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false],
    });

    this.formValue.set(this.loginForm.value);

    this.loginForm.valueChanges.subscribe((v) => {
      this.formValue.set(v);
    });
  }

  onSubmit(event: Event) {
    this.isSubmitted.set(true);
    event.preventDefault();

    const errors = this.formErrors();

    if (Object.keys(errors).length === 0) {
      const { email, password, rememberMe } = this.loginForm.value;
      this.loginPlayload = {
        email: email,
        password: password,
      };
      this.rememberMe.set(rememberMe);

      this._authServie.Login(this.loginPlayload, this.rememberMe()).subscribe({
        next: () => {
          // console.log(res);
          this._router.navigate(['/project']);
        },
        error: (err:HttpErrorResponse) => {
          this.isSubmitted.set(false);
          // console.log(err);
          const fallbackMsg = 'Login failed. Please try again.';
          if(err?.error.msg == "Invalid login credentials"){
            this._globalErrMsg.showErrorMsg("Invalid email or password! Please try again.")
          }else{
            this._globalErrMsg.showErrorMsg(fallbackMsg)
          }
        },
      });
    } else {
      this.isSubmitted.set(false);
      this.loginForm.markAllAsTouched();
      console.log('errors', errors);
    }
  }

  navigateToSignUP() {
    this._router.navigate(['/sign-up']);
  }
}
