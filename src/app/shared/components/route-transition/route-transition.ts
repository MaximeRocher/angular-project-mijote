import {
  Component,
  ElementRef,
  inject,
  afterNextRender,
  DestroyRef,
  viewChild,
} from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { filter } from 'rxjs';
import { RouteTransitionService } from '@/core/services/route-transition.service';
import { CocottePotComponent } from '../culinary-art/cocotte-pot.component';

@Component({
  selector: 'app-route-transition',
  imports: [RouterOutlet, CocottePotComponent],
  styleUrl: './route-transition.css',
  template: `
    <div #overlay class="transition-overlay" aria-hidden="true">
      <div #badge class="transition-badge">
        <app-cocotte-pot [size]="'sm'" />
        <span class="transition-title">Mijote</span>
      </div>
    </div>
    <router-outlet />
  `,
})
export class RouteTransition {
  private readonly router = inject(Router, { optional: true });
  private readonly transitionService = inject(RouteTransitionService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly overlay = viewChild.required<ElementRef>('overlay');
  private readonly badge = viewChild<ElementRef>('badge');

  constructor() {
    afterNextRender(() => {
      const overlayEl = this.overlay().nativeElement as HTMLElement;
      const badgeEl = this.badge()?.nativeElement as HTMLElement | undefined;

      this.transitionService.registerElements(overlayEl, badgeEl);

      if (!this.router) return;

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
          this.transitionService.playReveal();
        });

      this.destroyRef.onDestroy(() => {
        navEndSub.unsubscribe();
      });
    });
  }
}
