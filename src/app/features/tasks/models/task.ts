export enum Status {
    TO_DO = "TO_DO",
    IN_PROGRESS = "IN_PROGRESS",
    BLOCKED = "BLOCKED",
    IN_REVIEW = "IN_REVIEW",
    READY_FOR_QA = "READY_FOR_QA",
    REOPENED = "REOPENED",
    READY_FOR_PRODUCTION = "READY_FOR_PRODUCTION",
    DONE = "DONE"
}

export interface AddTaskPayload{
	project_id: string,
	epic_id?: string,
	title: string,
	description?: string,
	assignee_id?:string,
	due_date?: string,
	status: Status
}

export interface Task{
    id: string,
    project_id: string,
    epic_id: string,
    title: string,
    description: string | null,
    status: Status,
    created_at: string,
    due_date: string | null,
    task_id: string,
        epic: {
            id: string,
            title: string,
            epic_id: string
        },
        created_by: {
            id: string,
            name: string,
            email: string,
            department: string
        },
        assignee: {
            id: string| null,
            name: string | null,
            email: string |null,
            department: string | null
        }
    
}