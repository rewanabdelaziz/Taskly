const AUTH_BASE = '/auth/v1';
const REST_BASE = '/rest/v1';

export const ApiEndpoints = {
  // AUTH
  SIGNUP: `${AUTH_BASE}/signup`,
  LOGIN: `${AUTH_BASE}/token?grant_type=password`,
  REFRESH_TOKEN: `${AUTH_BASE}/token?grant_type=refresh_token`,
  LOGOUT: `${AUTH_BASE}/logout`,
  USER: `${AUTH_BASE}/user`,
  RECOVER_PASSWORD: `${AUTH_BASE}/recover`,

  // projects
  GET_PROJECTS: `${REST_BASE}/rpc/get_projects`,
  ADD_PROJECT: `${REST_BASE}/projects`,
  
  // members
  MEMBERS: `${REST_BASE}/get_project_members`,  

  // epics
  GET_PROJECT_EPICS: `${REST_BASE}/project_epics`,
  ADD_EPIC: `${REST_BASE}/epics`,

} as const;
