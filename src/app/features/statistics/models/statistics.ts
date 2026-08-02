export interface CalendarPayLoad{
    p_start_date:string,
    p_end_date:string ,
    p_project_id:string | null,
    p_status:string | null
}

export interface CalendarResponse{
    
  daily: [
    {
      day:string,
      statuses: {
        TO_DO ?: number,
        IN_PROGRESS? : number,
        BLOCKED ?: number,
        IN_REVIEW ?: number,
        READY_FOR_QA? : number,
        REOPENED? : number,
        READY_FOR_PRODUCTION? : number,
        DONE? : number

      }
    }
  ],
  totals: {
        TO_DO ?: number,
        IN_PROGRESS? : number,
        BLOCKED ?: number,
        IN_REVIEW ?: number,
        READY_FOR_QA? : number,
        REOPENED? : number,
        READY_FOR_PRODUCTION? : number,
        DONE? : number

    },
  total_tasks:number,
  done_tasks:number,
  overdue_tasks:number

}

export interface TasksCountPerProjectRes{
  project_id:string,
  project_name:string,
  tasks_count:number
}