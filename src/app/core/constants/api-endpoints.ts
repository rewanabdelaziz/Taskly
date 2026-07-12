export const ApiEndpoints = {
  // AUTH
  SIGNUP: '/auth/v1/signup',
  LOGIN: '/auth/v1/token?grant_type=password',
  REFRESH_TOKEN: '/auth/v1/token?grant_type=refresh_token',
  LOGOUT: '/auth/v1/logout',
  USER: '/auth/v1/user',
  RECOVER_PASSWORD: '/auth/v1/recover',

  // projects
  GET_PROJECTS: '/rest/v1/rpc/get_projects',
  ADD_PROJECT: '/rest/v1/projects',
  MEMBERS: '/rest/v1/get_project_members',
} as const;
