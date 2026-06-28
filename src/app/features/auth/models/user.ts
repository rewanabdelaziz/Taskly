export interface UserRegisterPayload {
  email: string;
  password: string;
  data: {
    name: string;
    department?: string;
  };
}
export interface UserLoginPayload {
  email: string;
  password: string;
}
