import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '../../services/auth-service.service';
import { Router, RouterLink } from '@angular/router';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { ResetPasswordSchema } from '../../reset-password.schema';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnDestroy{
  private fb = inject(FormBuilder);
  private _authServie = inject(AuthServiceService);
  private _router = inject(Router);
  _globalMsg = inject(ToastNotificationService)

  resetPasswordForm: FormGroup;
  isSubmitted = signal(false);
  formValue = signal({});
  resetPasswordPlayload!: {password: string};
  passwordValue = signal('');
  private timeOutId : null | number = null
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
    const hasMinLength = this.passwordValue().length >= 8 && this.passwordValue().length <= 64;
    const hasUpper = /[A-Z]/.test(this.passwordValue());
    const hasLower = /[a-z]/.test(this.passwordValue());
    const hasDigit = /\d/.test(this.passwordValue());
    const hasSpecialChar = /[!@#$%^&*]/.test(this.passwordValue());

    return { hasMinLength, hasUpper,hasLower,hasDigit, hasSpecialChar };
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
      this._globalMsg.showMsg("Invalid or expired reset link.")
      this._router.navigate(['/login']);
      return
    }
  }


  ngOnDestroy(): void {
    if(this.timeOutId){
      clearTimeout(this.timeOutId)
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
        next: () => {
          // console.log(res);

          this._authServie.isLoggedIn.set(true);
          this.isSubmitted.set(false);
          this._globalMsg.showMsg('Your password has been updated successfully. You can now log in', 'success');
          
          this.timeOutId = window.setTimeout(()=>{
            this._router.navigate(['/login']);
            this.timeOutId = null
          },3000)
          
        },
        error: (err) => {
          this.isSubmitted.set(false);
          // console.log(err);
          const fallbackMsg = 'Reset password failed. Please try again.';
          if(err.error.error_code === "same_password" || err.error.code === 422){
            this._globalMsg.showMsg( "New password should be different from the old password.");
          }else{
            this._globalMsg.showMsg( fallbackMsg);
            
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
