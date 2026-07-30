export interface Member {
  member_id: string;
  project_id: string;
  user_id: string;
  role: string;
  email: string;
  metadata: {
    name: string;
    email: string;
    department: string;
  };
}

export interface InviteMemberPayload{
  p_email: string,
  p_project_id: string,
  p_app_url: string,
  p_base_url: string
}

export interface AcceptInvitationPayload{
  p_token: string
}
