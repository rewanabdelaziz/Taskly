import { inject, Injectable, signal } from '@angular/core';
import { User, UserLoginPayload, UserMetaData, UserRegisterPayload } from '../models/user';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginResponse } from '../models/supabaseModels';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  baseUrl = environment.baseUrl;
  private _http = inject(HttpClient);
  private _router = inject(Router);
  userProfile = signal<UserMetaData | null>(null);
  isLoggedIn = signal(false);

  constructor() {
    const profile = localStorage.getItem('user_profile') || sessionStorage.getItem('user_profile');
    if (profile) {
      this.userProfile.set(JSON.parse(profile));
      this.isLoggedIn.set(true);
      console.log(this.isLoggedIn());
    }
  }

  // sign-up
  Register(UserRegisterPayload: UserRegisterPayload) {
    return this._http.post(`${this.baseUrl}/auth/v1/signup`, UserRegisterPayload);
  }

  // login
  Login(UserLoginPayload: UserLoginPayload, rememberMe: boolean): Observable<LoginResponse> {
    return this._http.post<LoginResponse>(`${this.baseUrl}/auth/v1/token?grant_type=password`, UserLoginPayload).pipe(
      tap((res: LoginResponse) => {
        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem('access_token', res.access_token);
        storage.setItem('refresh_token', res.refresh_token);
        storage.setItem('expires_at', res.expires_at.toString());

        this.getUserProfile();

        storage.setItem('user_profile', JSON.stringify(this.userProfile()));
      }),
    );
  }

  // refresh_token
  refreshToken(token: string): Observable<LoginResponse> {
    return this._http.post<LoginResponse>(`${this.baseUrl}/auth/v1/token?grant_type=refresh_token`, {
      refresh_token: token,
    });
  }

  // get user data
  getUser(): Observable<User> {
    return this._http.get<User>(`${this.baseUrl}/auth/v1/user`);
  }

  getUserProfile() {
    this.getUser().subscribe({
      next: (res: User) => {
        const { name, email, department } = res.user_metadata;
        this.userProfile.set({ name, email, department });
        localStorage.setItem('user_profile', JSON.stringify({ name, email, department }));
      },
      error: (err) => {
        console.log(err);
        // this.logout()
        this._router.navigate(['/login']);
      },
    });
  }
}
