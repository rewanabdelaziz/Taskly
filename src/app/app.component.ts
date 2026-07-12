import { Component, inject, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { StorageKeys } from './core/constants/storage-keys';
import { ToastNotificationService } from './shared/services/toast-notification.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'TASKLY';

  private _router = inject(Router);
  private _toast = inject(ToastNotificationService);

  ngOnInit(): void {
    this._router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => {
        const fragments = window.location.hash;
        // if url includes fragments (#)
        if (fragments) {
        
        const params = new URLSearchParams(fragments);
        const type = params.get('type');
        const accessToken = params.get(StorageKeys.ACCESS_TOKEN);

        if (type === 'recovery') {
          window.location.hash = '';
          if (accessToken) {
            console.log('Recovery token detected dynamically! Redirecting to reset-password...')
            this._router.navigate(['/reset-password'], {
              state: { accessToken: accessToken },
            });
          } else {
            this._toast.showMsg('Invalid or expired reset link.');
          }
        }
      }
    });
  }
}
