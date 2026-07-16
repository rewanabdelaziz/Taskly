import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddProjectPayload } from '../../models/projects';
import { ProjectsManagementsService } from '../../services/projects-managements.service';
import { Subscription } from 'rxjs';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, BreadcrumbComponent,FormFieldComponent],
  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.css',
})
export class AddProjectComponent implements OnDestroy, OnInit {
  private fb = inject(FormBuilder);
  private _router = inject(Router);
  private _activateRoute = inject(ActivatedRoute);
  private _pojectService = inject(ProjectsManagementsService);
  _globalToastMsg = inject(ToastNotificationService);
  successMsg = signal<string | null>(null);
  timeOutId: null | number = null;

  addProjectForm!: FormGroup;
  addProjectPlayload!: AddProjectPayload;
  isSubmitted = signal(false);

  projectId = signal<string | null>(null);
  private route$!: Subscription;

  ngOnInit(): void {
    this.addProjectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.minLength(0), Validators.maxLength(500)]],
    });

    this.route$ = this._activateRoute.params.subscribe((params) => {
      const id = params['id'] || null;
      this.projectId.set(id);
      const project = this._pojectService.selectedProject();
      if (id && project && project.id === id) {
        this.addProjectForm.patchValue({
          name: project.name,
          description: project.description,
        });
      }
    });
  }

  isEditMode = computed(() => {
    return this.projectId() !== null;
  });



  onSubmit(event: Event) {
    this.isSubmitted.set(true);
    event.preventDefault();

    if (this.isEditMode() && this.projectId() !== null) {
      const id = this.projectId() || '';
      this.editProject(id);
    } else {
      this.addProject();
    }
  }

  addProject() {
    if (this.addProjectForm.valid) {
      const { name, description } = this.addProjectForm.value;
      this.addProjectPlayload = { name, description };
      this._pojectService.addNewProject(this.addProjectPlayload).subscribe({
        next: () => {
          this.isSubmitted.set(false);
          this._globalToastMsg.showMsg(null);
          this.addProjectForm.reset();
          this.successMsg.set('Project created successfully. You can now invite members and assign epics.');
          this._globalToastMsg.showMsg(this.successMsg(), 'success');
          this.navigateToProjectList() 
        },
        error: () => {
          this.isSubmitted.set(false);
          this._globalToastMsg.showMsg(`Failed to create project`);
        },
      });
    } else {
      this.isSubmitted.set(false);
      this.addProjectForm.markAllAsTouched();
    }
  }

  editProject(id: string) {
    if (this.addProjectForm.valid) {
      const { name, description } = this.addProjectForm.value;
      this.addProjectPlayload = { name, description };
      this._pojectService.editProject(this.addProjectPlayload, id).subscribe({
        next: () => {
          this.isSubmitted.set(false);
          this._globalToastMsg.showMsg(null);
          this.addProjectForm.reset();
          this.successMsg.set('Project edited successfully. You can now invite members and assign epics.');
          this._globalToastMsg.showMsg(this.successMsg(), 'success');
          this._router.navigate(['/project']);
        },
        error: () => {
          this.isSubmitted.set(false);
          this._globalToastMsg.showMsg(`Failed to edit project.please try again.`);
        },
      });
    } else {
      this.isSubmitted.set(false);
    }
  }

  navigateToProjectList() {
    this._router.navigate(['/project']);
  }

  get titleControl() {
    return this.addProjectForm.get('name') as FormControl;
  }
  get descriptionControl() {
    return this.addProjectForm.get('description') as FormControl;
  }


  ngOnDestroy(): void {
    if (this.timeOutId) {
      clearTimeout(this.timeOutId);
    }

    if (this.route$) {
      this.route$.unsubscribe();
    }
  }

}
