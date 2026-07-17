import { Component, DestroyRef, effect, inject, input, OnChanges, OnInit, output, signal, SimpleChanges } from '@angular/core';
import { AddEpicPayload, Epic } from '../../models/epics';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { EpicsManagementsService } from '../../services/epics-managements.service';
import { SharedMembersService } from '../../../../shared/services/shared-members.service';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { NameAvatarIconComponent } from '../../../../shared/components/name-avatar-icon/name-avatar-icon.component';
import { DatePipe } from '@angular/common';
import { Member } from '../../../members/models/members';
import { Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-epic-popup',
  standalone: true,
  imports: [IconComponent,FormFieldComponent,NameAvatarIconComponent,DatePipe,RouterLink,ReactiveFormsModule],
  templateUrl: './epic-popup.component.html',
  styleUrl: './epic-popup.component.css'
})
export class EpicPopupComponent implements OnInit{
 selectedEpic = input.required<Epic | null>();
 isOpenPopUpInput = input(false);
 close = output<void>()

  private fb = inject(FormBuilder);
  private _project_management = inject(ProjectsManagementsService)
  private _epicsService = inject(EpicsManagementsService);
  _sharedMembers = inject(SharedMembersService);
  _globalToastMsg = inject(ToastNotificationService);
  epicForm!: FormGroup;
  minDate = ''
  currentAssignee = signal< Member | undefined> (undefined) 
 
  currentProject = this._project_management.selectedProject
  editEpicPlayload!: AddEpicPayload;

  private destroyRef = inject(DestroyRef);
  private autoSave$ = new Subject<void>();

  constructor(){
    effect(()=>{
      if(this.isOpenPopUpInput()&&this.epicForm && this.selectedEpic()){
        this.getEpicDetail()
        // this.EpicForm.patchValue(this.selectedEpic()!)
      }
    })
  }


   ngOnInit(): void {
    this.epicForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [null, [Validators.minLength(0), Validators.maxLength(500)]],
      assignee_id: [null],
      deadline: [null],
    });
     

    // calculate min date 
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;

    this._sharedMembers.getMembers(this.currentProject()!.id)

    this.assigneeIdControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((id)=>{
      if(id){
        this.currentAssignee.set(this._sharedMembers.members().find(m => m.user_id === id));
        // console.log(this.currentAssignee())
      }else{
        this.currentAssignee.set( undefined)
      }
      // console.log(id)
      // console.log(this.currentAssignee())
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
        // console.log(res)
        const currentValue=res[0]
        this.epicForm.patchValue({
          ...currentValue,
          assignee_id: currentValue.assignee.sub
        })
        // console.log(this.EpicForm.value)
        
      },
      error:()=>{
        this._globalToastMsg.showMsg('failed to fetch epic details. please try again')
        this.closePopUp()
      }
    })
  }
  

 
 closePopUp(){
  this.close.emit()
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
}
