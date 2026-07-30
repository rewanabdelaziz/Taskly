import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MembersManagementsService } from '../../services/members-managements.service';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { AuthServiceService } from '../../../auth/services/auth-service.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './accept-invitation.component.html',
  styleUrl: './accept-invitation.component.css'
})
export class AcceptInvitationComponent implements OnInit{
  private _activate_route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _members_service = inject(MembersManagementsService);
  private _toast = inject(ToastNotificationService);
  private _auth = inject(AuthServiceService)
  isLoading = signal<boolean>(true);
  token = signal<string | null>(null);

  ngOnInit(): void {
    const tokenParam = this._activate_route.snapshot.queryParamMap.get('token');

    if (tokenParam) {
      this.token.set(tokenParam);
      if(!this._auth.isLoggedIn()){
        this._toast.showMsg('you should be logged in berfore accept invitation');
        this._router.navigate(['/login'], {
          queryParams: { 
            returnUrl: '/invite', 
            token: tokenParam 
          }
        });
      }
      
    } else {
      this.isLoading.set(false);
      this._toast.showMsg('Invalid or missing invitation token');
      this._router.navigate(['/']);
    }
  }

  verifyAndAcceptInvite() {
    this.isLoading.set(true);
    this._members_service.acceptInvitation(this.token()!).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this._toast.showMsg('Invitation accepted successfully! Welcome to the project.', 'success');
        this._router.navigate(['/project']); 
      },
      error: (err) => {
        this.isLoading.set(false);
        this._toast.showMsg('Failed to accept invitation or token expired');
        this._router.navigate(['/login']);
      }
    })
  }

}
