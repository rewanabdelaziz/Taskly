export enum ApiEndponts{
    SIGNUP = "/auth/v1/signup",
    LOGIN = "/auth/v1/token?grant_type=password",
    REFRESH_TOKEN ="/auth/v1/token?grant_type=refresh_token",
    LOGOUT= "/auth/v1/logout",
    GET_USER = "/auth/v1/user",
    RECOVER_PASSWORD = "/auth/v1/recover",
    ADD_PROJECT = "/rest/v1/projects",
    RESET_PASSWORD = "/auth/v1/user"
}