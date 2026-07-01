import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorMessageService {
  globalErrMsg = signal<string | null>(null)
  private timeOutId : null | number = null
  
  showErrorMsg(message: string|null){
    this.globalErrMsg.set(message)
    
    if(!message) return 

    if(this.timeOutId){
      clearTimeout(this.timeOutId)
    }

    this.timeOutId = window.setTimeout(()=>{
      // to confirm that there is no other message came
      if(this.globalErrMsg() ===message){
        this.globalErrMsg.set(null)
      }

      this.timeOutId= null
    },3000)
  }
}
