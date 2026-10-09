import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CocottePotComponent } from './cocotte-pot.component';
import { CulinaryIconComponent } from './culinary-icon.component';
import { axeViolations } from '@/testing-a11y';

describe('Culinary Art Components', () => {
  describe('CocottePotComponent', () => {
    let fixture: ComponentFixture<CocottePotComponent>;
    let component: CocottePotComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CocottePotComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(CocottePotComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create and render SVG', () => {
      expect(component).toBeTruthy();
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should compute size correctly', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(component.pixelSize()).toBe(180);
    });

    it('has no axe violations', async () => {
      expect(await axeViolations(fixture)).toEqual([]);
    });
  });

  describe('CulinaryIconComponent', () => {
    let fixture: ComponentFixture<CulinaryIconComponent>;
    let component: CulinaryIconComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CulinaryIconComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(CulinaryIconComponent);
      component = fixture.componentInstance;
    });

    it('should render requested vector icon', () => {
      fixture.componentRef.setInput('name', 'rosemary');
      fixture.detectChanges();
      expect(component).toBeTruthy();
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg.getAttribute('aria-label')).toBe('rosemary');
    });

    it('has no axe violations', async () => {
      fixture.componentRef.setInput('name', 'tomato');
      fixture.detectChanges();
      expect(await axeViolations(fixture)).toEqual([]);
    });
  });
});
