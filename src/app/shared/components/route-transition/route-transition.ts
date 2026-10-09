import {
  Component,
  ElementRef,
  inject,
  afterNextRender,
  DestroyRef,
  viewChild,
} from '@angular/core';
import { Router, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs';
import { gsap } from 'gsap';
import { GsapService } from '@/core/services/gsap.service';

@Component({
  selector: 'app-route-transition',
  imports: [RouterOutlet],
  styleUrl: './route-transition.css',
  template: `
    <div #overlay class="transition-overlay" aria-hidden="true"></div>
    <router-outlet />
  `,
})
export class RouteTransition {
  private readonly router = inject(Router, { optional: true });
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly overlay = viewChild.required<ElementRef>('overlay');

  constructor() {
    afterNextRender(() => {
      if (this.gsapService.prefersReducedMotion()) return;
      if (!this.router) return;

      const overlayEl = this.overlay().nativeElement as HTMLElement;

      const navStartSub = this.router.events
        .pipe(filter((e) => e instanceof NavigationStart))
        .subscribe(() => {
          gsap.to(overlayEl, {
            scaleY: 1,
            duration: 0.35,
            ease: 'power4.inOut',
            transformOrigin: 'bottom',
          });
        });

      const navEndSub = this.router.events
        .pipe(
          filter(
            (e) =>
              e instanceof NavigationEnd ||
              e instanceof NavigationCancel ||
              e instanceof NavigationError,
          ),
        )
        .subscribe(() => {
          gsap.to(overlayEl, {
            scaleY: 0,
            duration: 0.4,
            ease: 'power4.inOut',
            transformOrigin: 'top',
            delay: 0.08,
          });
        });

      this.destroyRef.onDestroy(() => {
        navStartSub.unsubscribe();
        navEndSub.unsubscribe();
      });
    });
  }
}
