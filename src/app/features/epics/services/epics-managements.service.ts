import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/constants/api-endpoints';
import { Observable } from 'rxjs';
import { AddEpicPayload, Epic } from '../models/epics';


@Injectable({
  providedIn: 'root'
})
export class EpicsManagementsService {

  private _http = inject(HttpClient);
  baseUrl = environment.baseUrl;

  addNewEpics(epicPayload: AddEpicPayload) {
    return this._http.post(`${this.baseUrl}${ApiEndpoints.ADD_EPIC}`, epicPayload);
  }

  getAllEpics(offset: number, limit: number): Observable<HttpResponse<Epic[]>> {
    const params = new HttpParams().set('limit', limit.toString()).set('offset', offset.toString());

    const headers = new HttpHeaders().set('Prefer', 'count=exact');

    return this._http.get<Epic[]>(`${this.baseUrl}${ApiEndpoints.GET_PROJECT_EPICS}`, {
      headers,
      params,
      observe: 'response', //to return all response (header + body)
    });
  }

  editEpics(epicPayload: AddEpicPayload, epicId: string) {
    const params = new HttpParams().set('id', `eq.${epicId}`);
    return this._http.patch(`${this.baseUrl}${ApiEndpoints.ADD_EPIC}`, epicPayload, { params: params });
  }
}
