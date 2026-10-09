import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Navbar } from './navbar';

describe('Navbar', () => {
  const logout = vi.fn();

  async function render() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user: () => ({ login: 'abc1.' }), logout } },
      ],
    });
    const fixture = TestBed.createComponent(Navbar);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the user login and the navigation links', async () => {
    const el = await render();
    expect(el.textContent).toContain('abc1.');
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBeTruthy();
    const links = Array.from(el.querySelectorAll('nav a')).map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/home', '/recipes']);
  });

  it('logs out when clicking the button', async () => {
    const el = await render();
    el.querySelector<HTMLButtonElement>('button')!.click();
    expect(logout).toHaveBeenCalled();
  });
});
