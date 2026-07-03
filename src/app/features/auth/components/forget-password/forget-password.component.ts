import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { AuthServiceService } from '../../services/auth-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent implements OnDestroy{
  private fb = inject(FormBuilder);
  private _authServie = inject(AuthServiceService);
  _globalMsg = inject(ToastNotificationService)

  forgetPasswordFrom: FormGroup;
  isSubmitted = signal(false);
  isSuccess
  timerMin
  timerSec 
  private timeIntervalId : null | number = null
  
  
  forgetPasswordPlayload! :string;

  constructor() {
    this.timerMin = signal(4)
    this.timerSec = signal(59)
    this.isSuccess = signal(false);

      this.forgetPasswordFrom = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
      });
  }
  ngOnDestroy(): void {
    if(this.timeIntervalId) clearInterval(this.timeIntervalId)
  }


  onSubmit(event: Event) {
   this.isSubmitted.set(true);
   event.preventDefault();
    if (this.forgetPasswordFrom.valid) {
      const {email} = this.forgetPasswordFrom.value;
      this.forgetPasswordPlayload = email;

      this._authServie.recoverPassword(email).subscribe({
        next: () =>{
          this.isSuccess.set(true)
          this.startCounter();
          this._globalMsg.showMsg("link sent successfully. check your email","success")
        },
        error: () =>{
          this.isSubmitted.set(false)
          this._globalMsg.showMsg("Something wrong try again")
        }
      })
    }
   
  }

  startCounter(){
    if(this.timeIntervalId) clearInterval(this.timeIntervalId)
    this.timerMin.set(4)
    this.timerSec.set(59)


    this.timeIntervalId = window.setInterval(()=>{
      if(this.timerSec()== 0){
        // timer finished
        if(this.timerMin() === 0){
          clearInterval(this.timeIntervalId!)
          this.isSubmitted.set(false)
          this.isSuccess.set(false)
          return;
        }
        this.timerMin.update((prev)=> prev-1)
        this.timerSec.set(59)
        
      } else{
        this.timerSec.update((prev)=> prev-1)
      }
      
    },1000)

    this.isSubmitted.set(false)
  }

}
