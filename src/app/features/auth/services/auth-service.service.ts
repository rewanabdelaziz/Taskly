import { inject, Injectable, signal } from '@angular/core';
import { User, UserLoginPayload, UserMetaData, UserRegisterPayload } from '../models/user';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { LoginResponse } from '../models/supabaseModels';
import { StorageKeys } from '../../../core/enums/storage-keys';
import { ApiEndponts } from '../../../core/enums/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  baseUrl = environment.baseUrl;
  private _http = inject(HttpClient);
  userProfile = signal<UserMetaData | null>(null);
  isLoggedIn = signal(false);

  constructor() {
    const profile = localStorage.getItem(StorageKeys.user_profile) || sessionStorage.getItem(StorageKeys.user_profile);
    if (profile) {
      this.userProfile.set(JSON.parse(profile));
      this.isLoggedIn.set(true);
    }
  }

  // sign-up
  Register(UserRegisterPayload: UserRegisterPayload): Observable<User> {
    return this._http.post<LoginResponse>(`${this.baseUrl}${ApiEndponts.SIGNUP}`, UserRegisterPayload).pipe(
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
    return this._http.post<LoginResponse>(`${this.baseUrl}${ApiEndponts.LOGIN}`, UserLoginPayload).pipe(
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
    return this._http.post<LoginResponse>(`${this.baseUrl}${ApiEndponts.REFRESH_TOKEN}`, {
      refresh_token: token,
    });
  }

  // logout
  logOut() {
    return this._http.post(`${this.baseUrl}${ApiEndponts.LOGOUT}`, {});
  }

  // get user data
  getUser(): Observable<User> {
    return this._http.get<User>(`${this.baseUrl}${ApiEndponts.GET_USER}`).pipe(
      tap((res: User) => {
        const { name, email, department } = res.user_metadata;
        const storage = localStorage.getItem(StorageKeys.ACCESS_TOKEN) ? localStorage : sessionStorage;
        this.userProfile.set({ name, email, department });
        storage.setItem(StorageKeys.user_profile, JSON.stringify({ name, email, department }));
      }),
    );
  }
}
