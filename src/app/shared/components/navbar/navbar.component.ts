import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { AuthServiceService } from '../../../features/auth/services/auth-service.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  @Output() menuClick = new EventEmitter<void>();
  private _auth = inject(AuthServiceService);

  userprofile = this._auth.userProfile;
  avatar = '';
  ngOnInit(): void {
    this.initAvatar();
  }

  initAvatar() {
    if (this.userprofile()?.name) {
      const nameParts = this.userprofile()?.name.trim().split(/\s+/);

      if (nameParts && nameParts.length >= 2) {
        this.avatar = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      } else if (nameParts?.length == 1) {
        this.avatar = nameParts[0].substring(0, 2).toUpperCase();
      }
    }
  }

  clickMenue() {
    this.menuClick.emit();
  }
}
