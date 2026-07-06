import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastNotificationService } from '../../services/toast-notification.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass,IconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  _toastService = inject(ToastNotificationService);
}
