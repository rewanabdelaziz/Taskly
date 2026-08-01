import { Component, DestroyRef, inject, input, OnInit, signal, } from '@angular/core';
import { AddEpicPayload, Epic } from '../../models/epics';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { Router} from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { EpicsManagementsService } from '../../services/epics-managements.service';
import { SharedMembersService } from '../../../../shared/services/shared-members.service';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { NameAvatarIconComponent } from '../../../../shared/components/name-avatar-icon/name-avatar-icon.component';
import { DatePipe, SlicePipe } from '@angular/common';
import { Member } from '../../../members/models/members';
import { Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FetchTasksHanlingService } from '../../../../shared/services/fetch-tasks-hanling.service';
import { PopupService } from '../../../../shared/services/popup.service';
import { getTodayDateString } from '../../../../shared/utils/date.utils';
import { Task } from '../../../tasks/models/task';
import { TaskPopupComponent } from '../../../tasks/components/task-popup/task-popup.component';

@Component({
  selector: 'app-epic-popup',
  standalone: true,
  imports: [IconComponent,FormFieldComponent,NameAvatarIconComponent,DatePipe,ReactiveFormsModule,SlicePipe],
  templateUrl: './epic-popup.component.html',
  styleUrl: './epic-popup.component.css'
})
export class EpicPopupComponent implements OnInit{
 selectedEpic = input.required<Epic | null>();

  private fb = inject(FormBuilder);
  private _project_management = inject(ProjectsManagementsService)
  private _epicsService = inject(EpicsManagementsService);
  private _router = inject(Router)
  _sharedMembers = inject(SharedMembersService);
  _globalToastMsg = inject(ToastNotificationService);
  _sharedTasks = inject(FetchTasksHanlingService)
  _popup = inject(PopupService)
  
  epicForm!: FormGroup;
  minDate = getTodayDateString();
  currentAssignee = signal< Member | undefined> (undefined) 
 
  currentProject = this._project_management.selectedProject
  editEpicPlayload!: AddEpicPayload;

  private destroyRef = inject(DestroyRef);
  private autoSave$ = new Subject<void>();



   ngOnInit(): void {
    this.epicForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [null, [Validators.minLength(0), Validators.maxLength(500)]],
      assignee_id: [null],
      deadline: [null],
    });

    if ( this.selectedEpic()) {
      this.getEpicDetail()
      this._sharedTasks.resetState()
      this._sharedTasks.getTasksForEpic(this.selectedEpic()!.id)
    }
  
     

    this._sharedMembers.getMembers(this.currentProject()!.id)

    this.assigneeIdControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((id)=>{
      if(id){
        this.currentAssignee.set(this._sharedMembers.members().find(m => m.user_id === id));
      }else{
        this.currentAssignee.set( undefined)
      }
    })

    this.autoEdit()
    
    
  }

  get titleControl() {
    return this.epicForm.get('title') as FormControl;
  }
  get descriptionControl() {
    return this.epicForm.get('description') as FormControl;
  }
  get deadlineControl() {
    return this.epicForm.get('deadline') as FormControl;
  }
  get assigneeIdControl() {
    return this.epicForm.get('assignee_id') as FormControl;
  }
  
  getEpicDetail(){
    const epicId=this.selectedEpic()?.id
    const projectId = this.selectedEpic()?.project_id
    this._epicsService.getEpicDetails(epicId!,projectId!).subscribe({
      next: (res:Epic[])=>{
        const currentValue=res[0]
        this.epicForm.patchValue({
          ...currentValue,
          assignee_id: currentValue.assignee.sub
        })

        
      },
      error:()=>{
        this._globalToastMsg.showMsg('failed to fetch epic details. please try again')
        this.closePopUp()
      }
    })
  }
  

 
 closePopUp(){
  this._sharedTasks.resetState()
  this._popup.close()
 }

 autoEdit(){
  this.autoSave$.pipe(
    switchMap(()=>{
      const epicId = this.selectedEpic()?.id;
      this.editEpicPlayload = this.epicForm.value;
      return this._epicsService.editEpics(this.editEpicPlayload,epicId!)
    }),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe({
    next:()=>{
      this._globalToastMsg.showMsg("epic update successfully",'success')
    },
    error: ()=>{
      this._globalToastMsg.showMsg('failed to update epic. please try again')
      this.getEpicDetail() // reassign the old value
    }
  })
 }

  edit(){
    if(this.epicForm.valid){
      this.autoSave$.next()
    }
  }

  navigateToAddTaskPage(){
    this._router.navigate(['/project',this.currentProject()?.id,'tasks','new'])
    this._epicsService.setElectedEpic(this.selectedEpic()!)
    this.closePopUp() 
  }

  setSelectedTask(task: Task){
    this._popup.close()
    this._popup.open(TaskPopupComponent,{
      inputs: {selectedTask : task},
      mobilePosition: 'bottom-sheet'
    })
  }

   
}
