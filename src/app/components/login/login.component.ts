import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <form [formGroup]="loginForm" class="login-form">
      <div class="input-group">
        <label for="username">Username</label>
        <input
          type="text"
          id="username"
          formControlName="username"
          placeholder="Enter your username"
          required
        />
        @if (loginForm.get('username')?.invalid &&
        loginForm.get('username')?.touched) {
        <div class="error-message">Username is required</div>
        }
      </div>
      <div class="input-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          formControlName="password"
          placeholder="Enter your password"
          required
        />
      </div>
      <button type="submit" class="login-btn" (click)="onSubmit()">
        Login
      </button>
    </form>
    <div class="footer">
      <p>
        Don't have an account?
        <a (click)="changeToRegister()" style="cursor:pointer;">Sign up here</a>
      </p>
    </div>
  `,
  styles: `
  .login-form {
  display: flex;
  flex-direction: column;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  font-size: 14px;
  margin-bottom: 5px;
  color: #ff9999;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: #2c2c2c;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.input-group input:focus {
  outline: none;
  background-color: #3c3c3c;
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
}

.login-btn {
  background: linear-gradient(145deg, #ff4d4d, #ff6666);
  border: none;
  border-radius: 5px;
  padding: 10px;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: linear-gradient(145deg, #ff6666, #ff4d4d);
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
}

.footer {
  margin-top: 20px;
  font-size: 14px;
}

.footer a {
  color: #ff9999;
  text-decoration: none;
  transition: all 0.3s ease;
}

.footer a:hover {
  color: #ff4d4d;
}`,
})
export class LoginComponent {
  loginForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.authService.logout();
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  isLoading = false;
  errorMessage = '';

  isRegister = output();

  changeToRegister() {
    this.isRegister.emit();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        // Login sukses: update status dan arahkan ke /chatbot
        this.authService.isAuthenticated.set(true);
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        // Login gagal: tampilkan popup error
        this.isLoading = false;
        const errorMsg =
          err.error?.message || 'Login failed. Please try again.';
        this.dialog.open(ErrorDialogComponent, {
          data: { message: errorMsg },
        });
      },
    });
  }
}
