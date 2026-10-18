import { Component, inject, afterNextRender, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GsapService } from '@/core/services/gsap.service';
import { HeroSection } from './sections/hero/hero';
import { BentoGridSection } from './sections/bento-grid/bento-grid';
import { MarqueeSection } from './sections/marquee/marquee';
import { StickyFooterSection } from './sections/sticky-footer/sticky-footer';
import { CustomCursor } from './shared/custom-cursor/custom-cursor';
import { MagneticButtonDirective } from '@/shared/directives/magnetic-button.directive';
import { CocottePotComponent } from '@/shared/components/culinary-art/cocotte-pot.component';

@Component({
  selector: 'app-landing',
  imports: [
    RouterLink,
    HeroSection,
    BentoGridSection,
    MarqueeSection,
    StickyFooterSection,
    CustomCursor,
    MagneticButtonDirective,
    CocottePotComponent,
  ],
  styleUrl: './landing.css',
  template: `
    <app-custom-cursor />

    <div class="page-wrapper">
      <header class="landing-header" role="banner">
        <a routerLink="/landing" class="brand-link" aria-label="Mijote — Accueil">
          <app-cocotte-pot [size]="34" [showSteam]="false" />
          <span class="brand-text">Mijote</span>
        </a>

        <nav class="landing-nav" aria-label="Navigation principale">
          <a routerLink="/landing" fragment="features" class="nav-link">Fonctionnalités</a>
          <a routerLink="/recipes" class="nav-link">Recettes</a>
        </nav>

        <div class="header-actions">
          @if (auth.isAuthenticated()) {
            <button
              type="button"
              class="header-login-btn"
              (click)="auth.logout()"
              appMagnetic
              [strength]="0.2"
            >
              Déconnexion
            </button>
          } @else {
            <a routerLink="/login" class="header-login-btn" appMagnetic [strength]="0.2">
              Connexion
            </a>
          }
        </div>
      </header>

      <div class="scroll-container">
        <main id="landing-content">
          <app-hero-section />
          <app-bento-grid-section />
          <app-marquee-section />
        </main>
      </div>

      <app-sticky-footer />
    </div>
  `,
})
export class Landing {
  protected readonly auth = inject(AuthService);
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      // Refresh ScrollTrigger calculations after all sub-components mount
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      this.destroyRef.onDestroy(() => {
        ScrollTrigger.getAll().forEach((st) => {
          st.kill();
        });
      });
    });
  }
}
