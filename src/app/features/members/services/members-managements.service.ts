import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEndpoints } from '../../../core/constants/api-endpoints';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Member } from '../models/members';


@Injectable({
  providedIn: 'root',
})
export class MembersManagementsService {
  private _http = inject(HttpClient);
  baseUrl = environment.baseUrl;

  getProjectMembers(projectId: string): Observable<Member[]> {
    const params = new HttpParams().set('project_id', `eq.${projectId}`);
    return this._http.get<Member[]>(`${this.baseUrl}${ApiEndpoints.MEMBERS}`, { params: params });
  }
}
