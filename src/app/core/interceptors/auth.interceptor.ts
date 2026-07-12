import { HttpInterceptorFn } from '@angular/common/http';
import { StorageKeys } from '../constants/storage-keys';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = localStorage.getItem(StorageKeys.ACCESS_TOKEN) ? localStorage : sessionStorage;

  const accessToken = storage.getItem(StorageKeys.ACCESS_TOKEN);

  // except req of refresh_token or if not logged in
  if (!accessToken || req.url.includes('/auth/v1/token')) {
    return next(req);
  }

  const cloneReq = req.clone({
    setHeaders: { Authorization: `Bearer ${accessToken}` },
  });
  return next(cloneReq);
};
