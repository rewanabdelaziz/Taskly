import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthServiceService } from '../../../features/auth/services/auth-service.service';
import { GlobalErrorMessageService } from '../../services/global-error-message.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private _auth = inject(AuthServiceService);
  private _router = inject(Router);
  _globalErrService = inject(GlobalErrorMessageService)

  isCollapsed = signal(false);
  isMobileOpen = signal(false);


  toggleSidebar() {
    this.isCollapsed.update((state) => !state);
  }

  toggleMobileSidebar() {
    this.isMobileOpen.update((state) => !state);
  }

  logout() {
    this._auth.logOut().subscribe({
      next: () => {
        const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage;
        storage.removeItem('access_token');
        storage.removeItem('refresh_token');
        storage.removeItem('expires_at');
        storage.removeItem('user_profile');

        this._auth.isLoggedIn.set(false);
        this._auth.userProfile.set(null);

        this._router.navigate(['login']);
      },
      error: () =>{
        this.isCollapsed.set(true); 
      }
    });
  }
}
