import {
  Component,
  ElementRef,
  inject,
  afterNextRender,
  DestroyRef,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { GsapService } from '@/core/services/gsap.service';

@Component({
  selector: 'app-custom-cursor',
  styleUrl: './custom-cursor.css',
  template: `
    <div #cursorOuter class="cursor-outer" aria-hidden="true"></div>
    <div #cursorInner class="cursor-inner" aria-hidden="true"></div>
  `,
})
export class CustomCursor {
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly outerRef = viewChild.required<ElementRef>('cursorOuter');
  private readonly innerRef = viewChild.required<ElementRef>('cursorInner');

  constructor() {
    afterNextRender(() => {
      if (this.gsapService.prefersReducedMotion()) return;
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
      if (!window.matchMedia('(pointer: fine)').matches) return;

      const outer = this.outerRef().nativeElement as HTMLElement;
      const inner = this.innerRef().nativeElement as HTMLElement;

      const outerX = gsap.quickTo(outer, 'x', { duration: 0.5, ease: 'power3.out' });
      const outerY = gsap.quickTo(outer, 'y', { duration: 0.5, ease: 'power3.out' });
      const innerX = gsap.quickTo(inner, 'x', { duration: 0.15, ease: 'power2.out' });
      const innerY = gsap.quickTo(inner, 'y', { duration: 0.15, ease: 'power2.out' });

      // Initially position off-screen until first movement
      gsap.set([outer, inner], { x: -100, y: -100 });

      let visible = false;

      const onMouseMove = (e: MouseEvent) => {
        if (!visible) {
          visible = true;
          gsap.set([outer, inner], { opacity: 1 });
        }
        outerX(e.clientX);
        outerY(e.clientY);
        innerX(e.clientX);
        innerY(e.clientY);
      };

      const interactiveSelector = 'a, button, [role="button"], input, [appMagnetic]';

      const onMouseOver = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target && target.closest(interactiveSelector)) {
          gsap.to(outer, { scale: 2.2, opacity: 0.5, duration: 0.3, ease: 'power2.out' });
          gsap.to(inner, { scale: 0.5, duration: 0.3, ease: 'power2.out' });
        }
      };

      const onMouseOut = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target && target.closest(interactiveSelector)) {
          gsap.to(outer, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
          gsap.to(inner, { scale: 1, duration: 0.3, ease: 'power2.out' });
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseover', onMouseOver);
      document.addEventListener('mouseout', onMouseOut);

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseover', onMouseOver);
        document.removeEventListener('mouseout', onMouseOut);
      });
    });
  }
}
