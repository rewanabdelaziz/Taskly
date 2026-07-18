import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AddTaskPayload, Task } from '../models/task';
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
}
