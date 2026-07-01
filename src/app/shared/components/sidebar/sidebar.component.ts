import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthServiceService } from '../../../features/auth/services/auth-service.service';
import { GlobalErrorMessageService } from '../../services/global-error-message.service';
import { StorageKeys } from '../../../core/enums/storage-keys';

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
        const storage = localStorage.getItem(StorageKeys.ACCESS_TOKEN) ? localStorage : sessionStorage;
        storage.removeItem(StorageKeys.ACCESS_TOKEN);
        storage.removeItem(StorageKeys.REFRESH_TOKEN);
        storage.removeItem(StorageKeys.EXPIRES_AT);
        storage.removeItem(StorageKeys.user_profile);

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
