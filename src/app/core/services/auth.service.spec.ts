import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { STORAGE_KEY } from '../models/user.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  it('starts logged out', () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.user()).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('logs in with matching valid credentials and persists the user', () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.login('abc1.', 'abc1.')).toBeNull();
    expect(auth.user()?.login).toBe('abc1.');
    expect(auth.isAuthenticated()).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).login).toBe('abc1.');
  });

  it('rejects invalid credentials', () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.login('abc', 'abc')).not.toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('rejects a password different from the login', () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.login('abc1.', 'abc2.')).not.toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('restores the user from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ login: 'abc1.' }));
    expect(TestBed.inject(AuthService).user()?.login).toBe('abc1.');
  });

  it('ignores corrupted storage', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
  });

  it('logs out, clears storage and goes to /login', () => {
    const auth = TestBed.inject(AuthService);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    auth.login('abc1.', 'abc1.');
    auth.logout();
    expect(auth.user()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
