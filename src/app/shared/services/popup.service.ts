import { Injectable, signal, Type } from '@angular/core';

export interface ModalOptions {
  inputs?: Record<string, any>;
  mobilePosition?: 'center' | 'bottom-sheet';
}

export interface ModalConfig extends ModalOptions {
  component: Type<any>;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  isOpen = signal<boolean>(false);
  activePopUp = signal<ModalConfig | null>(null);

  open(component: Type<any>, options?: ModalOptions) {
    const mobilePosition = options?.mobilePosition ?? 'center';
    const inputs = options?.inputs;
    
    this.activePopUp.set({ component, inputs,mobilePosition });
    this.isOpen.set(true);
    document.body.classList.add('overflow-hidden');
  }

  close() {
    this.isOpen.set(false);
    this.activePopUp.set(null);
    document.body.classList.remove('overflow-hidden');
  }
}
