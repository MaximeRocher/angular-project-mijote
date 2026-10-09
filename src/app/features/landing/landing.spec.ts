import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Landing } from './landing';
import { axeViolations } from '@/testing-a11y';

describe('Landing Component', () => {
  let fixture: ComponentFixture<Landing>;
  let component: Landing;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Landing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should render all landing sections', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-hero-section')).toBeTruthy();
    expect(el.querySelector('app-bento-grid-section')).toBeTruthy();
    expect(el.querySelector('app-marquee-section')).toBeTruthy();
    expect(el.querySelector('app-sticky-footer')).toBeTruthy();
    expect(el.querySelector('app-custom-cursor')).toBeTruthy();
  });

  it('has no axe violations', async () => {
    expect(await axeViolations(fixture)).toEqual([]);
  });
});
