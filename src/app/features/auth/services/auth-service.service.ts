import { inject, Injectable, signal } from '@angular/core';
import { User, UserLoginPayload, UserMetaData, UserRegisterPayload } from '../models/user';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { LoginResponse } from '../models/supabaseModels';
import { StorageKeys } from '../../../core/constants/storage-keys';
import { ApiEndpoints } from '../../../core/constants/api-endpoints';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  baseUrl = environment.baseUrl;
  private _http = inject(HttpClient);
  private _router = inject(Router)
  userProfile = signal<UserMetaData | null>(null);
  isLoggedIn = signal(false);

  constructor() {
    const profile = localStorage.getItem(StorageKeys.USER_PROFILE) || sessionStorage.getItem(StorageKeys.USER_PROFILE);
    if (profile) {
      this.userProfile.set(JSON.parse(profile));
      this.isLoggedIn.set(true);
    }
  }

  // sign-up
  Register(UserRegisterPayload: UserRegisterPayload): Observable<User> {
    return this._http.post<LoginResponse>(`${this.baseUrl}${ApiEndpoints.SIGNUP}`, UserRegisterPayload).pipe(
      tap((res: LoginResponse) => {
        this.isLoggedIn.set(true);
        const storage = sessionStorage;
        storage.setItem(StorageKeys.ACCESS_TOKEN, res.access_token);
        storage.setItem(StorageKeys.REFRESH_TOKEN, res.refresh_token);
        storage.setItem(StorageKeys.EXPIRES_AT, res.expires_at.toString());
      }),
      switchMap(() => this.getUser()),
    );
  }

  // login
  Login(UserLoginPayload: UserLoginPayload, rememberMe: boolean): Observable<User> {
    return this._http.post<LoginResponse>(`${this.baseUrl}${ApiEndpoints.LOGIN}`, UserLoginPayload).pipe(
      tap((res: LoginResponse) => {
        this.isLoggedIn.set(true);
        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem(StorageKeys.ACCESS_TOKEN, res.access_token);
        storage.setItem(StorageKeys.REFRESH_TOKEN, res.refresh_token);
        storage.setItem(StorageKeys.EXPIRES_AT, res.expires_at.toString());
      }),
      switchMap(() => this.getUser()),
    );
  }

  // refresh_token
  refreshToken(token: string): Observable<LoginResponse> {
    return this._http.post<LoginResponse>(`${this.baseUrl}${ApiEndpoints.REFRESH_TOKEN}`, {
      refresh_token: token,
    });
  }

  // logout
  logOut() {
    return this._http.post(`${this.baseUrl}${ApiEndpoints.LOGOUT}`, {});
  }

  // get user data
  getUser(): Observable<User> {
    return this._http.get<User>(`${this.baseUrl}${ApiEndpoints.USER}`).pipe(
      tap((res: User) => {
        const { name, email, department } = res.user_metadata;
        const storage = localStorage.getItem(StorageKeys.ACCESS_TOKEN) ? localStorage : sessionStorage;
        this.userProfile.set({ name, email, department });
        storage.setItem(StorageKeys.USER_PROFILE, JSON.stringify({ name, email, department }));
      }),
    );
  }

  // reset password
  recoverPassword(email: string) {
    const payload = {
      email: email,
      redirect_to: 'https://taskly-omega-lyart.vercel.app/reset-password',
      // redirect_to: "http://localhost:4200/reset-password",
      //   options: {
      //   redirect_to: "https://taskly-omega-lyart.vercel.app/reset-password"
      // }
    };

    return this._http.post(`${this.baseUrl}${ApiEndpoints.RECOVER_PASSWORD}`, payload);
  }

  // setPassword
  resetPassword(payload: { password: string }, token: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this._http.put(`${this.baseUrl}${ApiEndpoints.USER}`, payload, { headers });
  }

  // clear storage
  clearStorage(){
    const storage = localStorage.getItem(StorageKeys.ACCESS_TOKEN) ? localStorage : sessionStorage;
    storage.removeItem(StorageKeys.ACCESS_TOKEN);
    storage.removeItem(StorageKeys.REFRESH_TOKEN);
    storage.removeItem(StorageKeys.USER_PROFILE);
    sessionStorage.removeItem(StorageKeys.SELECTED_PROJECT);
    this.isLoggedIn.set(false);
    this.userProfile.set(null);
    this._router.navigate(['/login']);
  }
}
