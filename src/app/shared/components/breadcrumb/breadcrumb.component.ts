import { Component, computed, inject } from '@angular/core';
import { Breadcrumbs } from '../../models/breadcrumbs';
import { IconComponent } from '../icon/icon.component';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { ProjectsManagementsService } from '../../../features/projects/services/projects-managements.service';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [IconComponent,RouterLink,RouterLinkActive],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent{
  private _activateRouter = inject(ActivatedRoute)
  private _project_management = inject(ProjectsManagementsService)

  currentProjectId = toSignal(this._activateRouter.paramMap.pipe(
    map((paramMap) => paramMap.get('id') || null)
  ))
 
 breadcrumbs = computed<Breadcrumbs[]>(()=>{
  const currentBreadCrumbs : Breadcrumbs[] =[];
  currentBreadCrumbs.push({ label: 'projects', url: '/project' });

  const id = this.currentProjectId()

  let pageData = this._activateRouter.snapshot.data['breadcrumb'];

  if(id){
    const selectedProjectTitle = this._project_management.selectedProject()?.name
    currentBreadCrumbs.push({ 
        label: selectedProjectTitle!, 
        url: `/project/${id}/epics` 
    });
  }


 
  if(pageData){
    currentBreadCrumbs.push({ 
        label: pageData!, 
        url: `/project/${id}/${pageData}` 
    });
  }

  return currentBreadCrumbs;
 })





}
