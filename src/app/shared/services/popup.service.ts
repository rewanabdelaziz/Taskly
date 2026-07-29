import { Injectable, signal, Type } from '@angular/core';


export interface ModalConfig {
  component: Type<any>;
  inputs?: Record<string, any>;
  mobilePosition?: 'center' | 'bottom-sheet';
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  isOpen = signal<boolean>(false);
  activePopUp = signal<ModalConfig | null>(null);

  open(component: Type<any>, inputs?: Record<string, any>,mobilePosition?: 'center' | 'bottom-sheet') {
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
