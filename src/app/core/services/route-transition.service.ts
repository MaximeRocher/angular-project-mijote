import { Injectable, inject } from '@angular/core';
import { gsap } from 'gsap';
import { GsapService } from './gsap.service';

export type TransitionState = 'idle' | 'covering' | 'covered' | 'revealing';

@Injectable({
  providedIn: 'root',
})
export class RouteTransitionService {
  private readonly gsapService = inject(GsapService);

  private overlayEl: HTMLElement | null = null;
  private badgeEl: HTMLElement | null = null;

  private state: TransitionState = 'idle';
  private initialLoad = true;
  private safetyTimeoutId: ReturnType<typeof setTimeout> | null = null;

  registerElements(overlay: HTMLElement, badge?: HTMLElement): void {
    this.overlayEl = overlay;
    this.badgeEl = badge ?? null;
  }

  isInitial(): boolean {
    return this.initialLoad;
  }

  getState(): TransitionState {
    return this.state;
  }

  /**
   * Called by transitionGuard when a route navigation begins.
   * Animates the curtain upward to fully cover the current view.
   * Resolves `true` ONLY when the screen is 100% covered, signaling
   * Angular that it is safe to swap the route component underneath.
   */
  async playCover(): Promise<boolean> {
    // Bypass on first initial application load so FCP is instant
    if (this.initialLoad) {
      this.initialLoad = false;
      return true;
    }

    // Bypass if reduced motion requested or overlay not yet registered
    if (this.gsapService.prefersReducedMotion() || !this.overlayEl) {
      return true;
    }

    // Prevent duplicate triggers if already covering
    if (this.state === 'covering' || this.state === 'covered') {
      return true;
    }

    this.state = 'covering';
    const overlay = this.overlayEl;
    const badge = this.badgeEl;

    // Immediately block pointer events so user cannot spam clicks during transition
    overlay.style.pointerEvents = 'auto';

    // Clear any previous safety timer
    if (this.safetyTimeoutId) {
      clearTimeout(this.safetyTimeoutId);
    }
    // Safety recovery: if navigation hangs or fails to reach NavigationEnd within 2.5s, auto-reveal
    this.safetyTimeoutId = setTimeout(() => {
      if (this.state === 'covering' || this.state === 'covered') {
        this.playReveal();
      }
    }, 2500);

    return new Promise<boolean>((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          this.state = 'covered';
          resolve(true);
        },
      });

      tl.set(overlay, { transformOrigin: 'bottom' });
      tl.to(overlay, {
        scaleY: 1,
        duration: 0.32,
        ease: 'power3.inOut',
      });

      if (badge) {
        tl.fromTo(
          badge,
          { opacity: 0, scale: 0.9, y: 10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'power2.out' },
          '-=0.15',
        );
      }
    });
  }

  /**
   * Called on NavigationEnd / NavigationCancel / NavigationError.
   * Lifts the curtain from the top, revealing the newly mounted view.
   */
  async playReveal(): Promise<void> {
    if (this.safetyTimeoutId) {
      clearTimeout(this.safetyTimeoutId);
      this.safetyTimeoutId = null;
    }

    if (!this.overlayEl) {
      this.state = 'idle';
      return;
    }

    const overlay = this.overlayEl;
    const badge = this.badgeEl;

    if (this.gsapService.prefersReducedMotion()) {
      overlay.style.pointerEvents = 'none';
      overlay.style.transform = 'scaleY(0)';
      this.state = 'idle';
      return;
    }

    this.state = 'revealing';

    // Allow a brief moment (50ms) for Angular view initialization and DOM settlement
    await new Promise((r) => setTimeout(r, 50));

    return new Promise<void>((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          overlay.style.pointerEvents = 'none';
          this.state = 'idle';
          resolve();
        },
      });

      if (badge) {
        tl.to(badge, {
          opacity: 0,
          scale: 0.95,
          duration: 0.15,
          ease: 'power2.in',
        });
      }

      tl.set(overlay, { transformOrigin: 'top' });
      tl.to(
        overlay,
        {
          scaleY: 0,
          duration: 0.36,
          ease: 'power3.inOut',
        },
        badge ? '-=0.05' : 0,
      );
    });
  }

  /**
   * Reset internal state (useful for tests)
   */
  resetState(): void {
    if (this.safetyTimeoutId) {
      clearTimeout(this.safetyTimeoutId);
      this.safetyTimeoutId = null;
    }
    this.initialLoad = true;
    this.state = 'idle';
    if (this.overlayEl) {
      this.overlayEl.style.pointerEvents = 'none';
      this.overlayEl.style.transform = 'scaleY(0)';
    }
  }
}
