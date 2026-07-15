export interface AddEpicPayload {
  title: string;
  description: string;
  assignee_id: string; //userId
  project_id: string;
  deadline: string;
}

export interface Epic {
  id: string; //uuid
  epic_id: string;
  title: string;
  description: string;
  deadline: string;
  created_at: string;
  created_by: {
    sub: string,  //uuid
	name: string,
	email: string,
	department: string
  }
  assignee: {
    sub: string,  //uuid
	name: string,
	email: string,
	department: string
  }
  
}