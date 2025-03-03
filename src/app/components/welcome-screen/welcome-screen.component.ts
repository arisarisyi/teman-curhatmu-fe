import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-welcome-screen',
  imports: [],
  templateUrl: './welcome-screen.component.html',
  styleUrl: './welcome-screen.css',
})
export class WelcomeScreenComponent implements OnInit {
  ngOnInit(): void {
    this.getUsername();
  }
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);

  private getAccessToken() {
    return this.cookieService.get('access_token');
  }

  baseUrl = environment.baseUrl;

  username = '';

  private getUsername() {
    this.http
      .get<any>(`${this.baseUrl}/auth/self`, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          console.log(response.data);
          const newMessages = response.data; // Array pesan dari API
          console.log('Messages from API:', newMessages);
          this.username = newMessages.username;
        },
      });
  }
}
