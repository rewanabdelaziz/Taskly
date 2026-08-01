import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEndpoints } from '../../../core/constants/api-endpoints';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { AcceptInvitationPayload, InviteMemberPayload, Member } from '../models/members';


@Injectable({
  providedIn: 'root',
})
export class MembersManagementsService {
  private _http = inject(HttpClient);
  baseUrl = environment.baseUrl;
  appUrl = environment.app_url;

  getProjectMembers(projectId: string): Observable<Member[]> {
    const params = new HttpParams().set('project_id', `eq.${projectId}`);
    return this._http.get<Member[]>(`${this.baseUrl}${ApiEndpoints.MEMBERS}`, { params: params });
  }

  inviteMember(email:string,project_id:string){
    const payload:InviteMemberPayload = {
      p_email : email,
      p_project_id : project_id,
      // p_app_url : this.appUrl,
      p_app_url : "http://localhost:4200",
      p_base_url : this.baseUrl
    }
    return this._http.post<Member[]>(`${this.baseUrl}${ApiEndpoints.INVITE_MEMBER}`,  payload );
  }

  acceptInvitation(token:string){
    const payload:AcceptInvitationPayload ={
      p_token : token
    }
    return this._http.post<Member[]>(`${this.baseUrl}${ApiEndpoints.ACCEPT_INVITATION}`,  payload );
  }
}
