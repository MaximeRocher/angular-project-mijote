import { NgOptimizedImage } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  afterNextRender,
  DestroyRef,
  viewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { gsap } from 'gsap';
import { AuthService } from '../../../core/services/auth.service';
import { GsapService } from '@/core/services/gsap.service';
import { MagneticButtonDirective } from '@/shared/directives/magnetic-button.directive';

@Component({
  selector: 'app-navbar',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, MagneticButtonDirective],
  styleUrl: './navbar.css',
  template: `
    <header class="bar">
      <a class="brand" routerLink="/home">
        <img ngSrc="images/cooking-pot.webp" width="55" height="56" alt="" />
        <span>Mijote</span>
      </a>

      <nav aria-label="Navigation principale" #navRef>
        <div class="nav-indicator" #indicator aria-hidden="true"></div>
        <ul>
          <li>
            <a routerLink="/home" routerLinkActive="active" ariaCurrentWhenActive="page">
              Accueil
            </a>
          </li>
          <li>
            <a routerLink="/recipes" routerLinkActive="active" ariaCurrentWhenActive="page">
              Recettes
            </a>
          </li>
        </ul>
      </nav>

      <div class="user">
        <span>{{ auth.user()?.login }}</span>
        <button type="button" (click)="auth.logout()" appMagnetic [strength]="0.2">
          Se déconnecter
        </button>
      </div>
    </header>
  `,
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router, { optional: true });
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly navRef = viewChild<ElementRef>('navRef');
  private readonly indicator = viewChild<ElementRef>('indicator');

  constructor() {
    afterNextRender(() => {
      const navEl = this.navRef()?.nativeElement as HTMLElement;
      const indicatorEl = this.indicator()?.nativeElement as HTMLElement;
      if (!navEl || !indicatorEl) return;

      const updateIndicator = (animate = true) => {
        const activeLink = navEl.querySelector('a.active') as HTMLElement;
        if (!activeLink) {
          gsap.to(indicatorEl, { opacity: 0, duration: 0.2 });
          return;
        }

        const navRect = navEl.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        const targetX = linkRect.left - navRect.left;
        const targetWidth = linkRect.width;

        if (!animate || this.gsapService.prefersReducedMotion()) {
          gsap.set(indicatorEl, { x: targetX, width: targetWidth, opacity: 1 });
        } else {
          gsap.to(indicatorEl, {
            x: targetX,
            width: targetWidth,
            opacity: 1,
            duration: 0.35,
            ease: 'power3.out',
          });
        }
      };

      updateIndicator(false);

      if (this.router) {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const sub = this.router.events
          .pipe(filter((e) => e instanceof NavigationEnd))
          .subscribe(() => {
            clearTimeout(timer);
            timer = setTimeout(() => updateIndicator(true), 25);
          });

        this.destroyRef.onDestroy(() => {
          sub.unsubscribe();
          clearTimeout(timer);
        });
      }
    });
  }
}
