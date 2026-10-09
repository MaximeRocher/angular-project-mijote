import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouteTransition } from './route-transition';
import { axeViolations } from '@/testing-a11y';

describe('RouteTransition Component', () => {
  let fixture: ComponentFixture<RouteTransition>;
  let component: RouteTransition;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteTransition],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteTransition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create successfully', () => {
    expect(component).toBeTruthy();
  });

  it('has no axe violations', async () => {
    expect(await axeViolations(fixture)).toEqual([]);
  });
});
