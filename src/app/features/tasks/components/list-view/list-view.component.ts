import { Component, inject, OnInit, signal } from '@angular/core';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { Router } from '@angular/router';
import { TasksManagementService } from '../../services/tasks-management.service';
import { Task } from '../../models/task';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { DatePipe, NgClass } from '@angular/common';
import { NameAvatarIconComponent } from '../../../../shared/components/name-avatar-icon/name-avatar-icon.component';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [IconComponent,NgClass,NameAvatarIconComponent,DatePipe,StatusLabelPipe],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css'
})
export class ListViewComponent implements OnInit{
  private _projects_management = inject(ProjectsManagementsService)
  private _tasks_management = inject(TasksManagementService)
  private _toast = inject(ToastNotificationService)
  private _router = inject(Router)
  currentProject = this._projects_management.selectedProject
  tasks = signal<Task[]| null>(null)
  isLoading = signal(false)
  isEmpty = signal(false)
  isError = signal(false)

  ngOnInit(): void {
   this.getTasks()
  }


  getTasks(){
      this._tasks_management.getProjectTasksbyStatus(this.currentProject()?.id!).subscribe({
        next: (res:Task[])=>{
          this.isLoading.set(false)
          if(res.length === 0){
            this.isEmpty.set(true)
          }else{
            this.isEmpty.set(false)
          }
          this.tasks.set(res)
          
          console.log(this.tasks())
          
        },
        error:(err)=>{
          this.isLoading.set(false)
          this.isError.set(false)
          // console.log(err)
          this._toast.showMsg("failed to fetch epic's tasks! please try again.")
        }
      })
  }


  navigateToAddTaskPage(){
    this._router.navigate(['/project',this.currentProject()?.id,'tasks','new'])
  }

  

}
