import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { transitionGuard } from './transition.guard';
import { RouteTransitionService } from '../services/route-transition.service';
import { GsapService } from '../services/gsap.service';
import { signal, WritableSignal } from '@angular/core';

describe('transitionGuard', () => {
  let service: RouteTransitionService;
  let gsapService: GsapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RouteTransitionService,
        {
          provide: GsapService,
          useValue: {
            prefersReducedMotion: signal(false),
            createContext: vi.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(RouteTransitionService);
    gsapService = TestBed.inject(GsapService);
  });

  it('should allow initial application navigation immediately', async () => {
    const mockRoute = {} as ActivatedRouteSnapshot;
    const mockState = {} as RouterStateSnapshot;

    const result = await TestBed.runInInjectionContext(() => transitionGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(service.isInitial()).toBe(false);
  });

  it('should delegate to playCover on subsequent navigations', async () => {
    const mockRoute = {} as ActivatedRouteSnapshot;
    const mockState = {} as RouterStateSnapshot;

    // First call consumes initial load
    await TestBed.runInInjectionContext(() => transitionGuard(mockRoute, mockState));

    const playCoverSpy = vi.spyOn(service, 'playCover').mockResolvedValue(true);

    const result = await TestBed.runInInjectionContext(() => transitionGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(playCoverSpy).toHaveBeenCalled();
  });

  it('should allow navigation without delay when prefers-reduced-motion is true', async () => {
    (gsapService.prefersReducedMotion as WritableSignal<boolean>).set(true);

    const mockRoute = {} as ActivatedRouteSnapshot;
    const mockState = {} as RouterStateSnapshot;

    const result = await TestBed.runInInjectionContext(() => transitionGuard(mockRoute, mockState));

    expect(result).toBe(true);
  });
});
