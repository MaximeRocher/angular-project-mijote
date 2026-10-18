import { Directive, ElementRef, inject, input, afterNextRender, DestroyRef } from '@angular/core';
import { gsap } from 'gsap';
import { GsapService } from '@/core/services/gsap.service';

@Directive({
  selector: '[appTextReveal]',
})
export class TextRevealDirective {
  private readonly el = inject(ElementRef);
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);

  /** Split by 'words' or 'chars' */
  readonly splitBy = input<'words' | 'chars'>('words');
  /** Stagger delay between items */
  readonly stagger = input(0.06);
  /** Duration per item */
  readonly duration = input(0.8);
  /** Easing */
  readonly ease = input('power4.out');
  /** Whether to trigger on scroll or on load */
  readonly triggerOnScroll = input(true);

  constructor() {
    afterNextRender(() => {
      if (this.gsapService.prefersReducedMotion()) {
        return;
      }

      const el = this.el.nativeElement as HTMLElement;
      if (!el) return;
      const text = el.textContent?.trim() ?? '';
      if (!text) return;

      const items = this.splitBy() === 'words' ? text.split(/\s+/) : text.split('');

      el.textContent = '';
      el.style.overflow = 'hidden';

      const wrappers: HTMLSpanElement[] = [];
      items.forEach((item, i) => {
        const outer = document.createElement('span');
        outer.style.display = 'inline-block';
        outer.style.overflow = 'hidden';
        outer.style.verticalAlign = 'top';

        const inner = document.createElement('span');
        inner.style.display = 'inline-block';
        inner.textContent = item;
        outer.appendChild(inner);
        wrappers.push(inner);

        el.appendChild(outer);

        if (this.splitBy() === 'words' && i < items.length - 1) {
          el.appendChild(document.createTextNode('\u00A0'));
        }
      });

      const ctx = this.gsapService.createContext(el);
      ctx.add(() => {
        const tweenVars: gsap.TweenVars = {
          y: '110%',
          opacity: 0,
          duration: this.duration(),
          stagger: this.stagger(),
          ease: this.ease(),
        };

        if (this.triggerOnScroll()) {
          tweenVars['scrollTrigger'] = {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          };
        }

        gsap.from(wrappers, tweenVars);
      });

      this.destroyRef.onDestroy(() => {
        this.gsapService.cleanupContext(ctx);
      });
    });
  }
}
