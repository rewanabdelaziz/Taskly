import { Component, computed, HostListener, inject, input, OnChanges, OnInit, signal } from '@angular/core';
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
import { HttpResponse } from '@angular/common/http';
import { PaginationService } from '../../../../shared/services/pagination.service';

@Component({
  selector: 'app-tasks-status-col',
  standalone: true,
  imports: [IconComponent,StatusLabelPipe,DatePipe,NameAvatarIconComponent,NgClass],
  providers:[PaginationService],
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
   _pagination = inject(PaginationService);
  currentProject = this._projects_management.selectedProject
  epicId = this._epics_management.selectedEpic

  tasks = signal<Task[]>([])
  isLoading = signal(false)
  isEmpty = signal(false)
  isError = signal(false)

  ngOnChanges(): void {
    this.resetState()
    this._pagination.init(3);
    this.getTasksByStatus(this.status() as Status)
  }
  
  total = signal(0)
  
  
  currentLength = computed(() => 
    this._pagination.currentLength(this.tasks().length)
  )
  endPageNum = computed(() => 
    this._pagination.getEndPageNum(this.total())
  );


  // @HostListener('window:scroll', [])
      onColumnScroll(event : Event) {
        if ( this.isLoading() || this._pagination.currentPage() >= this.endPageNum()) return;
    
        const pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.clientHeight;
        const max = document.documentElement.scrollHeight;
    
        if (pos >= max - 150) {
          this._pagination.currentPage.update((prev) => prev + 1);
          this.getTasksByStatus(this.status() as Status);
        }
  }



  getTasksByStatus(status : Status){
    this._tasks_management.getProjectTasksbyStatus(this.currentProject()?.id!,status,this._pagination.offset(),this._pagination.limit()).subscribe({
      next: (res:HttpResponse<Task[]>)=>{
        this.isLoading.set(false)
         const newTask = res.body || [];
         this.tasks.update((prev) => [...prev, ...newTask]);

        if(this.tasks().length === 0){
          this.isEmpty.set(true)
        }else{
          this.isEmpty.set(false)
        }

        const contentRange = res.headers.get('content-range');
        if (contentRange) {
          const parts = contentRange.split('/');
          const total = parseInt(parts[1]);
          this.total.set(total);
        }
        // console.log(this.tasks())
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

  getDateStatus(date : string) : 'TODAY' | 'OVERDUE' | 'UPCOMING'{
    const dueDate = new Date (date)
    const today = new Date()

    dueDate.setHours(0,0,0,0)
    today.setHours(0,0,0,0)

    const dueDateTIme = dueDate.getTime()
    const todayTime = dueDate.getTime()

    if(dueDateTIme === todayTime){
      return 'TODAY'
    }else if(dueDateTIme < todayTime){
      return 'OVERDUE'
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



