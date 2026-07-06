import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastNotificationService } from '../../services/toast-notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  _toastService = inject(ToastNotificationService);
}
