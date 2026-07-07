import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ProjectsManagementsService } from '../../services/projects-managements.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Member } from '../../models/members';
import { MembersManagementsService } from '../../services/members-managements.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { NgClass } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { Breadcrumbs } from '../../../../shared/models/breadcrumbs';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [NgClass, RouterLink,IconComponent,BreadcrumbComponent],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent {
  private project_managements = inject(ProjectsManagementsService);
  private _members = inject(MembersManagementsService);
  private _router = inject(Router);
  members = signal<Member[]>([]);
  isloading = signal<boolean>(false);
  isEmpty = signal<boolean>(false);
  isError = signal<boolean>(false);
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
    if (this.projectId() !== null) {
      this.getMembers(this.projectId() || '');
    }
  }
}
