import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserForRegistrationDto, UserForLoginDto, TokenDto } from '../models/user.model';

const BASE_URL = 'https://localhost:44395/api';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ROLE_KEY = 'user_role';
const USER_ID_KEY = 'user_id';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${BASE_URL}/authentication`;

  constructor(private http: HttpClient) {}

  // ─── API Calls ────────────────────────────────────────────────────────────

  register(dto: UserForRegistrationDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, dto);
  }

  login(dto: UserForLoginDto): Observable<TokenDto> {
    return this.http.post<TokenDto>(`${this.apiUrl}/login`, dto).pipe(
      tap((tokenDto) => this.storeTokens(tokenDto))
    );
  }

  refreshToken(token: TokenDto): Observable<TokenDto> {
    return this.http.post<TokenDto>(`${this.apiUrl}/refresh`, token);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }

  // ─── Token & Session Management ───────────────────────────────────────────

  storeTokens(tokenDto: TokenDto): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokenDto.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokenDto.refreshToken);

    // استخراج Role و UserId من الـ JWT payload
    const payload = this.decodePayload(tokenDto.accessToken);
    if (payload) {
      const role =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        payload['role'] ?? null;
      const userId =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
        payload['sub'] ?? null;

      if (role) localStorage.setItem(USER_ROLE_KEY, role);
      if (userId) localStorage.setItem(USER_ID_KEY, userId);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getUserRole(): string | null {
    return localStorage.getItem(USER_ROLE_KEY);
  }

  /** يرجع UserId المخزن من الـ JWT — يُستخدم في User Profile */
  getUserId(): string | null {
    return localStorage.getItem(USER_ID_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(USER_ID_KEY);
  }

  // ─── JWT Helpers ─────────────────────────────────────────────────────────

  private decodePayload(token: string): Record<string, any> | null {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodePayload(token);
      const exp: number = payload?.['exp'];
      if (!exp) return false;
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }
}
