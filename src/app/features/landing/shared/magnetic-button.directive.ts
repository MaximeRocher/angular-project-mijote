import {
  Directive,
  ElementRef,
  inject,
  input,
  afterNextRender,
  DestroyRef,
} from '@angular/core';
import { gsap } from 'gsap';
import { GsapService } from '@/core/services/gsap.service';

@Directive({
  selector: '[appMagnetic]',
})
export class MagneticButtonDirective {
  private readonly el = inject(ElementRef);
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);

  /** Magnetic pull strength (0-1, where 1 = full follow) */
  readonly strength = input(0.35);
  /** Distance threshold in pixels */
  readonly threshold = input(100);

  constructor() {
    afterNextRender(() => {
      if (this.gsapService.prefersReducedMotion()) return;
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

      if (!window.matchMedia('(pointer: fine)').matches) return;

      const el = this.el.nativeElement as HTMLElement;
      if (!el) return;

      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

      const onMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.threshold()) {
          const s = this.strength();
          xTo(dx * s);
          yTo(dy * s);
        }
      };

      const onMouseLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener('mousemove', onMouseMove);
      el.addEventListener('mouseleave', onMouseLeave);

      this.destroyRef.onDestroy(() => {
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseleave', onMouseLeave);
        gsap.set(el, { x: 0, y: 0 });
      });
    });
  }
}
