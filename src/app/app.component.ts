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
    const currentUrl = window.location.href;
    if (currentUrl.includes('type=recovery') && currentUrl.includes('access_token=')) {
      
      const delimiter = currentUrl.includes('#') ? '#' : '?';
      const queryString = currentUrl.split(delimiter)[1];
      
      if (queryString) {
        const params = new URLSearchParams(queryString);
        const accessToken = params.get(StorageKeys.ACCESS_TOKEN); 

        if (accessToken) {
          console.log(accessToken);
          
          window.location.hash = '';

          setTimeout(() => {
            this._router.navigate(['/reset-password'], {
              state: { accessToken: accessToken },
            });
          }, 100);

          return; 
        }else{
          this._toast.showMsg('Invalid or expired reset link.');
        }
      }
    }
    
  }
}
