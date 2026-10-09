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
  selector: '[appTilt3d]',
})
export class Tilt3dDirective {
  private readonly el = inject(ElementRef);
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);

  /** Maximum tilt angle in degrees */
  readonly maxTilt = input(10);
  /** 3D Perspective in pixels */
  readonly perspective = input(1000);
  /** Scale factor on hover */
  readonly scale = input(1.02);
  /** Whether to inject dynamic specular glare reflection */
  readonly glare = input(true);

  constructor() {
    afterNextRender(() => {
      if (this.gsapService.prefersReducedMotion()) return;
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
      if (!window.matchMedia('(pointer: fine)').matches) return;

      const host = this.el.nativeElement as HTMLElement;
      if (!host) return;

      host.style.transformStyle = 'preserve-3d';
      if (host.parentElement) {
        host.parentElement.style.perspective = `${this.perspective()}px`;
      }

      // Prepare glare element if requested
      let glareEl: HTMLElement | null = null;
      if (this.glare()) {
        glareEl = document.createElement('div');
        glareEl.className = 'tilt-glare-overlay';
        glareEl.style.position = 'absolute';
        glareEl.style.inset = '0';
        glareEl.style.borderRadius = 'inherit';
        glareEl.style.pointerEvents = 'none';
        glareEl.style.opacity = '0';
        glareEl.style.zIndex = '10';
        glareEl.style.transition = 'opacity 0.25s ease';
        glareEl.setAttribute('aria-hidden', 'true');
        host.style.position = host.style.position || 'relative';
        host.appendChild(glareEl);
      }

      const rotateXTo = gsap.quickTo(host, 'rotateX', { duration: 0.35, ease: 'power2.out' });
      const rotateYTo = gsap.quickTo(host, 'rotateY', { duration: 0.35, ease: 'power2.out' });
      const scaleTo = gsap.quickTo(host, 'scale', { duration: 0.35, ease: 'power2.out' });

      const onMouseMove = (e: MouseEvent) => {
        const rect = host.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width; // 0 to 1
        const py = (e.clientY - rect.top) / rect.height; // 0 to 1

        const rotX = (0.5 - py) * (this.maxTilt() * 2);
        const rotY = (px - 0.5) * (this.maxTilt() * 2);

        rotateXTo(rotX);
        rotateYTo(rotY);
        scaleTo(this.scale());

        if (glareEl) {
          glareEl.style.opacity = '1';
          glareEl.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 65%)`;
        }
      };

      const onMouseLeave = () => {
        gsap.to(host, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
        });
        if (glareEl) {
          glareEl.style.opacity = '0';
        }
      };

      host.addEventListener('mousemove', onMouseMove);
      host.addEventListener('mouseleave', onMouseLeave);

      this.destroyRef.onDestroy(() => {
        host.removeEventListener('mousemove', onMouseMove);
        host.removeEventListener('mouseleave', onMouseLeave);
        if (glareEl && glareEl.parentElement === host) {
          host.removeChild(glareEl);
        }
        gsap.set(host, { rotateX: 0, rotateY: 0, scale: 1 });
      });
    });
  }
}
