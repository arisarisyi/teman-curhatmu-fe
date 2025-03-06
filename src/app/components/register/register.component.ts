import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  DialogData,
  RegisterDialogComponent,
} from '../register-dialog/register-dialog.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  template: `<form
      [formGroup]="registerForm"
      (ngSubmit)="onSubmit()"
      class="login-form"
    >
      <div class="input-group">
        <label for="username">Username</label>
        <input
          type="text"
          id="username"
          formControlName="username"
          placeholder="Enter your username"
          required
        />
        @if (registerForm.get('username')?.invalid &&
        registerForm.get('username')?.touched) {
        <div class="error-message">Username is required</div>
        }
      </div>
      <div class="input-group">
        <label for="email">Email</label>
        <input
          type="text"
          id="email"
          placeholder="example@gmail.com"
          formControlName="email"
          required
        />
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
      <button type="submit" class="login-btn">Register</button>
    </form>
    <div class="footer">
      <p>
        Have an account?
        <a (click)="isLogin.emit()" style="cursor:pointer;">Login here</a>
      </p>
    </div>`,
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);

  registerForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  baseUrl = environment.baseUrl;

  isLoading = false;
  errorMessage = '';

  isLogin = output();

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.http
      .post(`${this.baseUrl}/auth/register`, this.registerForm.value)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.openDialog(
            'Register Successful',
            'Your account has been created successfully.',
            true
          );
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Register failed';
          this.isLoading = false;
          // Buka dialog error dengan pesan dari response
          const errorMsg = err.error.message || 'Register failed';
          this.openDialog('Register Failed', errorMsg, false);
        },
      });
  }

  openDialog(title: string, message: string, success: boolean): void {
    const dialogRef = this.dialog.open(RegisterDialogComponent, {
      width: '300px',
      data: { title, message, success } as DialogData,
    });

    dialogRef.afterClosed().subscribe(() => {
      // Jika sukses, trigger event isLogin untuk pindah ke login component
      if (success) {
        this.isLogin.emit();
      }
    });
  }
}
