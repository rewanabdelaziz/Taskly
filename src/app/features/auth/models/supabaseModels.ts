import { UserMetaData } from './user';

export interface LoginResponse {
  access_token: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: {
    id: string;
    user_metadata: UserMetaData;
  };
}
