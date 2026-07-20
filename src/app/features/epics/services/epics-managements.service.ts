import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/constants/api-endpoints';
import { Observable } from 'rxjs';
import { AddEpicPayload, Epic } from '../models/epics';
import { StorageKeys } from '../../../core/constants/storage-keys';


@Injectable({
  providedIn: 'root'
})
export class EpicsManagementsService {

  private _http = inject(HttpClient);
  baseUrl = environment.baseUrl;

  private savedEpic = sessionStorage.getItem(StorageKeys.SELECTED_EPIC);
  selectedEpic = signal<Epic | null>(this.savedEpic ? JSON.parse(this.savedEpic) : null)

  setElectedEpic(epic:Epic){
    this.selectedEpic.set(epic)
    sessionStorage.setItem(StorageKeys.SELECTED_EPIC, JSON.stringify(epic));
  }

  clearSelectedEpic(){
    this.selectedEpic.set(null)
    sessionStorage.removeItem(StorageKeys.SELECTED_EPIC);
  }

  addNewEpics(epicPayload: AddEpicPayload) {
    return this._http.post(`${this.baseUrl}${ApiEndpoints.ADD_EPIC}`, epicPayload);
  }

  getAllEpics(projectId:string,offset?: number, limit?: number): Observable<HttpResponse<Epic[]>> {

    let params = new HttpParams().set('project_id', `eq.${projectId}`);
    
    if(offset !== undefined && limit !== undefined){
      params = params.set('limit', limit.toString())
            .set('offset', offset.toString())          
    }
    
    const headers = new HttpHeaders().set('Prefer', 'count=exact');

    return this._http.get<Epic[]>(`${this.baseUrl}${ApiEndpoints.GET_PROJECT_EPICS}`, {
      headers,
      params,
      observe: 'response', //to return all response (header + body)
    });
  }

  getEpicDetails(epicId: string, projectId: string): Observable<Epic[]> {
    const params = new HttpParams().set('id', `eq.${epicId}`)
                  .set('project_id', `eq.${projectId}`);

    return this._http.get<Epic[]>(`${this.baseUrl}${ApiEndpoints.GET_PROJECT_EPICS}`, {params: params});
  }

  editEpics(epicPayload: AddEpicPayload, epicId: string) {
    const params = new HttpParams().set('id', `eq.${epicId}`);
    return this._http.patch(`${this.baseUrl}${ApiEndpoints.ADD_EPIC}`, epicPayload, { params: params });
  }
}
