import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { axeViolations } from '../../../testing-a11y';
import { Navbar } from './navbar';

describe('Navbar accessibility', () => {
  it('has no axe violations', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user: () => ({ login: 'abc1.' }), logout: () => undefined } },
      ],
    });
    const fixture = TestBed.createComponent(Navbar);
    await fixture.whenStable();
    expect(await axeViolations(fixture)).toEqual([]);
  });
});
