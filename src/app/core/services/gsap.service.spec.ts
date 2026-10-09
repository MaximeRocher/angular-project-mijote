import { TestBed } from '@angular/core/testing';
import { GsapService } from './gsap.service';

describe('GsapService', () => {
  let service: GsapService;

  beforeEach(() => {
    service = TestBed.inject(GsapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should detect reduced motion preference', () => {
    expect(typeof service.prefersReducedMotion()).toBe('boolean');
  });

  it('should create and cleanup GSAP context', () => {
    const el = document.createElement('div');
    const ctx = service.createContext(el);
    expect(ctx).toBeTruthy();
    expect(() => service.cleanupContext(ctx)).not.toThrow();
  });

  it('should provide matchMedia instance', () => {
    const mm = service.matchMedia();
    expect(mm).toBeTruthy();
    expect(typeof mm.add).toBe('function');
  });
});
