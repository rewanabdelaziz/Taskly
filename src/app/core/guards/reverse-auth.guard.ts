import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../../features/auth/services/auth-service.service';
import { inject } from '@angular/core';

export const reverseAuthGuard: CanActivateFn = () => {
  const _auth = inject(AuthServiceService);
  const _router = inject(Router);

  if (_auth.isLoggedIn()) {
    _router.navigate(['/project']);
    return false;
  }

  return true;
};
