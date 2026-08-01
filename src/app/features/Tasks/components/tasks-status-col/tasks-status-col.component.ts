import { Component, computed, DestroyRef, inject, input, OnChanges, OnInit, signal } from '@angular/core';
import { EpicsManagementsService } from '../../../epics/services/epics-managements.service';
import { Status, Task } from '../../models/task';
import { TasksManagementService } from '../../services/tasks-management.service';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { DatePipe } from '@angular/common';
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
  isDragOver = signal(false);
  draggingTaskId = signal<string | null>(null);

  ngOnChanges(): void {
    this.resetState()
    this._pagination.init(3);
    this.getTasksByStatus(this.status() as Status)
  }

  ngOnInit(): void {
    this._activate_router.queryParams
      .pipe(
        map(params => params['search'] || ''),
        takeUntilDestroyed(this.destroyRef) 
      )
      .subscribe(searchTerm => {
        console.log('Search term changed:', searchTerm);
        this._pagination.resetPage(); 
        
        this.searchTerm.set(searchTerm);
        this.getTasksByStatus(this.status() as Status);
      });

    this._tasks_management.taskUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => {

        // handle drag drop event
        if(e){
          // optimistic update to from status column
          if(e?.fromStatus === this.status()){
            this.tasks.update(prev => prev.filter(t => t.id !== e.taskId));
            this.total.update(t => Math.max(0, t - 1));
            return;
          }
          // avoid because we updated in onDrop()
          if (this.status() === e?.toStatus) {
            return;
          }
          

          // skip other columns
          return
        }
        
        // if not drag drop or if fail drag drop
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
    const element = event.target as HTMLElement;
    
    if ( this.isLoading() || this._pagination.currentPage() >= this.endPageNum()) return;

    const pos = element.scrollTop + element.clientHeight;;
    const max = element.scrollHeight;
  
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
 

  // drag and drop functions

  onDragStart(event: DragEvent, task: Task) {
    if (!event.dataTransfer) return;
    const data = JSON.stringify({
      task: task,
      fromStatus: this.status()
    });

    event.dataTransfer.setData('text/plain', data);
    event.dataTransfer.effectAllowed = 'move';

    this.draggingTaskId.set(task.id);
  }

  onDragEnd(event: DragEvent) {
    this.isDragOver.set(false);
   this.draggingTaskId.set(null);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
  
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      this.isDragOver.set(false);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);

    const rawData = event.dataTransfer?.getData('text/plain');
    if (!rawData) return;

    const { task, fromStatus } = JSON.parse(rawData) as { task: Task; fromStatus: Status };
    const targetStatus = this.status();
    if (fromStatus === targetStatus) return;

    // optimistic update to target column (add the card)
    const updatedTask: Task = { ...task, status: targetStatus as Status };
    this.tasks.update(prev => [updatedTask, ...prev]);
    this.total.update(t => t + 1);

    this._tasks_management.editTask(task.id, {status: targetStatus as Status}).subscribe({
      next: () => {
        this._tasks_management.notifyTaskUpdated({
          taskId: task.id,
          fromStatus: fromStatus,
          toStatus: targetStatus
        });
      },
      error: (err) => {
        this._toast.showMsg('Failed to update task status!');

        // optimistic update to target column (remove the card)
        this.tasks.update(prev => prev.filter(t => t.id !== task.id));
        this.total.update(t => Math.max(0, t - 1));

        this._tasks_management.notifyTaskUpdated();
      }
    });
  }

  
  
}



