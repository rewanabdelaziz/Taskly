import { Component, inject } from '@angular/core';
import { PopupService } from '../../services/popup.service';
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})
export class PopupComponent {
  _popUp = inject(PopupService)
}
