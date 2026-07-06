import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { supabaseInterceptor } from './core/interceptors/supabase.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { globalErrorsHandlerInterceptor } from './core/interceptors/global-errors-handler.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([supabaseInterceptor, authInterceptor, globalErrorsHandlerInterceptor]),
    ),
  ],
};
