import {HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthServiceService } from '../../features/auth/services/auth-service.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const _auth = inject(AuthServiceService)
  const _router = inject(Router)

  const storage =  localStorage.getItem('access_token') ? localStorage : sessionStorage

  let accessToken = storage.getItem('access_token')
  let refreshToken = storage.getItem('refresh_token')
  let expireAt = storage.getItem('expires_at')

  const currentTime = Math.floor(Date.now() / 1000) //in seconds

  // except req of refresh_token or if not logged in 
  if(!accessToken || req.url.includes('/auth/v1/token')){
    return next(req)
  }

  // if expire token
  if(expireAt && refreshToken && currentTime >= parseInt(expireAt)){
    console.log("inside refresh")
    return _auth.refreshToken(refreshToken).pipe(
      switchMap((res:any) =>{
        
        console.log(res)
        storage.setItem("access_token",res.access_token)
        storage.setItem("refresh_token",res.refresh_token)
        storage.setItem("expires_at",res.expires_at)

        const cloneReq = req.clone({
          setHeaders: { Authorization: `Bearer ${ res.access_token}` }
        })

        return next(cloneReq);

      }),

      catchError( (err) =>{
        storage.clear()
        _router.navigate(['/login'])
        return throwError(()=> err)
      })
    )

  }else{
    // if not expire
    const cloneReq = req.clone({
      setHeaders: { Authorization: `Bearer ${ accessToken}` }
    })
    return next(cloneReq);
  }
};
