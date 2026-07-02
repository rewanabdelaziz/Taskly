import { inject, Injectable } from '@angular/core';
import { AddProjectPayload } from '../models/projects';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiEndponts } from '../../../core/enums/api-endpoints';
@Injectable({
  providedIn: 'root'
})
export class ProjectsManagementsService {
  private _http = inject(HttpClient);
  baseUrl = environment.baseUrl

  addNewProject(projectPayload: AddProjectPayload) {
    return this._http.post(`${this.baseUrl}${ApiEndponts.ADD_PROJECT}`, projectPayload)
  }
}
