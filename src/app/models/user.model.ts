export interface UserForRegistrationDto {
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
  email: string;
  phoneNumber?: string;
  roles?: string[];
  photoUrl?: string;
  adress?: string;
}

export interface UserForLoginDto {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface TokenDto {
  accessToken: string;
  refreshToken: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  adress?: string;
}

export interface UserDtoForUpdate {
  firstName: string;
  lastName: string;
  oldPassword: string;
  newPassword?: string;
  photoUrl?: string;
  adress?: string;
}
