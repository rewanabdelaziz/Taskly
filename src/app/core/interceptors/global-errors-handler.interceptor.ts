import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { GlobalErrorMessageService } from '../../shared/services/global-error-message.service';

export const globalErrorsHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const _errService = inject(GlobalErrorMessageService)
  return next(req).pipe(
    catchError((err : HttpErrorResponse)=>{
     

        switch(err.status){
          case 404:
            _errService.showErrorMsg("not found")
            break;
          case 500: 
            _errService.showErrorMsg("internal server error. please try again.")
            break;
          case 0:
             _errService.showErrorMsg("No internet connection")
             break;

        }

      return throwError(()=>err)

      
    })
  )
};
