import { Injectable, signal } from '@angular/core';

export interface ToastData {
  message: string | null;
  status: 'error' | 'success';
}
@Injectable({
  providedIn: 'root',
})
export class ToastNotificationService {
  globalToastMsg = signal<ToastData | null>(null);
  private timeOutId: null | number = null;

  showMsg(message: string | null, status: 'error' | 'success' = 'error') {
    if (!message) return;

    this.globalToastMsg.set({ message, status });

    if (this.timeOutId) {
      clearTimeout(this.timeOutId);
    }

    this.timeOutId = window.setTimeout(() => {
      // to confirm that there is no other message came
      if (this.globalToastMsg()?.message === message) {
        this.globalToastMsg.set(null);
      }

      this.timeOutId = null;
    }, 3000);
  }
}
