import { inject, Injectable, signal } from '@angular/core';
import { UserLoginPayload, UserRegisterPayload } from '../models/user';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs';
import { json } from 'zod';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  baseUrl = environment.baseUrl;
  private _http = inject(HttpClient);
  userProfile = signal<{ name: string; department: string } | null>(null);
  rememberMe = signal(false)

  constructor(){
    const profile = localStorage.getItem('user_profile') || sessionStorage.getItem('user_profile')
    if(profile){
      this.userProfile.set(JSON.parse(profile))
      this.rememberMe.set(true)
    }

  }
  
  // sign-up
  Register(UserRegisterPayload: UserRegisterPayload) {
    return this._http.post(`${this.baseUrl}/auth/v1/signup`, UserRegisterPayload);
  }

  // login
  Login(UserLoginPayload: UserLoginPayload, rememberMe: boolean) {
    return this._http.post(`${this.baseUrl}/auth/v1/token?grant_type=password`, UserLoginPayload).pipe(
      tap((res:any) =>{
        this.rememberMe.set(rememberMe)
        const storage = this.rememberMe() ? localStorage : sessionStorage;
        
        
         storage.setItem("access_token",res.access_token)
         storage.setItem("refresh_token",res.refresh_token)
         storage.setItem("expires_at",res.expires_at)

         this.userProfile.set({
          name: res.user.user_metadata.name,
          department:res.user.user_metadata.department
         })

         storage.setItem('user_profile',JSON.stringify(this.userProfile()))


      })
    )
  }

  // refresh_token
  refreshToken(token:string){
    return this._http.post(`${this.baseUrl}/auth/v1/token?grant_type=refresh_token`, {refresh_token:token})
  }

  // get user data
  getUser(){
    return this._http.get(`${this.baseUrl}/auth/v1/user`)
  }
}
