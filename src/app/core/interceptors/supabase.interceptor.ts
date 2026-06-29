import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

export const supabaseInterceptor: HttpInterceptorFn = (req, next) => {
  const API_KEY = environment.supabase_api_key;

  const reqClone = req.clone({
    setHeaders: {
      apikey: API_KEY,
    },
  });
  return next(reqClone);
};
