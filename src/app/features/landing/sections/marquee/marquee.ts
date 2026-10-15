import {
  Component,
  ElementRef,
  inject,
  afterNextRender,
  DestroyRef,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GsapService } from '@/core/services/gsap.service';

@Component({
  selector: 'app-marquee-section',
  styleUrl: './marquee.css',
  template: `
    <section class="marquee-section" aria-hidden="true">
      <div #track class="marquee-track">
        <span class="marquee-text">
          Mijote · Cuisiner · Partager · Savourer · Découvrir · Créer · Déguster · Inspirer ·&nbsp;
        </span>
        <span class="marquee-text">
          Mijote · Cuisiner · Partager · Savourer · Découvrir · Créer · Déguster · Inspirer ·&nbsp;
        </span>
        <span class="marquee-text">
          Mijote · Cuisiner · Partager · Savourer · Découvrir · Créer · Déguster · Inspirer ·&nbsp;
        </span>
        <span class="marquee-text">
          Mijote · Cuisiner · Partager · Savourer · Découvrir · Créer · Déguster · Inspirer ·&nbsp;
        </span>
      </div>
    </section>
  `,
})
export class MarqueeSection {
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly track = viewChild.required<ElementRef>('track');

  constructor() {
    afterNextRender(() => {
      if (this.gsapService.prefersReducedMotion()) return;

      const trackEl = this.track().nativeElement as HTMLElement;
      if (!trackEl) return;
      const texts = trackEl.querySelectorAll('.marquee-text');
      if (!texts.length) return;

      const sectionEl = trackEl.closest('section');
      if (!sectionEl) return;

      const ctx = this.gsapService.createContext(sectionEl);
      ctx.add(() => {
        const singleWidth = (texts[0] as HTMLElement).offsetWidth || 1200;

        const tl = gsap.timeline({
          repeat: -1,
          defaults: { ease: 'none' },
        });

        tl.to(trackEl, {
          x: -singleWidth,
          duration: Math.max(12, singleWidth / 80),
        });

        // Modulate timeScale based on scroll velocity
        const scrollTrigger = ScrollTrigger.create({
          trigger: sectionEl,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const velocity = Math.abs(self.getVelocity());
            const targetScale = gsap.utils.clamp(1, 3.5, 1 + velocity / 900);
            gsap.to(tl, {
              timeScale: targetScale,
              duration: 0.7,
              ease: 'power2.out',
              overwrite: true,
            });
          },
        });

        // Stop the scroll-speed modulation before easing the loop to a halt (WCAG 2.2.2)
        gsap.delayedCall(4, () => scrollTrigger.kill());
        this.gsapService.stopAfter(tl);
      });

      this.destroyRef.onDestroy(() => {
        this.gsapService.cleanupContext(ctx);
      });
    });
  }
}
