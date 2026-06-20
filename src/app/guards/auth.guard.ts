import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard: يحمي المسارات التي تتطلب تسجيل دخول.
 * يتحقق من وجود Access Token صالح (غير منتهي الصلاحية).
 * يحفظ الـ returnUrl للعودة إليه بعد تسجيل الدخول.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
