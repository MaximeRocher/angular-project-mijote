import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { axeViolations } from '../../testing-a11y';
import { Login } from './login';

describe('Login accessibility', () => {
  it('has no axe violations', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    expect(await axeViolations(fixture)).toEqual([]);
  });
});
