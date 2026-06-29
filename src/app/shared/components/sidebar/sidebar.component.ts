import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  isCollapsed = signal(false);
  isMobileOpen = signal(false);

  toggleSidebar() {
    this.isCollapsed.update((state) => !state);
  }

  toggleMobileSidebar() {
    this.isMobileOpen.update((state) => !state);
  }
}
