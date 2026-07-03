import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthServiceService } from '../../features/auth/services/auth-service.service';
import { inject } from '@angular/core';

export const reverseAuthGuard: CanActivateFn = () => {
  const _auth = inject(AuthServiceService);
  const _router = inject(Router);
  const _state = inject(RouterStateSnapshot)
  const current_url = _state.url;

  if (current_url.includes('access_token') || current_url.includes('otp_expired')) {
    return true; 
  }

  if (_auth.isLoggedIn()) {
    _router.navigate(['/project']);
    return false;
  }

  return true;
};
