import { Directive, ElementRef, inject, input, afterNextRender, DestroyRef } from '@angular/core';
import { gsap } from 'gsap';
import { GsapService } from '@/core/services/gsap.service';

@Directive({
  selector: '[appStaggerList]',
})
export class StaggerListDirective {
  private readonly el = inject(ElementRef);
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);

  /** CSS selector for items to animate (defaults to direct children) */
  readonly itemSelector = input<string>(':scope > *');
  /** Stagger delay between items in seconds */
  readonly stagger = input<number>(0.07);
  /** Duration in seconds */
  readonly duration = input<number>(0.55);
  /** Y displacement in pixels */
  readonly y = input<number>(24);

  constructor() {
    afterNextRender(() => {
      if (this.gsapService.prefersReducedMotion()) return;

      const host = this.el.nativeElement as HTMLElement;
      if (!host) return;

      const contexts: gsap.Context[] = [];
      let debounceTimer: ReturnType<typeof setTimeout> | undefined;

      const animateChildren = () => {
        const items = host.querySelectorAll(this.itemSelector());
        if (!items || items.length === 0) return;

        const ctx = this.gsapService.createContext(host);
        contexts.push(ctx);
        ctx.add(() => {
          gsap.from(Array.from(items), {
            opacity: 0,
            y: this.y(),
            scale: 0.96,
            duration: this.duration(),
            stagger: this.stagger(),
            ease: 'power3.out',
            clearProps: 'opacity,transform',
          });
        });
      };

      // Animate initial children
      animateChildren();

      // Observe dynamic changes (e.g. data arrival or page switch)
      let observer: MutationObserver | null = null;
      if (typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver((mutations) => {
          const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
          if (hasAddedNodes) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              animateChildren();
            }, 50);
          }
        });

        observer.observe(host, { childList: true, subtree: false });
      }

      this.destroyRef.onDestroy(() => {
        observer?.disconnect();
        clearTimeout(debounceTimer);
        contexts.forEach((ctx) => this.gsapService.cleanupContext(ctx));
      });
    });
  }
}
