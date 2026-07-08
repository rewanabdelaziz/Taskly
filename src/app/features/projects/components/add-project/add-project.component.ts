import { Component, computed, effect, inject, OnDestroy, signal, untracked } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddProjectPayload } from '../../models/projects';
import { ProjectsManagementsService } from '../../services/projects-managements.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { Breadcrumbs } from '../../../../shared/models/breadcrumbs';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [ReactiveFormsModule,IconComponent,BreadcrumbComponent],
  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.css',
})
export class AddProjectComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private _router = inject(Router);
  private _pojectService = inject(ProjectsManagementsService);
  _globalToastMsg = inject(ToastNotificationService);
  successMsg = signal<string | null>(null);
  timeOutId: null | number = null;

  addProjectForm: FormGroup;
  addProjectPlayload!: AddProjectPayload;
  isSubmitted = signal(false);
  breadcrumbs = signal<Breadcrumbs[]>([{label:'projects',url:'/project'}])

  private currentUrl = toSignal(
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this._router.url },
  );

  projectId = computed(() => {
    const url = this.currentUrl();
    const segments = url.split('/');

    const idSegment = segments[2];
    if (idSegment && idSegment !== 'add') {
      return idSegment;
    }
    return null;
  });

  isEditMode = computed(() => {
    return this.projectId() !== null;
  });



  constructor() {
    this.addProjectForm = this.fb.group({
      name: ['', [Validators.required,Validators.minLength(3),Validators.maxLength(100)]],
      description: ['', [Validators.minLength(0),Validators.maxLength(500)]],
    });


    effect(() => {
      const id = this.projectId();
      const project = this._pojectService.selectedProject();
      if (id && project && project.id === id) {
        this.addProjectForm.patchValue({
          name: project.name,
          description: project.description,
        });
        untracked(()=>{
            this.breadcrumbs.update((prev)=> [...prev,{label:'edit project',url:`/project/${this.projectId()}/edit`}])
        })
        
      }else{
        untracked(()=>{
            this.breadcrumbs.update((prev)=> [...prev,{label:'add new project',url:"/project/add"}] )
        })
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timeOutId) {
      clearTimeout(this.timeOutId);
    }
  }

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
          // this._router.navigate(['/project']);
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
}
