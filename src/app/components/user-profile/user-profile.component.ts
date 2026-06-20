import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { UserDto, UserDtoForUpdate } from '../../models/user.model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink]
})
export class UserProfileComponent implements OnInit {
  user: UserDto | null = null;
  editForm!: FormGroup;
  isLoading = true;
  isSaving = false;
  isEditing = false;
  successMessage = '';
  errorMessage = '';

  private userId: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();

    if (!this.userId) {
      // لا يوجد userId في الـ Token → أعد التوجيه للـ Login
      this.router.navigate(['/login']);
      return;
    }

    this.editForm = this.fb.group({
      firstName:   ['', [Validators.required, Validators.minLength(2)]],
      lastName:    ['', [Validators.required, Validators.minLength(2)]],
      oldPassword: ['', Validators.required],
      newPassword: [''],
      photoUrl:    [''],
      adress:      ['']
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.userService.getUserById(this.userId!).subscribe({
      next: (user) => {
        this.user = user;
        this.editForm.patchValue({
          firstName: user.firstName,
          lastName:  user.lastName,
          photoUrl:  user.photoUrl ?? '',
          adress:    user.adress ?? ''
        });
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load profile data.';
        this.isLoading = false;
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';
    if (!this.isEditing) {
      // Cancel edit -> reload original values
      this.loadProfile();
    }
  }

  saveProfile(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.userService.updateUser(this.userId!, this.editForm.value as UserDtoForUpdate).subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditing = false;
        this.successMessage = 'Profile updated successfully! ✅';
        this.loadProfile();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage =
          err.status === 400
            ? 'Current password is incorrect or data is invalid.'
            : 'An error occurred while saving. Please try again.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get firstName() { return this.editForm.get('firstName')!; }
  get lastName()  { return this.editForm.get('lastName')!; }
  get oldPwd()    { return this.editForm.get('oldPassword')!; }
}
