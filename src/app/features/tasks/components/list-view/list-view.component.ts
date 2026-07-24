import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { Router } from '@angular/router';
import { TasksManagementService } from '../../services/tasks-management.service';
import { Task } from '../../models/task';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { DatePipe, NgClass } from '@angular/common';
import { NameAvatarIconComponent } from '../../../../shared/components/name-avatar-icon/name-avatar-icon.component';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { PaginationService } from '../../../../shared/services/pagination.service';
import { HttpResponse } from '@angular/common/http';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [IconComponent,NgClass,NameAvatarIconComponent,DatePipe,StatusLabelPipe,PaginationComponent],
  providers:[PaginationService],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css'
})
export class ListViewComponent implements OnInit{
  private _projects_management = inject(ProjectsManagementsService)
  private _tasks_management = inject(TasksManagementService)
  private _toast = inject(ToastNotificationService)
   _pagination = inject(PaginationService);
  private _router = inject(Router)
  currentProject = this._projects_management.selectedProject
  tasks = signal<Task[]>([])
  isLoading = signal(false)
  isEmpty = signal(false)
  isError = signal(false)
  total = signal(0)


  currentLength = computed(() => 
    this._pagination.currentLength(this.tasks().length)
  )
  endPageNum = computed(() => 
    this._pagination.getEndPageNum(this.total())
  );
  
  onPageChange(newPage: number) {
    this._pagination.goToPage(newPage,this.total());
    this.getTasks();
  }
  
  isMobileNow = signal<boolean>(false);

  ngOnInit(): void {
    this._pagination.init(4);
   this.getTasks()
   this.checkScreenSize();
  }

   @HostListener('window:scroll', [])
    onWindowScroll() {
      if (!this.isMobileNow() || this.isLoading() || this._pagination.currentPage() >= this.endPageNum()) return;
  
      const pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.clientHeight;
      const max = document.documentElement.scrollHeight;
  
      if (pos >= max - 150) {
        this._pagination.currentPage.update((prev) => prev + 1);
        this.getTasks(true);
      }
    }
  
    @HostListener('window:resize', [])
    checkScreenSize() {
      const wasMobile = this.isMobileNow();
      this.isMobileNow.set(window.innerWidth < 1024); // lg:1024px
  
      if (wasMobile && !this.isMobileNow()) {
        this._pagination.currentPage.set(1);
        this.getTasks(false);
      }
    }


  getTasks(isAppend = false){
     if (!isAppend) {
      this.isEmpty.set(false);
      this.isLoading.set(true);
    }
    this.isError.set(false);

      this._tasks_management.getProjectTasksbyStatus(this.currentProject()?.id!,undefined,this._pagination.offset(),this._pagination.limit()).subscribe({
        next: (res: HttpResponse<Task[]>)=>{
          this.isLoading.set(false)
           if (isAppend) {
              const newTask = res.body || [];
              this.tasks.update((prev) => [...prev, ...newTask]);
            } else {
              this.tasks.set(res.body || []);
              
            }
            
            // console.log(res.body)
    
            if (this.tasks().length == 0) {
              this.isEmpty.set(true);
            }
            const contentRange = res.headers.get('content-range');
            if (contentRange) {
              const parts = contentRange.split('/');
              const total = parseInt(parts[1]);
              this.total.set(total);
            }
          
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
