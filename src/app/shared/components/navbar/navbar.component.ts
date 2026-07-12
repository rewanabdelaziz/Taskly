import { Component, EventEmitter, inject, Output } from '@angular/core';
import { AuthServiceService } from '../../../features/auth/services/auth-service.service';
import { IconComponent } from '../icon/icon.component';
import { NameAvatarIconComponent } from '../name-avatar-icon/name-avatar-icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [IconComponent, NameAvatarIconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  @Output() menuClick = new EventEmitter<void>();
  private _auth = inject(AuthServiceService);

  userprofile = this._auth.userProfile;

  clickMenue() {
    this.menuClick.emit();
  }
}
