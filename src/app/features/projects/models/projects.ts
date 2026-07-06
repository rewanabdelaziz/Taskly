export interface AddProjectPayload {
  name: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
}
