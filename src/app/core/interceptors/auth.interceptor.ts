import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthServiceService } from '../../features/auth/services/auth-service.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { LoginResponse } from '../../features/auth/models/supabaseModels';
import { StorageKeys } from '../constants/storage-keys';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const _auth = inject(AuthServiceService);
  const _router = inject(Router);

  const storage = localStorage.getItem(StorageKeys.ACCESS_TOKEN) ? localStorage : sessionStorage;

  const accessToken = storage.getItem(StorageKeys.ACCESS_TOKEN);
  const refreshToken = storage.getItem(StorageKeys.REFRESH_TOKEN);
  const expireAt = storage.getItem(StorageKeys.EXPIRES_AT);

  const currentTime = Math.floor(Date.now() / 1000); //in seconds

  // except req of refresh_token or if not logged in
  if (!accessToken || req.url.includes('/auth/v1/token')) {
    return next(req);
  }

  // if expire token
  if (expireAt && refreshToken && currentTime >= parseInt(expireAt)) {
    return _auth.refreshToken(refreshToken).pipe(
      switchMap((res: LoginResponse) => {
        // console.log(res);
        storage.setItem(StorageKeys.ACCESS_TOKEN, res.access_token);
        storage.setItem(StorageKeys.REFRESH_TOKEN, res.refresh_token);
        storage.setItem(StorageKeys.EXPIRES_AT, res.expires_at.toString());

        const cloneReq = req.clone({
          setHeaders: { Authorization: `Bearer ${res.access_token}` },
        });

        return next(cloneReq);
      }),

      catchError((err) => {
        storage.removeItem(StorageKeys.ACCESS_TOKEN);
        storage.removeItem(StorageKeys.REFRESH_TOKEN);
        storage.removeItem(StorageKeys.EXPIRES_AT);
        storage.removeItem(StorageKeys.USER_PROFILE);
        localStorage.removeItem(StorageKeys.SELECTED_PROJECT);
        _auth.isLoggedIn.set(false);
        _auth.userProfile.set(null);
        _router.navigate(['/login']);
        return throwError(() => err);
      }),
    );
  } else {
    // if not expire
    const cloneReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
    return next(cloneReq);
  }
};
