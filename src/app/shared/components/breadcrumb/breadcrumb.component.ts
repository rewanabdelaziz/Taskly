import { Component, computed, inject, input } from '@angular/core';
import { Breadcrumbs } from '../../models/breadcrumbs';
import { IconComponent } from '../icon/icon.component';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ProjectsManagementsService } from '../../../features/projects/services/projects-managements.service';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [IconComponent, RouterLink, RouterLinkActive],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
  CustomClass = input<string|null>(null)
  private _activateRouter = inject(ActivatedRoute);
  private _project_management = inject(ProjectsManagementsService);
  private _router = inject(Router);

  currentProjectId = toSignal(this._activateRouter.paramMap.pipe(map((paramMap) => paramMap.get('id') || null)));

  breadcrumbs = computed<Breadcrumbs[]>(() => {
    const currentBreadCrumbs: Breadcrumbs[] = [];
    currentBreadCrumbs.push({ label: 'projects', url: '/project' ,withRouterLinkActive: true});

    const id = this.currentProjectId();

    if (id) {
      const selectedProjectTitle = this._project_management.selectedProject()?.name;
      currentBreadCrumbs.push({
        label: selectedProjectTitle!,
        url: `/project/${id}/edit`,
        withRouterLinkActive: false
      });
    }
    const pageData = this._activateRouter.snapshot.data['breadcrumb'];
    const segments = this._router.url.split('/').filter(segment => segment.length > 0);
    const lastSegIndex = segments.length -1 

    if(segments[lastSegIndex] === 'new'){
      
      currentBreadCrumbs.push({
        label: `${segments[lastSegIndex-1]}`,
        url: `/project/${id}/${segments[lastSegIndex-1]}`,
        withRouterLinkActive: true
      });

      if (pageData) {
        currentBreadCrumbs.push({
          label: pageData!,
          url: `/project/${id}/${segments[lastSegIndex-1]}/${segments[lastSegIndex]}`,
          withRouterLinkActive: true
        });
      }  

    }else{

      if (pageData) {
      currentBreadCrumbs.push({
        label: pageData!,
        url: `/project/${id}/${pageData}`,
        withRouterLinkActive: true
      });
    }
    }
    

    return currentBreadCrumbs;
  });
}
