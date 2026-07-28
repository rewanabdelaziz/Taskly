import { Injectable, signal, Type } from '@angular/core';


export interface ModalConfig {
  component: Type<any>;
  inputs?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  isOpen = signal<boolean>(false);
  activePopUp = signal<ModalConfig | null>(null);

  open(component: Type<any>, inputs?: Record<string, any>) {
    this.activePopUp.set({ component, inputs });
    this.isOpen.set(true);
    console.log(this.isOpen())
    console.log("inside service",...arguments)
  }

  close() {
    this.isOpen.set(false);
    this.activePopUp.set(null);
  }
}
