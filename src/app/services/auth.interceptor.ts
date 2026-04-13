import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { UserService } from './user.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  const injector = inject(Injector);
  
  // Clone the request with the auth header if token exists 
  let authReq = req;
  if (token && !req.url.includes('/login') && !req.url.includes('/refresh')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 (Unauthorized) and not a login/refresh request
      if (error.status === 401 && !req.url.includes('/login') && !req.url.includes('/refresh')) {
        
        // Lazy-get UserService to avoid circular dependency
        const userService = injector.get(UserService);
        
        return userService.refreshToken().pipe(
          switchMap((newToken) => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          }),
          catchError((err) => {
            // If refresh fails, we logout
            userService.logout();
            return throwError(() => err);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
