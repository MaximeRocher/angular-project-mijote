import {
  Component,
  ElementRef,
  inject,
  afterNextRender,
  DestroyRef,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { GsapService } from '@/core/services/gsap.service';
import { TextRevealDirective } from '../../shared/text-reveal.directive';
import { MagneticButtonDirective } from '../../shared/magnetic-button.directive';

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink, TextRevealDirective, MagneticButtonDirective],
  styleUrl: './hero.css',
  template: `
    <section #heroSection class="hero" aria-label="Présentation de Mijote">
      <div class="hero-content">
        <div class="badge-pill">
          <span class="badge-dot"></span>
          Expérience culinaire réinventée
        </div>

        <h1
          appTextReveal
          [triggerOnScroll]="false"
          [stagger]="0.06"
          [duration]="0.8"
          [ease]="'power4.out'"
        >
          Cuisinez avec passion, partagez avec plaisir
        </h1>

        <p #subtitle class="subtitle">
          Mijote transforme vos recettes en véritables expériences.
          Organisez vos créations, explorez de nouvelles saveurs et cuisinez à votre rythme.
        </p>

        <div #ctaWrap class="cta-wrap">
          <a routerLink="/login" class="cta-primary" appMagnetic [strength]="0.25">
            <span>Commencer à cuisiner</span>
            <svg class="cta-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </a>
          <a href="#features" class="cta-secondary" appMagnetic [strength]="0.2">
            Découvrir les fonctionnalités
          </a>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <!-- Parallax layers -->
        <div #layerBg class="parallax-layer layer-bg">
          <div class="glow-orb"></div>
          <div class="pattern-grid"></div>
        </div>

        <div #layerMid class="parallax-layer layer-mid">
          <div class="floating-badge badge-1">
            <span class="badge-emoji">🌿</span>
            <span class="badge-text">100% Fait Maison</span>
          </div>
          <div class="floating-badge badge-2">
            <span class="badge-emoji">⏱️</span>
            <span class="badge-text">Prêt en 25 min</span>
          </div>
          <div class="floating-item item-tomato">🍅</div>
          <div class="floating-item item-garlic">🧄</div>
        </div>

        <div #layerFg class="parallax-layer layer-fg">
          <div #pot class="cooking-pot-container">
            <div class="pot-glow"></div>
            <div class="pot-asset">🍲</div>
          </div>
          <div class="floating-item item-spoon">🥄</div>
          <div class="floating-item item-pepper">🌶️</div>
        </div>
      </div>
    </section>
  `,
})
export class HeroSection {
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly heroSection = viewChild.required<ElementRef>('heroSection');
  private readonly subtitle = viewChild.required<ElementRef>('subtitle');
  private readonly ctaWrap = viewChild.required<ElementRef>('ctaWrap');
  private readonly pot = viewChild.required<ElementRef>('pot');
  private readonly layerBg = viewChild.required<ElementRef>('layerBg');
  private readonly layerMid = viewChild.required<ElementRef>('layerMid');
  private readonly layerFg = viewChild.required<ElementRef>('layerFg');

  constructor() {
    afterNextRender(() => {
      if (this.gsapService.prefersReducedMotion()) {
        return;
      }

      this.createEntryTimeline();
      this.createParallax();
    });
  }

  private createEntryTimeline(): void {
    const heroEl = this.heroSection().nativeElement as HTMLElement;
    const subtitleEl = this.subtitle().nativeElement as HTMLElement;
    const ctaEl = this.ctaWrap().nativeElement as HTMLElement;
    const potEl = this.pot().nativeElement as HTMLElement;
    const badges = heroEl.querySelectorAll('.floating-badge');
    const items = heroEl.querySelectorAll('.floating-item');

    const ctx = this.gsapService.createContext(heroEl);
    ctx.add(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Subtitle fade and slide in
      tl.from(
        subtitleEl,
        {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: 'expo.out',
        },
        0.5,
      );

      // CTA buttons scale in
      tl.from(
        Array.from(ctaEl.children),
        {
          scale: 0.85,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.7)',
        },
        0.7,
      );

      // Cooking pot entry with smooth elastic bounce
      tl.from(
        potEl,
        {
          x: 80,
          y: 30,
          opacity: 0,
          scale: 0.6,
          duration: 1.1,
          ease: 'elastic.out(1, 0.45)',
        },
        0.8,
      );

      // Floating badges
      tl.from(
        Array.from(badges),
        {
          opacity: 0,
          scale: 0.5,
          y: 20,
          duration: 0.6,
          stagger: 0.15,
          ease: 'back.out(1.8)',
        },
        1.0,
      );

      // Floating ingredients
      tl.from(
        Array.from(items),
        {
          opacity: 0,
          scale: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(2)',
        },
        1.1,
      );

      // Continuous gentle floating animation on the pot
      gsap.to(potEl, {
        y: '-=12',
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.8,
      });
    });

    this.destroyRef.onDestroy(() => {
      this.gsapService.cleanupContext(ctx);
    });
  }

  private createParallax(): void {
    const heroEl = this.heroSection().nativeElement as HTMLElement;
    const bgEl = this.layerBg().nativeElement as HTMLElement;
    const midEl = this.layerMid().nativeElement as HTMLElement;
    const fgEl = this.layerFg().nativeElement as HTMLElement;

    const mm = this.gsapService.matchMedia();

    mm.add('(min-width: 768px)', () => {
      gsap.to(bgEl, {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: heroEl,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });

      gsap.to(midEl, {
        y: -140,
        ease: 'none',
        scrollTrigger: {
          trigger: heroEl,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });

      gsap.to(fgEl, {
        y: -220,
        ease: 'none',
        scrollTrigger: {
          trigger: heroEl,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
    });

    this.destroyRef.onDestroy(() => {
      mm.revert();
    });
  }
}
