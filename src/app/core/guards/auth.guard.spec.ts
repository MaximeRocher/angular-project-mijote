import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard, guestGuard } from './auth.guard';

describe('auth guards', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  function setup(authenticated: boolean) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => authenticated } },
      ],
    });
    return TestBed.inject(Router);
  }

  it('authGuard lets authenticated users through', () => {
    setup(true);
    expect(TestBed.runInInjectionContext(() => authGuard(route, state))).toBe(true);
  });

  it('authGuard redirects anonymous users to /login', () => {
    const router = setup(false);
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(router.serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe('/login');
  });

  it('guestGuard lets anonymous users through', () => {
    setup(false);
    expect(TestBed.runInInjectionContext(() => guestGuard(route, state))).toBe(true);
  });

  it('guestGuard redirects authenticated users to /home', () => {
    const router = setup(true);
    const result = TestBed.runInInjectionContext(() => guestGuard(route, state));
    expect(router.serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe('/home');
  });
});
