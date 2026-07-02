import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastNotificationService } from '../../shared/services/toast-notification.service';

export const globalErrorsHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const _errService = inject(ToastNotificationService)
  return next(req).pipe(
    catchError((err : HttpErrorResponse)=>{
        switch(err.status){
          case 404:
            _errService.showMsg("not found")
            break;
          case 500: 
            _errService.showMsg("internal server error. please try again.")
            break;
          case 0:
             _errService.showMsg("No internet connection")
             break;

        }

      return throwError(()=>err)

      
    })
  )
};
