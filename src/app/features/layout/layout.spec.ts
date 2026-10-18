import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { Layout } from './layout';
import { AuthService } from '@/core/services/auth.service';
import { provideAppIcons } from '@/core/icons';
import { axeViolations } from '@/testing-a11y';

@Component({ template: '<h1>Page</h1>' })
class Page {}

describe('Layout', () => {
  async function setup() {
    TestBed.configureTestingModule({
      imports: [Layout],
      providers: [
        provideRouter([
          { path: 'a', component: Page },
          { path: 'b', component: Page },
        ]),
        provideAppIcons(),
        {
          provide: AuthService,
          useValue: { user: () => ({ login: 'abc1.' }), logout: () => undefined },
        },
      ],
    });
    const fixture = TestBed.createComponent(Layout);
    await TestBed.inject(Router).navigateByUrl('/a');
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('moves focus to <main> after each navigation', async () => {
    const fixture = await setup();
    const main = (fixture.nativeElement as HTMLElement).querySelector('main') as HTMLElement;
    document.body.appendChild(fixture.nativeElement);
    (document.activeElement as HTMLElement | null)?.blur();

    await TestBed.inject(Router).navigateByUrl('/b');
    fixture.detectChanges();

    expect(document.activeElement).toBe(main);
    fixture.nativeElement.remove();
  });

  it('offers a skip link targeting the main content', async () => {
    const fixture = await setup();
    const skip = (fixture.nativeElement as HTMLElement).querySelector('a.skip');
    expect(skip?.getAttribute('href')).toContain('#content');
  });

  it('has no axe violations', async () => {
    expect(await axeViolations(await setup())).toEqual([]);
  });
});
