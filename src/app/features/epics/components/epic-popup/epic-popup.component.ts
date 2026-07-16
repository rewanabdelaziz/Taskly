import { Component, effect, inject, input, OnChanges, OnInit, output, signal, SimpleChanges } from '@angular/core';
import { AddEpicPayload, Epic } from '../../models/epics';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { EpicsManagementsService } from '../../services/epics-managements.service';
import { SharedMembersService } from '../../../../shared/services/shared-members.service';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { NameAvatarIconComponent } from '../../../../shared/components/name-avatar-icon/name-avatar-icon.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-epic-popup',
  standalone: true,
  imports: [IconComponent,FormFieldComponent,NameAvatarIconComponent,DatePipe,RouterLink],
  templateUrl: './epic-popup.component.html',
  styleUrl: './epic-popup.component.css'
})
export class EpicPopupComponent implements OnInit{
 selectedEpic = input.required<Epic | null>();
 isOpenPopUpInput = input(false);
 close = output<void>()

  private _router = inject(Router)
  private fb = inject(FormBuilder);
  private _project_management = inject(ProjectsManagementsService)
  private _epicsService = inject(EpicsManagementsService);
  _sharedMembers = inject(SharedMembersService);
  _globalToastMsg = inject(ToastNotificationService);
  EpicForm!: FormGroup;
  minDate = ''
 
  currentProject = this._project_management.selectedProject
  EpicPlayload!: AddEpicPayload;
  isSubmitted = signal(false);
  constructor(){
    effect(()=>{
      if(this.EpicForm && this.selectedEpic()){
        this.EpicForm.patchValue(this.selectedEpic()!)
      }
    })
  }


   ngOnInit(): void {
    this.EpicForm = this.fb.group({
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
  }

  get titleControl() {
      return this.EpicForm.get('title') as FormControl;
  }
  get descriptionControl() {
    return this.EpicForm.get('description') as FormControl;
  }
   get deadlineControl() {
    return this.EpicForm.get('deadline') as FormControl;
  }
   get assigneeIdControl() {
    return this.EpicForm.get('assignee_id') as FormControl;
  }

 
 closePopUp(){
  this.close.emit()
 }
}
