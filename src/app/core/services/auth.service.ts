import { computed, inject, signal, Service } from '@angular/core';
import { Router } from '@angular/router';
import { STORAGE_KEY, User } from '../models/user.model';
import { credentialError } from '../validators/credential.validator';

@Service()
export class AuthService {
  private readonly router = inject(Router);
  private readonly _user = signal<User | null>(this.readStoredUser());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  /** Logs the user in and persists them. Returns an error message on failure. */
  login(login: string, password: string): string | null {
    const error = credentialError(login) ?? credentialError(password);
    if (error) {
      return error;
    }
    if (login !== password) {
      return 'Le login et le mot de passe doivent être identiques';
    }
    const user: User = { login, loggedInAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._user.set(user);
    return null;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._user.set(null);
    void this.router.navigate(['/login']);
  }

  private readStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'login' in parsed &&
        typeof parsed.login === 'string'
      ) {
        return parsed as User;
      }
    } catch {
      // corrupted storage: treat as logged out
    }
    return null;
  }
}
