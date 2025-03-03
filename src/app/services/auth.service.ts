import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_URL = environment.baseUrl + '/auth';
  // Signal untuk menyimpan status autentikasi
  isAuthenticated = signal(false);

  constructor(private http: HttpClient) {
    this.checkAuth(); // Cek cookie pada inisialisasi
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials, {
      withCredentials: true,
    });
  }

  logout() {
    document.cookie =
      'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie =
      'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    this.isAuthenticated.set(false);
  }

  checkAuth() {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('access_token='))
      ?.split('=')[1];
    this.isAuthenticated.set(!!token);
  }
}
