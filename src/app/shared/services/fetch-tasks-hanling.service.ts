import { inject, Injectable, signal } from '@angular/core';
import { Task } from '../../features/tasks/models/task';
import { TasksManagementService } from '../../features/tasks/services/tasks-management.service';
import { ToastNotificationService } from './toast-notification.service';

@Injectable({
  providedIn: 'root'
})
export class FetchTasksHanlingService {
  private _tasks_management = inject(TasksManagementService)
  private _toast = inject(ToastNotificationService)

  tasks = signal<Task[]| null>(null)
  isLoading = signal(false)
  isEmpty = signal(false)
  isError = signal(false)

  getTasksForEpic(epicid:string){
    this.isLoading.set(true)
    this._tasks_management.getProjectTasksbyEpicId(epicid).subscribe({
      next: (res:Task[])=>{
        this.isLoading.set(false)
        if(res.length === 0){
          this.isEmpty.set(true)
        }
        this.tasks.set(res)
        // console.log(this.tasks())
        
      },
      error:(err)=>{
        this.isLoading.set(false)
        this.isError.set(false)
        // console.log(err)
        this._toast.showMsg("failed to fetch epic's tasks! please try again.")
      }
    })
  }
}
