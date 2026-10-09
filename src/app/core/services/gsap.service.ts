import { Service, signal } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

@Service()
export class GsapService {
  private readonly _prefersReducedMotion = signal(false);
  readonly prefersReducedMotion = this._prefersReducedMotion.asReadonly();

  private pluginsRegistered = false;

  constructor() {
    this.ensureMatchMediaPolyfill();
    this.registerPlugins();
    this.detectReducedMotion();
  }

  private ensureMatchMediaPolyfill(): void {
    if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string): MediaQueryList =>
          ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          }) as unknown as MediaQueryList,
      });
    }
  }

  registerPlugins(): void {
    if (this.pluginsRegistered) return;
    this.ensureMatchMediaPolyfill();
    gsap.registerPlugin(ScrollTrigger, Flip);
    this.pluginsRegistered = true;
  }

  /** Creates a GSAP context scoped to an element for automatic cleanup */
  createContext(element: Element): gsap.Context {
    return gsap.context(() => {}, element);
  }

  /** Kills a GSAP context and all its animations/ScrollTriggers */
  cleanupContext(ctx: gsap.Context): void {
    ctx.revert();
  }

  /** Returns the GSAP matchMedia instance for responsive breakpoints */
  matchMedia(): gsap.MatchMedia {
    return gsap.matchMedia();
  }

  private detectReducedMotion(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._prefersReducedMotion.set(mql.matches);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', (e: MediaQueryListEvent) => {
        this._prefersReducedMotion.set(e.matches);
      });
    }
  }
}
