import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, Event } from '@angular/router';
import { RouteTransition } from './route-transition';
import { RouteTransitionService } from '@/core/services/route-transition.service';
import { axeViolations } from '@/testing-a11y';
import { Subject } from 'rxjs';

describe('RouteTransition Component', () => {
  let fixture: ComponentFixture<RouteTransition>;
  let component: RouteTransition;
  let mockTransitionService: {
    registerElements: ReturnType<typeof vi.fn>;
    playReveal: ReturnType<typeof vi.fn>;
    playCover: ReturnType<typeof vi.fn>;
  };
  let routerEvents$: Subject<Event>;

  beforeEach(async () => {
    routerEvents$ = new Subject<Event>();
    mockTransitionService = {
      registerElements: vi.fn(),
      playReveal: vi.fn().mockResolvedValue(undefined),
      playCover: vi.fn().mockResolvedValue(true),
    };

    const mockRouter = {
      events: routerEvents$.asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [RouteTransition],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: RouteTransitionService, useValue: mockTransitionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteTransition);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should register overlay and badge elements with RouteTransitionService', () => {
    expect(mockTransitionService.registerElements).toHaveBeenCalled();
  });

  it('should trigger playReveal on NavigationEnd', () => {
    routerEvents$.next(new NavigationEnd(1, '/recipes', '/recipes'));
    expect(mockTransitionService.playReveal).toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    expect(await axeViolations(fixture)).toEqual([]);
  });
});
