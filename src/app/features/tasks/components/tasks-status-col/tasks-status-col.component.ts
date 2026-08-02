import { Component, computed, DestroyRef, HostListener, inject, input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { EpicsManagementsService } from '../../../epics/services/epics-managements.service';
import { Status, Task } from '../../models/task';
import { TasksManagementService } from '../../services/tasks-management.service';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { DatePipe, NgClass } from '@angular/common';
import { NameAvatarIconComponent } from '../../../../shared/components/name-avatar-icon/name-avatar-icon.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { PaginationService } from '../../../../shared/services/pagination.service';
import { PopupService } from '../../../../shared/services/popup.service';
import { TaskPopupComponent } from '../task-popup/task-popup.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { getStatusBgClass } from '../../../../shared/utils/status.utils';


@Component({
  selector: 'app-tasks-status-col',
  standalone: true,
  imports: [IconComponent,StatusLabelPipe,DatePipe,NameAvatarIconComponent],
  providers:[PaginationService],
  templateUrl: './tasks-status-col.component.html',
  styleUrl: './tasks-status-col.component.css'
})
export class TasksStatusColComponent implements OnChanges,OnInit{
  status = input.required<Status>();
  
  private _epics_management = inject(EpicsManagementsService)
  private _tasks_management = inject(TasksManagementService)
  private _projects_management = inject(ProjectsManagementsService)
  private _toast = inject(ToastNotificationService)
  private _router = inject(Router)
  private _activate_router = inject(ActivatedRoute)
  private _popup = inject(PopupService)
  _pagination = inject(PaginationService);
  currentProject = this._projects_management.selectedProject
  epicId = this._epics_management.selectedEpic
  private destroyRef = inject(DestroyRef);

  tasks = signal<Task[]>([])
  isLoading = signal(false)
  isEmpty = signal(false)
  isError = signal(false)
  isSearchEmpty = signal(false);
  isSearchLoading = signal(false);
  isSearchError = signal(false);

  searchTerm = signal<string>('')
  getStatusBgClass = getStatusBgClass
  


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['status'] && !changes['status'].firstChange) {
      this.resetState();
      this._pagination.init(3);
      this.getTasksByStatus(this.status() as Status);
    }
  }

  ngOnInit(): void {
    this._pagination.init(3);

    this._activate_router.queryParams
      .pipe(
        map(params => params['search'] || ''),
        takeUntilDestroyed(this.destroyRef) 
      )
      .subscribe(searchTerm => {
        console.log('Search term changed:', searchTerm);
        this._pagination.resetPage(); 
        
        this.searchTerm.set(searchTerm);
        this.resetState();
        this.getTasksByStatus(this.status() as Status);
      });

    this._tasks_management.taskUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.resetState();
        this._pagination.init(3);
        this.getTasksByStatus(this.status() as Status);
    })
  }
  
  total = signal(0)
  
  
  currentLength = computed(() => 
    this._pagination.currentLength(this.tasks().length)
  )
  endPageNum = computed(() => 
    this._pagination.getEndPageNum(this.total())
  );


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
    const isSearching = this.searchTerm().trim() !== '';
    this.isLoading.set(!isSearching);
    this.isSearchLoading.set(isSearching);
    this.isError.set(false);
    this.isSearchError.set(false);
    this.isEmpty.set(false);
    this.isSearchEmpty.set(false);
    this._tasks_management.getProjectTasksbyStatus(this.currentProject()?.id!,status,this._pagination.offset(),this._pagination.limit(),undefined,this.searchTerm()).subscribe({
      next: (res:HttpResponse<Task[]>)=>{
        this.isLoading.set(false)
        this.isSearchLoading.set(false)
         const newTask = res.body || [];
         this.tasks.update((prev) => [...prev, ...newTask]);

        if(this.tasks().length === 0){
          if (isSearching) {
                this.isSearchEmpty.set(true); 
              } else {
                this.isEmpty.set(true);      
              }
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
        this.isError.set(true)
        this.isSearchLoading.set(false)
        this.isSearchError.set(true)
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
    const todayTime = today.getTime()

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

  setSelectedTask(task: Task){
    this._popup.open(TaskPopupComponent,{
      inputs: {selectedTask : task},
      mobilePosition: 'bottom-sheet'
    })
  }
  
  getCardCustomClass(): string {
    if(this.status() == 'IN_PROGRESS'){
     return  'border-l-4 border-l-primary' 
    }else if(this.status() == 'BLOCKED'){
       return 'border-[#BA1A1A1A]! bg-[#FFDAD633]!'
    }
    return ''
  }
 

    
}



