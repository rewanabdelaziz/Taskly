import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/constants/api-endpoints';
import { CalendarPayLoad, CalendarResponse, TasksCountPerProjectRes } from '../models/statistics';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

   private _http = inject(HttpClient);
  baseUrl = environment.baseUrl;


   getCalendar(startDate: string, endDate: string , projectId: string | null = null , status: string | null = null) : Observable<CalendarResponse> {
    const params: CalendarPayLoad = {
      "p_start_date":startDate,
      "p_end_date":endDate,
      "p_project_id":projectId,
      "p_status": status
    
    }

    return this._http.post<CalendarResponse>(`${this.baseUrl}${ApiEndpoints.CALENDAR}`,params);
   }

  getTasksCountPerProject(startDate: string, endDate: string): Observable<TasksCountPerProjectRes[]>{
    const params = {
      "p_start_date":startDate,
      "p_end_date":endDate,
    }
    return this._http.post<TasksCountPerProjectRes[]>(`${this.baseUrl}${ApiEndpoints.TASKS_COUNT_PER_PROJECT}`,params);
  }
  
}
