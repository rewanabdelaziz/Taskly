import { Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { StorageKeys } from './core/enums/storage-keys';
import { ToastNotificationService } from './shared/services/toast-notification.service';
import { filter} from 'rxjs';
import { AuthServiceService } from './features/auth/services/auth-service.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit{
  title = 'TASKLY';
  
  private _router = inject(Router)
  private _activatedRouter = inject(ActivatedRoute)
  private _toast = inject(ToastNotificationService)
  private _auth = inject(AuthServiceService)

  ngOnInit(): void {
    this._activatedRouter.fragment.subscribe((frag)=>{
      // if url includes fragments (#)
      if (frag){
        const params = new URLSearchParams(frag);
        const type = params.get('type');
        const accessToken = params.get(StorageKeys.ACCESS_TOKEN)

        if(type === 'recovery' ){
          if(accessToken){
            console.log('Recovery token detected dynamically! Redirecting to reset-password...')
            this._router.navigate(['/reset-password'],{
              state: {accessToken : accessToken}
            })
            this._auth.resetToken.set(accessToken)
          }else{
            this._toast.showMsg('Invalid or expired reset link.')
          }
        }


      
      }
    })
  }
}
