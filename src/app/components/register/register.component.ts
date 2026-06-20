import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

/** Custom Validator: تطابق كلمتَي المرور */
function passwordMatchValidator(control: AbstractControl) {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^[0-9]{10,15}$/)]],
      roles: [['User']],  // الدور الافتراضي
      password: ['', [Validators.required, Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  // Getters للـ Template
  get firstName() { return this.registerForm.get('firstName')!; }
  get lastName() { return this.registerForm.get('lastName')!; }
  get userName() { return this.registerForm.get('userName')!; }
  get email() { return this.registerForm.get('email')!; }
  get phone() { return this.registerForm.get('phoneNumber')!; }
  get password() { return this.registerForm.get('password')!; }
  get confirmPwd() { return this.registerForm.get('confirmPassword')!; }

  togglePassword(): void { this.showPassword = !this.showPassword; }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    console.log("Roles being sent:", this.registerForm.value.roles || ["User"]);
    // هنا بنبني الـ Object بالكامل وبنضيف الـ photoUrl والـ adress عشان الـ .NET ميزعلش
    const payload = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      userName: this.registerForm.value.userName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      phoneNumber: this.registerForm.value.phoneNumber || "",
      roles: this.registerForm.value.roles || ["User"],
      photoUrl: "",
      adress: ""
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Redirecting to sign in...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 400 && err.error?.errors) {
          // ASP.NET Identity validation errors
          const messages: string[] = Object.values(err.error.errors).flat() as string[];
          this.errorMessage = messages.join(' — ');
        } else if (err.status === 409) {
          this.errorMessage = 'Email address or username is already in use.';
        } else {
          this.errorMessage = 'An error occurred during registration. Please try again.';
        }
      }
    });
  }
}