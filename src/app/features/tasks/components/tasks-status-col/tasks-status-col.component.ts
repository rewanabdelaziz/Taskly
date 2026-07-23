import { Component, inject, input, OnChanges, signal } from '@angular/core';
import { EpicsManagementsService } from '../../../epics/services/epics-managements.service';
import { Status, Task } from '../../models/task';
import { TasksManagementService } from '../../services/tasks-management.service';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { DatePipe, NgClass } from '@angular/common';
import { NameAvatarIconComponent } from '../../../../shared/components/name-avatar-icon/name-avatar-icon.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasks-status-col',
  standalone: true,
  imports: [IconComponent,StatusLabelPipe,DatePipe,NameAvatarIconComponent,NgClass],
  providers:[],
  templateUrl: './tasks-status-col.component.html',
  styleUrl: './tasks-status-col.component.css'
})
export class TasksStatusColComponent implements OnChanges{
  status = input.required<string>();
  
  private _epics_management = inject(EpicsManagementsService)
  private _tasks_management = inject(TasksManagementService)
  private _projects_management = inject(ProjectsManagementsService)
  private _toast = inject(ToastNotificationService)
  private _router = inject(Router)
  currentProject = this._projects_management.selectedProject
  epicId = this._epics_management.selectedEpic

  tasks = signal<Task[]| null>(null)
  isLoading = signal(false)
  isEmpty = signal(false)
  isError = signal(false)

  ngOnChanges(): void {
    this.getTasksByStatus(this.status() as Status)
  }


  getTasksByStatus(status : Status){
    const projID = this._projects_management.selectedProject()?.id
    this._tasks_management.getProjectTasksbyStatus(projID!,status).subscribe({
      next: (res:Task[])=>{
        this.isLoading.set(false)
        if(res.length === 0){
          this.isEmpty.set(true)
        }else{
          this.isEmpty.set(false)
        }
        this.tasks.set(res)
        
        console.log(this.tasks())
        // console.log(epicId)
        
      },
      error:(err)=>{
        this.isLoading.set(false)
        this.isError.set(false)
        // console.log(err)
        this._toast.showMsg("failed to fetch epic's tasks! please try again.")
      }
    })
  }

  resetState() {
    this.tasks.set([]);
    this.isEmpty.set(false);
    this.isError.set(false);
    this.isLoading.set(false);
  }

  getDateStatus(date : string) : 'TODAY' | 'OVERdUE' | 'UPCOMING'{
    const dueDate = new Date (date)
    const today = new Date()

    dueDate.setHours(0,0,0,0)
    today.setHours(0,0,0,0)

    const dueDateTIme = dueDate.getTime()
    const todayTime = dueDate.getTime()

    if(dueDateTIme === todayTime){
      return 'TODAY'
    }else if(dueDateTIme < todayTime){
      return 'OVERdUE'
    }else{
      return 'UPCOMING'
    }
  }

  navigateToAddTaskPage(){
    this._router.navigate(['/project',this.currentProject()?.id,'tasks','new'],{
     state: { status: this.status() }
    })
  }

  
    
}



