import { inject, Injectable, signal } from '@angular/core';
import { AddProjectPayload, Project } from '../models/projects';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiEndponts } from '../../../core/enums/api-endpoints';
import { Observable } from 'rxjs';
import { StorageKeys } from '../../../core/enums/storage-keys';
@Injectable({
  providedIn: 'root'
})
export class ProjectsManagementsService {
  private _http = inject(HttpClient);
  baseUrl = environment.baseUrl

  private savedProject = localStorage.getItem(StorageKeys.SELECTED_PROJECT);
  selectedProject = signal<Project | null>(
    this.savedProject ? JSON.parse(this.savedProject) : null
  );

  setSelectedProject(project: Project){
    this.selectedProject.set(project)
    localStorage.setItem(StorageKeys.SELECTED_PROJECT,JSON.stringify(project))
  }

  clearSelectedProject(){
    this.selectedProject.set(null)
    localStorage.removeItem(StorageKeys.SELECTED_PROJECT)
  }

  addNewProject(projectPayload: AddProjectPayload) {
    return this._http.post(`${this.baseUrl}${ApiEndponts.ADD_PROJECT}`, projectPayload)
  }

  getAllProjects(offset:number , limit:number): Observable<HttpResponse<Project[]>>{
    const params = new HttpParams()
    .set('limit', limit.toString())
    .set('offset', offset.toString());

    const headers = new HttpHeaders()
    .set('Prefer', 'count=exact');

    return this._http.get<Project[]>(`${this.baseUrl}${ApiEndponts.GET_PROJECTS}`,
      {headers,
        params,
      observe: 'response'  //to return all response (header + body)
    })
  }

  editProject(projectPayload: AddProjectPayload,projectId:string){
    const params = new HttpParams().set('id', `eq.${projectId}`);
    return this._http.patch(`${this.baseUrl}${ApiEndponts.ADD_PROJECT}`, projectPayload,{params: params})
  }

}
