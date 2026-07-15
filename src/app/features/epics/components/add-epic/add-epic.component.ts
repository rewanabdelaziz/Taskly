import { Component, inject, OnInit, signal } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { Router } from '@angular/router';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddEpicPayload } from '../../models/epics';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { EpicsManagementsService } from '../../services/epics-managements.service';
import { SharedMembersService } from '../../../../shared/services/shared-members.service';
import { Member } from '../../../projects/models/members';

@Component({
  selector: 'app-add-epic',
  standalone: true,
  imports: [BreadcrumbComponent,IconComponent,ReactiveFormsModule],
  templateUrl: './add-epic.component.html',
  styleUrl: './add-epic.component.css'
})
export class AddEpicComponent implements OnInit{
  private _router = inject(Router)
  private fb = inject(FormBuilder);
  private _project_management = inject(ProjectsManagementsService)
  private _epicsService = inject(EpicsManagementsService);
  _sharedMembers = inject(SharedMembersService);
  _globalToastMsg = inject(ToastNotificationService);
  addEpicForm!: FormGroup;
  minDate = ''



  currentProject = this._project_management.selectedProject
  isEditMode = signal(false)
  addEpicPlayload!: AddEpicPayload;
  isSubmitted = signal(false);

  ngOnInit(): void {
    this.addEpicForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.minLength(0), Validators.maxLength(500)]],
      assignee_id: [''],
      deadline: [''],
    });

    // calculate min date 
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;

    this._sharedMembers.getMembers(this.currentProject()!.id)
  }

  onSubmit(event: Event){
    this.isSubmitted.set(true);
    event.preventDefault();

     if (this.addEpicForm.valid) {
      const { title, description ,deadline ,assignee_id } = this.addEpicForm.value;
      this.addEpicPlayload = { title, description ,deadline,assignee_id, project_id:this.currentProject()!.id };
      this._epicsService.addNewEpics(this.addEpicPlayload).subscribe({
        next: () => {
          this.isSubmitted.set(false);
          this._globalToastMsg.showMsg(null);
          this.addEpicForm.reset();
          this._globalToastMsg.showMsg('Epics created successfully. You can now invite members and assign epics.', 'success');
          this.navigateToEpicsList()
        },
        error: () => {
          this.isSubmitted.set(false);
          this._globalToastMsg.showMsg(`Failed to create project`);
        },
      });
    } else {
      this.isSubmitted.set(false);
      this.addEpicForm.markAllAsTouched();
    }

  }
  navigateToEpicsList() {
    this._router.navigate([`/project/${this.currentProject()?.id}/epics`]);
  }


}
