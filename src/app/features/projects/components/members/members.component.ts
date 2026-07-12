import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ProjectsManagementsService } from '../../services/projects-managements.service';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { Member } from '../../models/members';
import { MembersManagementsService } from '../../services/members-managements.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { NgClass } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { Breadcrumbs } from '../../../../shared/models/breadcrumbs';
import { NameAvatarIconComponent } from '../../../../shared/components/name-avatar-icon/name-avatar-icon.component';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [NgClass, RouterLink,IconComponent,BreadcrumbComponent,NameAvatarIconComponent],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent {
  private project_managements = inject(ProjectsManagementsService);
  private _members = inject(MembersManagementsService);
  private _router = inject(Router);
  private _activateRoute = inject(ActivatedRoute)
  members = signal<Member[]>([]);
  isloading = signal<boolean>(false);
  isEmpty = signal<boolean>(false);
  isError = signal<boolean>(false);
  breadcrumbs = signal<Breadcrumbs[]>([{label:'projects',url:'/project'}])

  projectId = toSignal(
    this._activateRoute.params.pipe(map((params) => params['id'] || null))
  );

  constructor() {
    effect(() => {
      const id = this.projectId();
      const project = this.project_managements.selectedProject();
      if (id && project && project.id === id) {
        untracked(() => {
          this.getMembers(id);
          this.breadcrumbs.update((prev)=> [...prev,
            {label:`${this.project_managements.selectedProject()?.name}`,url:`/project/${this.projectId()}/epics`},
            {label:'project details',url:`/project/${this.projectId()}/members`}])
        });
      }
    });
  }
  getMembers(id: string) {
    this.isloading.set(true);
    this.isError.set(false);
    this.isEmpty.set(false);
    this._members.getProjectMembers(id).subscribe({
      next: (res: Member[]) => {
        this.isloading.set(false);
        if (res.length == 0) {
          this.isEmpty.set(true);
        }
        this.members.set(res);
      },
      error: () => {
        this.isloading.set(false);
        this.isError.set(true);
      },
    });
  }

  retry() {
    const id = this.projectId();
    if (id) {
      this.getMembers(id);
    }
  }
}
