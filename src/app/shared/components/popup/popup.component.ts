import { Component, HostListener, inject } from '@angular/core';
import { PopupService } from '../../services/popup.service';
import { NgClass, NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [NgComponentOutlet,NgClass],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})
export class PopupComponent {
  _popUp = inject(PopupService)

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this._popUp.close();
  }
}
