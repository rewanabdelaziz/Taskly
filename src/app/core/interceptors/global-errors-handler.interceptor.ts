import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { ToastNotificationService } from '../../shared/services/toast-notification.service';
import { AuthServiceService } from '../../features/auth/services/auth-service.service';

import { StorageKeys } from '../constants/storage-keys';
import { LoginResponse } from '../../features/auth/models/supabaseModels';

export const globalErrorsHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const _errService = inject(ToastNotificationService);
  const _auth = inject(AuthServiceService);

  const storage = localStorage.getItem(StorageKeys.ACCESS_TOKEN) ? localStorage : sessionStorage;
  const refreshToken = storage.getItem(StorageKeys.REFRESH_TOKEN);

  if (req.url.includes('/auth/v1/token')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      switch (err.status) {
        case 404:
          _errService.showMsg('not found');
          break;
        case 500:
          _errService.showMsg('internal server error. please try again.');
          break;
        case 401:
          if (refreshToken) {
            return _auth.refreshToken(refreshToken).pipe(
              switchMap((res: LoginResponse) => {
                storage.setItem(StorageKeys.ACCESS_TOKEN, res.access_token);
                storage.setItem(StorageKeys.REFRESH_TOKEN, res.refresh_token);

                const cloneReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${res.access_token}` },
                });

                return next(cloneReq);
              }),

              catchError((err) => {
                _auth.clearStorage();
                return throwError(() => err);
              }),
            );
          } else {
            _auth.clearStorage();
          }
          break;
        case 0:
          _errService.showMsg('No internet connection');
          break;
      }

      return throwError(() => err);
    }),
  );
};
