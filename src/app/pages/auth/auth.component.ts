import { Component } from '@angular/core';
import { NgxAuroraComponent } from '@omnedia/ngx-aurora';
import { LoginComponent } from '../../components/login/login.component';
import { RegisterComponent } from '../../components/register/register.component';

@Component({
  selector: 'app-auth',
  imports: [NgxAuroraComponent, LoginComponent, RegisterComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.css',
})
export class AuthComponent {
  switchTombol = true;

  switchForm() {
    this.switchTombol = !this.switchTombol;
  }
}
