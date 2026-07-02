import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import {ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddProjectPayload } from '../../models/projects';
import { AddProjectSchema } from '../../add-project.schema';
import { ProjectsManagementsService } from '../../services/projects-managements.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,ReactiveFormsModule],
  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.css'
})
export class AddProjectComponent implements OnDestroy{
  private fb = inject(FormBuilder);
  private _router = inject(Router);
  private _pojectService = inject(ProjectsManagementsService);
  _globalToastMsg = inject(ToastNotificationService)
  successMsg = signal<string | null>(null);
  timeOutId : null | number = null;

  addProjectForm: FormGroup;
  isSubmitted = signal(false);
  formValue = signal({});
  addProjectPlayload!: AddProjectPayload;
  

  formErrors = computed(() => {
      const current = this.formValue();
      const res = AddProjectSchema.safeParse(current);
      let errors: Record<string, string> = {};
  
      if (res.success) {
        errors = {};
      } else {
        res.error.issues.forEach((issue) => {
          const path = issue.path.join('_');
          errors[path] = issue.message;
        });
      }
  
      return errors;
  });

  isFormInvalid = computed(() => {
    return Object.keys(this.formErrors()).length > 0;
  });

  constructor() {
    this.addProjectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      rememberMe: [false],
    });

    this.formValue.set(this.addProjectForm.value);

    this.addProjectForm.valueChanges.subscribe((v) => {
      this.formValue.set(v);
    });
  }
  ngOnDestroy(): void {
    if(this.timeOutId){
      clearTimeout(this.timeOutId)
    }
  }

  onSubmit(event: Event) {
    this.isSubmitted.set(true);
    event.preventDefault();
    const errors = this.formErrors();

    if (Object.keys(errors).length === 0) {
      const {name , description} = this.addProjectForm.value;
      this.addProjectPlayload = {name, description};
      this._pojectService.addNewProject(this.addProjectPlayload).subscribe({
        next: () => {
          this.isSubmitted.set(false);
          this._globalToastMsg.showMsg(null);
          this.addProjectForm.reset();
          this.successMsg.set("Project created successfully. You can now invite members and assign epics.");
          this._globalToastMsg.showMsg(this.successMsg(), 'success');
          // this._router.navigate(['/project']);
        },
        error: () => {
          this.isSubmitted.set(false);
          this._globalToastMsg.showMsg(`Failed to create project`);
        }
      });
    }else {
      this.isSubmitted.set(false);
      this.addProjectForm.markAllAsTouched();
    }
  }

  navigateToProjectList(){
    this._router.navigate(['/project']);
  }
}
