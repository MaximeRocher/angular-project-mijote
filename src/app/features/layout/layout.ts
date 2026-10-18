import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-layout',
  imports: [Navbar, RouterOutlet, RouterLink],
  styleUrl: './layout.css',
  template: `
    <a class="skip" routerLink="." fragment="content">Aller au contenu</a>
    <app-navbar />
    <main id="content" tabindex="-1" #main>
      <router-outlet />
    </main>
  `,
})
export class Layout {
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  constructor() {
    // Move keyboard/screen-reader focus to the new page after each navigation
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.main().nativeElement.focus({ preventScroll: true }));
  }
}
