import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenServiceService {
  setToken(tokenName: string, tokenValue: string) {
    localStorage.setItem(tokenName, tokenValue);
  }

  getToken(tokenName: string) {
    return localStorage.getItem(tokenName);
  }
}
