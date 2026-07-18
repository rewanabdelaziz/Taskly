import { Component, inject, OnDestroy, signal,} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { EpicsManagementsService } from '../../../epics/services/epics-managements.service';
import { SharedMembersService } from '../../../../shared/services/shared-members.service';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { AddTaskPayload, Status } from '../../models/task';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { CurrentProjectEpicsService } from '../../../../shared/services/current-project-epics.service';
import { TasksManagementService } from '../../services/tasks-management.service';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [FormFieldComponent,ReactiveFormsModule,RouterOutlet,BreadcrumbComponent,StatusLabelPipe,SlicePipe],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css'
})
export class AddTaskComponent implements OnDestroy{
  private _router = inject(Router)
  private fb = inject(FormBuilder);
  private _project_management = inject(ProjectsManagementsService)
  private _epicsService = inject(EpicsManagementsService);
  private _tasks_management = inject(TasksManagementService);
  _current_project_Epics = inject(CurrentProjectEpicsService)
  _sharedMembers = inject(SharedMembersService);
  _globalToastMsg = inject(ToastNotificationService);
  
  addTaskForm!: FormGroup;
  minDate = ''
  currentProject = this._project_management.selectedProject
  selectedEpic = this._epicsService.selectedEpic
  addTaskPlayload!: AddTaskPayload;
  isSubmitted = signal(false);
  status = Object.keys(Status)

  ngOnInit(): void {
    this.addTaskForm = this.fb.group({
     title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
     description: [null, [Validators.minLength(0), Validators.maxLength(500)]],
     assignee_id: [null],
     due_date: [null],
     epic_id: [this.selectedEpic()? this.selectedEpic()?.id : null],
     status: [Status.TO_DO],
    });

    // calculate min date 
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;

    this._sharedMembers.getMembers(this.currentProject()!.id)
    this._current_project_Epics.getCurrentProjectEpics()

    
  }

  get titleControl() {
    return this.addTaskForm.get('title') as FormControl;
  }
  get descriptionControl() {
    return this.addTaskForm.get('description') as FormControl;
  }
  get deadlineControl() {
    return this.addTaskForm.get('due_date') as FormControl;
  }
  get assigneeIdControl() {
    return this.addTaskForm.get('assignee_id') as FormControl;
  }
  get epicIdControl() {
    return this.addTaskForm.get('epic_id') as FormControl;
  }
  get statusControl() {
    return this.addTaskForm.get('assignee_id') as FormControl;
  }

  onSubmit(event: Event){
    this.isSubmitted.set(true);
    event.preventDefault();

     if (this.addTaskForm.valid) {
      const { title, description ,due_date ,assignee_id,epic_id ,status} = this.addTaskForm.value;
      const cleanValue = (val: any) => ( val === undefined || String(val).trim() === '') ? null : val;

      this.addTaskPlayload = {
         title, 
         status,
         description: cleanValue(description) ,
         due_date: cleanValue(due_date),
         assignee_id: cleanValue(assignee_id),
         epic_id:cleanValue(epic_id) ,
         project_id:this.currentProject()!.id };

      this._tasks_management.addNewTask(this.addTaskPlayload).subscribe({
        next: () => {
          this.isSubmitted.set(false);
          this._globalToastMsg.showMsg(null);
          this.addTaskForm.reset();
          this._globalToastMsg.showMsg('Task created successfully. You can now invite members and assign epics.', 'success');
          this.navigateToTasksList()
        },
        error: () => {
          this.isSubmitted.set(false);
          this._globalToastMsg.showMsg(`Failed to create Epic! try again`);
        },
      });
    } else {
      this.isSubmitted.set(false);
      this.addTaskForm.markAllAsTouched();
    }

  }

  navigateToTasksList() {
    this._router.navigate([`/project/${this.currentProject()?.id}/tasks`]);
  }

  ngOnDestroy(): void {
    this._epicsService.clearSelectedEpic()
  }
}
