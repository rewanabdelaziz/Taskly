import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, RoutesRecognized } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { StorageKeys } from './core/constants/storage-keys';
import { ToastNotificationService } from './shared/services/toast-notification.service';
import { filter, Subscription, take } from 'rxjs';


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
  router$! : Subscription

  ngOnInit(): void {
    this.router$ = this._router.events.pipe(
      filter((e): e is RoutesRecognized => e instanceof RoutesRecognized),
      take(1)
    ).subscribe((event: RoutesRecognized) => {

      const currentUrl = event.url;
    
      if (currentUrl.includes('type=recovery') && currentUrl.includes('access_token=')) {
        
        const delimiter = currentUrl.includes('#') ? '#' : '?';
        const queryString = currentUrl.split(delimiter)[1];
        
        if (queryString) {
          const params = new URLSearchParams(queryString);
          const accessToken = params.get(StorageKeys.ACCESS_TOKEN); 
  
          if (accessToken) {
            this._router.navigate(['/reset-password'], {
                state: { accessToken: accessToken },
              });
            return; 
          }
        
  
        }
  
      }else if(currentUrl.includes('error=access_denied') && currentUrl.includes('error_code=otp_expired')){
        this._toast.showMsg("this link is expired or something wrong! please try again.")
        this._router.navigate(['/forgot-password'])
      }
  
    })

   
    
  }
}
