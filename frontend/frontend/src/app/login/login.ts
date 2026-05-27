import { Component } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { AuthService } from '../services/auth';

import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})

export class Login {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router 
  ) {

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  onSubmit(): void {

  if (this.loginForm.invalid) {
    return;
  }

  this.authService
    .login(this.loginForm.value)
    .subscribe({

      next: (response: any) => {

  localStorage.setItem(
    'token',
    response.token
  );

  localStorage.setItem(
    'user',
    JSON.stringify(response.user)
  );

  this.router.navigate(['/dashboard']);
},

      error: (error) => {

        console.log(error);
      }
    });
}
}