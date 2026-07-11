import { Component, inject } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-nav-bar',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './auth-nav-bar.component.html',
  styleUrl: './auth-nav-bar.component.css'
})
export class AuthNavBarComponent {
  private _router = inject(Router)
  isLoginPage(): boolean {
    return this._router.url.includes('login');
  }
}
