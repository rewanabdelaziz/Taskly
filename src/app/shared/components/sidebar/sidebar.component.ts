import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthServiceService } from '../../../features/auth/services/auth-service.service';
import { ToastNotificationService } from '../../services/toast-notification.service';
import { StorageKeys } from '../../../core/constants/storage-keys';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '../icon/icon.component';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private _auth = inject(AuthServiceService);
  private _router = inject(Router);
  _globalToastService = inject(ToastNotificationService);

  isCollapsed = signal(false);
  isMobileOpen = signal(false);

  private currentUrl = toSignal(
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this._router.url },
  );

  projectId = computed(() => {
    const url = this.currentUrl();
    const segments = url.split('/');

    const idSegment = segments[2];
    if (idSegment && idSegment !== 'add') {
      return idSegment;
    }
    return null;
  });

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
        storage.removeItem(StorageKeys.USER_PROFILE);
        localStorage.removeItem(StorageKeys.SELECTED_PROJECT);

        this._auth.isLoggedIn.set(false);
        this._auth.userProfile.set(null);
        this._globalToastService.showMsg('Logged out successfully.', 'success');
        this._router.navigate(['login']);
      },
      error: () => {
        this._globalToastService.showMsg('Error logging out. Please try again.');
        this.isCollapsed.set(true);
      },
    });
  }
}
