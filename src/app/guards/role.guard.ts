import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Role Guard: يحمي المسارات بناءً على دور المستخدم.
 * يُستخدم بعد authGuard دائماً.
 *
 * يُضاف في الـ route هكذا:
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: ['Admin'] }          // أو ['Customer', 'Seller']
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // إن لم يكن مسجلاً دخوله → أعده للـ Login
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  const requiredRoles: string[] = route.data?.['roles'] ?? [];

  // إن لم تُحدَّد أدوار → السماح للجميع المسجلين
  if (requiredRoles.length === 0) {
    return true;
  }

  const userRole = authService.getUserRole();

  if (userRole && requiredRoles.includes(userRole)) {
    return true;
  }

  // مسجل دخول لكن دوره غير مخوّل → صفحة Login (يمكن تغييرها لصفحة Forbidden)
  return router.createUrlTree(['/login']);
};
