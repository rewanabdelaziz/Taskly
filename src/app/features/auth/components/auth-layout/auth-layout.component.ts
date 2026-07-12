import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthNavBarComponent } from '../auth-nav-bar/auth-nav-bar.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, AuthNavBarComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
})
export class AuthLayoutComponent {}
