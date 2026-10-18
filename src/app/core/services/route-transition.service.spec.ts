import { TestBed } from '@angular/core/testing';
import { RouteTransitionService } from './route-transition.service';
import { GsapService } from './gsap.service';
import { signal, WritableSignal } from '@angular/core';

describe('RouteTransitionService', () => {
  let service: RouteTransitionService;
  let prefersReducedMotionSignal: WritableSignal<boolean>;
  let mockOverlay: HTMLElement;
  let mockBadge: HTMLElement;

  beforeEach(() => {
    prefersReducedMotionSignal = signal(false);

    TestBed.configureTestingModule({
      providers: [
        RouteTransitionService,
        {
          provide: GsapService,
          useValue: {
            prefersReducedMotion: prefersReducedMotionSignal,
            createContext: vi.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(RouteTransitionService);

    mockOverlay = document.createElement('div');
    mockBadge = document.createElement('div');
    service.registerElements(mockOverlay, mockBadge);
  });

  afterEach(() => {
    service.resetState();
  });

  it('should initialize with idle state and initialLoad true', () => {
    expect(service.getState()).toBe('idle');
    expect(service.isInitial()).toBe(true);
  });

  it('should bypass playCover on first initial load', async () => {
    const result = await service.playCover();
    expect(result).toBe(true);
    expect(service.isInitial()).toBe(false);
    expect(service.getState()).toBe('idle');
  });

  it('should execute playCover on subsequent navigation and lock pointer events', async () => {
    // Consume initial load
    await service.playCover();

    const coverPromise = service.playCover();
    expect(service.getState()).toBe('covering');
    expect(mockOverlay.style.pointerEvents).toBe('auto');

    const result = await coverPromise;
    expect(result).toBe(true);
    expect(service.getState()).toBe('covered');
  });

  it('should execute playReveal and unlock pointer events', async () => {
    // Consume initial load and cover
    await service.playCover();
    await service.playCover();
    expect(service.getState()).toBe('covered');

    await service.playReveal();
    expect(service.getState()).toBe('idle');
    expect(mockOverlay.style.pointerEvents).toBe('none');
  });

  it('should bypass animations when prefersReducedMotion is true', async () => {
    prefersReducedMotionSignal.set(true);

    // Consume initial
    await service.playCover();

    const result = await service.playCover();
    expect(result).toBe(true);
    expect(service.getState()).toBe('idle');

    await service.playReveal();
    expect(service.getState()).toBe('idle');
    expect(mockOverlay.style.pointerEvents).toBe('none');
  });
});
