import {
  Component,
  ElementRef,
  inject,
  afterNextRender,
  DestroyRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { GsapService } from '@/core/services/gsap.service';
import { MagneticButtonDirective } from '../../shared/magnetic-button.directive';

@Component({
  selector: 'app-sticky-footer',
  imports: [RouterLink, MagneticButtonDirective],
  styleUrl: './sticky-footer.css',
  template: `
    <footer class="sticky-footer" role="contentinfo" aria-label="Pied de page">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="footer-brand">
            <span class="footer-logo" aria-hidden="true">🍲</span>
            <span class="footer-name">Mijote</span>
          </div>

          <p class="footer-tagline">
            La cuisine faite maison, sublimée au quotidien. Partagez, créez et savourez chaque recette.
          </p>

          <a routerLink="/login" class="footer-cta" appMagnetic [strength]="0.25">
            <span>Rejoindre la communauté</span>
            <svg class="cta-arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </a>
        </div>

        <div class="footer-divider"></div>

        <div class="footer-bottom">
          <nav class="footer-nav" aria-label="Navigation du pied de page">
            <a routerLink="/landing">Accueil</a>
            <a href="#features">Fonctionnalités</a>
            <a routerLink="/login">Connexion</a>
            <a routerLink="/recipes">Recettes</a>
          </nav>

          <p class="footer-copy">
            &copy; {{ currentYear }} Mijote. Tous droits réservés. Conçu avec amour et passion culinaire.
          </p>
        </div>
      </div>
    </footer>
  `,
})
export class StickyFooterSection {
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly el = inject(ElementRef);

  protected readonly currentYear = new Date().getFullYear();

  constructor() {
    afterNextRender(() => {
      if (this.gsapService.prefersReducedMotion()) return;

      const footerEl = this.el.nativeElement as HTMLElement;
      const innerEl = footerEl.querySelector('.footer-inner') as HTMLElement;
      if (!innerEl) return;

      const ctx = this.gsapService.createContext(footerEl);
      ctx.add(() => {
        gsap.from(innerEl, {
          y: 60,
          opacity: 0.4,
          ease: 'none',
          scrollTrigger: {
            trigger: footerEl,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 0.5,
          },
        });
      });

      this.destroyRef.onDestroy(() => {
        this.gsapService.cleanupContext(ctx);
      });
    });
  }
}
