import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { AddTaskPayload, Status, Task } from '../models/task';
import { ApiEndpoints } from '../../../core/constants/api-endpoints';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TasksManagementService {
  private _http = inject(HttpClient);
  baseUrl = environment.baseUrl;
  
  addNewTask(epicPayload: AddTaskPayload) {
    return this._http.post(`${this.baseUrl}${ApiEndpoints.ADD_TASK}`, epicPayload);
  }
   
  getProjectTasksbyEpicId(epicId:string):Observable<Task[]>{
    const params = new HttpParams().set('epic_id', `eq.${epicId}`);

    return this._http.get<Task[]>(`${this.baseUrl}${ApiEndpoints.GET_PROJECT_TASK}`,{params})
  }

  getProjectTasksbyStatus(projId:string, status?:Status):Observable<Task[]>{
    let params = new HttpParams().set('project_id', `eq.${projId}`);
    
    if(status){
      params = params.set('status',`eq.${status}`)
    }
    return this._http.get<Task[]>(`${this.baseUrl}${ApiEndpoints.GET_PROJECT_TASK}`, {params});
  
  }
  
}
