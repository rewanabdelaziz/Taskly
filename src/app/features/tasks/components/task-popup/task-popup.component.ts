import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { AddTaskPayload, Status, Task } from '../../models/task';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedMembersService } from '../../../../shared/services/shared-members.service';
import { TasksManagementService } from '../../services/tasks-management.service';
import { HttpResponse } from '@angular/common/http';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { PopupService } from '../../../../shared/services/popup.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { NameAvatarIconComponent } from '../../../../shared/components/name-avatar-icon/name-avatar-icon.component';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { Subject, switchMap } from 'rxjs';
import { CurrentProjectEpicsService } from '../../../../shared/services/current-project-epics.service';
import { getTodayDateString } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-task-popup',
  standalone: true,
  imports: [IconComponent,NameAvatarIconComponent,ReactiveFormsModule,FormFieldComponent,SlicePipe,DatePipe,NgClass,StatusLabelPipe],
  providers:[],
  templateUrl: './task-popup.component.html',
  styleUrl: './task-popup.component.css'
})
export class TaskPopupComponent implements OnInit{
  selectedTask = input.required<Task | null>();
 
  private fb = inject(FormBuilder);
  private _tasks_management = inject(TasksManagementService);
  private _project_management = inject(ProjectsManagementsService)
  private _toast= inject(ToastNotificationService);
  _sharedMembers = inject(SharedMembersService);
  private _popup = inject(PopupService)
  _current_project_epics= inject(CurrentProjectEpicsService)

  private destroyRef = inject(DestroyRef);
  currentProject = this._project_management.selectedProject
  taskForm!: FormGroup;
  minDate = getTodayDateString();
  isLoading = signal(false);
  isError = signal(false);
  isEmpty = signal(false);
  task = signal<Task | null>(null)
  statuses = Object.values(Status);

  private assigneeIdSignal = signal<string | null>(null);
  private statusSignal = signal<Status | undefined>(undefined);
  private EpicIdSginal = signal<string | null>(null);
  private initialFormValue: any = null;

  currentAssignee = computed(() => {
    const id = this.assigneeIdSignal();
    if (!id) return undefined;
    return this._sharedMembers.members().find(m => m.user_id === id);
  });

  currentEpic = computed(() => {
    const id = this.EpicIdSginal();
    if (!id) return undefined;
    return this._current_project_epics.epics().find(m => m.id === id);
  });



  currentStatus = computed(() => this.statusSignal());
  private autoSave$ = new Subject<void>();
  
  ngOnInit(): void {
    this.taskForm = this.fb.group({
     title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
     description: [null, Validators.maxLength(500)],
     assignee_id: [null],
     due_date: [null],
     epic_id: [null],
     status: [Validators.required],
    });

    this.assigneeIdControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(id => this.assigneeIdSignal.set(id));

    this.statusControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(stat => this.statusSignal.set(stat));

    this.epicIdControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(id => this.EpicIdSginal.set(id));
        

    if ( this.selectedTask()) {
        this.getTaskDetail()        
    }

    this._sharedMembers.getMembers(this.currentProject()!.id)
    this._current_project_epics.getCurrentProjectEpics()
    this.autoEdit()
  }

  get titleControl() {
    return this.taskForm.get('title') as FormControl;
  }
  get descriptionControl() {
    return this.taskForm.get('description') as FormControl;
  }
  get deadlineControl() {
    return this.taskForm.get('due_date') as FormControl;
  }
  get assigneeIdControl() {
    return this.taskForm.get('assignee_id') as FormControl;
  }
  get epicIdControl() {
    return this.taskForm.get('epic_id') as FormControl;
  }
  get statusControl() {
    return this.taskForm.get('status') as FormControl;
  }

   getTaskDetail(){
    const taskId=this.selectedTask()?.id
    const projectId = this.selectedTask()?.project_id
    this.isLoading.set(true)
    this.isError.set(false)
    this.isEmpty.set(false)
    this._tasks_management.getProjectTasksbyStatus(projectId!,undefined,undefined,undefined,taskId).subscribe({
        next: (res: HttpResponse<Task[]>)=>{
          this.isLoading.set(false)
          if(res.body?.length !== 0){
            const currentValue=res.body![0]
            this.task.set(currentValue)

            const formattedDueDate = currentValue.due_date 
                  ? currentValue.due_date.split('T')[0]
                  : null;

            this.taskForm.patchValue({
              ...currentValue,
              due_date: formattedDueDate,
              assignee_id: currentValue.assignee.id
            })

            this.initialFormValue = this.taskForm.getRawValue();

          }else{
            this.isEmpty.set(true)
            this.task.set(null)
          }
          

          
        },
        error:(err)=>{
          this.isLoading.set(false)
          this.isError.set(true)
          this._toast.showMsg("failed to fetch the task! please try again.")
        }
      })
  }

  closePopUp(){
    this.resetState()
    this._popup.close()
  }

  resetState(){
    this.task.set(null)
    this.isError.set(false);
    this.isLoading.set(false);
    this.isEmpty.set(false);
  }

  getChangedValues(): Partial<AddTaskPayload> {
    const currentValues = this.taskForm.getRawValue();
    const changes: any = {};
    const cleanValue = (val: any) => 
      (val === undefined || String(val).trim() === '' || String(val).trim() === 'null') ? null : val;
  
    Object.keys(currentValues).forEach(key => {
      const current = cleanValue(currentValues[key]);
      const initial = cleanValue(this.initialFormValue?.[key]);
  
      //  if field change
      if (current !== initial) {
        changes[key] = current;
      }
    });
  
    return changes;
  }
   autoEdit(){
    this.autoSave$.pipe(
      switchMap(()=>{
        const taskId = this.selectedTask()?.id;
        const payload= this.getChangedValues();
        // if no change avoid api call
        if (Object.keys(payload).length === 0) {
          return []; 
        }
      
        return this._tasks_management.editTask(taskId!,payload)
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next:()=>{
        this._toast.showMsg("task update successfully",'success')
        this.initialFormValue = this.taskForm.getRawValue();
        this._tasks_management.notifyTaskUpdated();
      },
      error: ()=>{
        this._toast.showMsg('failed to update the task. please try again')
        this.getTaskDetail() // reassign the old value
      }
    })
   }
  
    edit(){
      if(this.taskForm.valid){
        this.autoSave$.next()
      }
    }



}
