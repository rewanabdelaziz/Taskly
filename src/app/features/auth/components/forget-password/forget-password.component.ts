import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
export class ForgetPasswordComponent implements OnDestroy,OnInit{
  private fb = inject(FormBuilder);
  private _authServie = inject(AuthServiceService);
  _globalMsg = inject(ToastNotificationService)

  forgetPasswordFrom: FormGroup;
  isSubmitted = signal(false);
  isDisabeled = signal(false);
  isSuccess
  timerMin
  timerSec 
  private timeIntervalId : null | number = null
  forgetPasswordPlayload! :string;
  private readonly TIMER_KEY = 'otp_expiry_time';

  constructor() {
    this.timerMin = signal(4)
    this.timerSec = signal(59)
    this.isSuccess = signal(false);

      this.forgetPasswordFrom = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
      });
  }
  ngOnInit(): void {
    this.checkIfExcitTimer()
  }
  ngOnDestroy(): void {
    if(this.timeIntervalId) clearInterval(this.timeIntervalId)
  }


  onSubmit(event: Event) {
   this.isSubmitted.set(true);
   this.isDisabeled.set(true);
   event.preventDefault();
    if (this.forgetPasswordFrom.valid) {
      const {email} = this.forgetPasswordFrom.value;
      this.forgetPasswordPlayload = email;

      this._authServie.recoverPassword(email).subscribe({
        next: () =>{
          this.initNewTimer();
          this.isDisabeled.set(true);
          this.isSuccess.set(true)
          this._globalMsg.showMsg("link sent successfully. check your email","success")
        },
        error: () =>{
          this.isSubmitted.set(false)
          this.isDisabeled.set(false)
          this._globalMsg.showMsg("Something wrong try again")
        }
      })
    }
   
  }

  initNewTimer(){
    const expireTime = Date.now() + (5 * 60 * 1000)
    localStorage.setItem(this.TIMER_KEY,expireTime.toString())
    this.startTimer()
  }

  checkIfExcitTimer(){
    const Expire = Number(localStorage.getItem(this.TIMER_KEY))
    
    if(Expire){
      const remainSec = Math.ceil((Expire - Date.now())/1000)
      
      if(remainSec > 0){
        this.startTimer(remainSec)
        this.isSuccess.set(true)
        this.isDisabeled.set(true)
      }else{
        localStorage.removeItem(this.TIMER_KEY)
      }
    }

  }

  startTimer(remainSec?: number){
    if(this.timeIntervalId) clearInterval(this.timeIntervalId)
    if(remainSec){
      this.timerMin.set(Math.floor(remainSec / 60))
      this.timerSec.set(remainSec % 60)
    }else{
      this.timerMin.set(4)
      this.timerSec.set(59)
    }

    this.timeIntervalId = window.setInterval(()=>{
      if(this.timerSec()== 0){
        // timer finished
        if(this.timerMin() === 0){
          clearInterval(this.timeIntervalId!)
          this.isSubmitted.set(false)
          this.isDisabeled.set(false)
          this.isSuccess.set(false)
          localStorage.removeItem(this.TIMER_KEY)
          return;
        }
        this.timerMin.update((prev)=> prev-1)
        this.timerSec.set(59)
        
      } else{
        this.timerSec.update((prev)=> prev-1)
      }
      
    },1000)

    this.isSubmitted.set(false)
    this.isDisabeled.set(false)
  }

}
