import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink]
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.forgotForm.get('email')!; }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.email.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage =
          'A password reset link has been sent to your email address. Please check your inbox.';
        this.forgotForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.status === 404
            ? 'This email address is not registered in our system.'
            : 'An error occurred. Please try again later.';
      }
    });
  }
}
