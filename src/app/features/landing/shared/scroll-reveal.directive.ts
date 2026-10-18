import { Directive, ElementRef, inject, input, afterNextRender, DestroyRef } from '@angular/core';
import { gsap } from 'gsap';
import { GsapService } from '@/core/services/gsap.service';

@Directive({
  selector: '[appScrollReveal]',
})
export class ScrollRevealDirective {
  private readonly el = inject(ElementRef);
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);

  /** Direction: 'up' | 'down' | 'left' | 'right' */
  readonly direction = input<'up' | 'down' | 'left' | 'right'>('up');
  /** Distance in pixels */
  readonly distance = input(60);
  /** Duration in seconds */
  readonly duration = input(0.8);
  /** Delay in seconds */
  readonly delay = input(0);
  /** Stagger delay for child elements (0 = animate self only) */
  readonly stagger = input(0);
  /** Easing curve */
  readonly ease = input('power3.out');

  constructor() {
    afterNextRender(() => {
      if (this.gsapService.prefersReducedMotion()) {
        return;
      }

      const el = this.el.nativeElement as HTMLElement;
      if (!el) return;

      const dir = this.direction();
      const dist = this.distance();
      const fromVars: gsap.TweenVars = { opacity: 0 };

      if (dir === 'up') fromVars['y'] = dist;
      else if (dir === 'down') fromVars['y'] = -dist;
      else if (dir === 'left') fromVars['x'] = dist;
      else if (dir === 'right') fromVars['x'] = -dist;

      const targets = this.stagger() > 0 ? Array.from(el.children) : el;

      const ctx = this.gsapService.createContext(el);
      ctx.add(() => {
        gsap.from(targets, {
          ...fromVars,
          duration: this.duration(),
          delay: this.delay(),
          stagger: this.stagger(),
          ease: this.ease(),
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });

      this.destroyRef.onDestroy(() => {
        this.gsapService.cleanupContext(ctx);
      });
    });
  }
}
