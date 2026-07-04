import { inject, Injectable } from '@angular/core';
import { AddProjectPayload, Project } from '../models/projects';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiEndponts } from '../../../core/enums/api-endpoints';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ProjectsManagementsService {
  private _http = inject(HttpClient);
  baseUrl = environment.baseUrl

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
}
