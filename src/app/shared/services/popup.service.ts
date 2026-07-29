import { Injectable, signal, Type } from '@angular/core';


export interface ModalConfig<T = unknown> {
  component: Type<T>;
  inputs?: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  isOpen = signal<boolean>(false);
  activePopUp = signal<ModalConfig<unknown>| null>(null);

  open <T>(component: Type<T>, inputs?: Record<string, unknown>) {
    this.activePopUp.set({ component, inputs });
    this.isOpen.set(true);
    // console.log(this.isOpen())
    // console.log("inside service",...arguments)
  }

  close() {
    this.isOpen.set(false);
    this.activePopUp.set(null);
  }
}
