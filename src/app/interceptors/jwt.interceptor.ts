import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * JWT HTTP Interceptor — Functional style (Angular 15+).
 *
 * يضيف Authorization: Bearer <token> لكل طلب HTTP.
 * عند 401: يحاول Refresh Token → يعيد الطلب الأصلي.
 * إن فشل الـ Refresh: يعمل Logout ويوجه للـ Login.
 */
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const accessToken = authService.getAccessToken();

  // أضف الـ Token إن وُجد — تجنب إضافته لطلبات الـ refresh نفسها
  const authReq = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401 && !req.url.includes('/refresh') && !req.url.includes('/login')) {
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          const currentAccess = authService.getAccessToken() ?? '';
          return authService.refreshToken({ accessToken: currentAccess, refreshToken }).pipe(
            switchMap((newTokenDto) => {
              authService.storeTokens(newTokenDto);
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newTokenDto.accessToken}` }
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        }

        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
