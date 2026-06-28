import { inject, Injectable } from '@angular/core';
import { UserRegisterPayload } from '../models/user';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  baseUrl = environment.baseUrl;
  private _http = inject(HttpClient);

  Register(UserRegisterPayload: UserRegisterPayload) {
    return this._http.post(`${this.baseUrl}/auth/v1/signup`, UserRegisterPayload);
  }
}
