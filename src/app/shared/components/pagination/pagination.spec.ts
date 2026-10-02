import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';

describe('Pagination', () => {
  let component: Pagination;
  let fixture: ComponentFixture<Pagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pagination],
    }).compileComponents();

    fixture = TestBed.createComponent(Pagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the component with defaults', () => {
    expect(component).toBeTruthy();
    expect(component.currentPage()).toBe(1);
    expect(component.pageSize()).toBe(6);
    expect(component.totalPages()).toBe(1);
  });

  it('should calculate totalPages based on totalItems and pageSize', async () => {
    fixture.componentRef.setInput('totalItems', 24);
    fixture.componentRef.setInput('pageSize', 6);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.totalPages()).toBe(4);
    expect(component.pages()).toEqual([1, 2, 3, 4]);
  });

  it('should ceiling totalPages when items are not a multiple of pageSize', async () => {
    fixture.componentRef.setInput('totalItems', 13);
    fixture.componentRef.setInput('pageSize', 6);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.totalPages()).toBe(3);
    expect(component.pages()).toEqual([1, 2, 3]);
  });

  it('should allow overriding totalPages with totalPagesInput', async () => {
    fixture.componentRef.setInput('totalPagesInput', 8);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.totalPages()).toBe(8);
  });

  it('should navigate to next and previous pages', async () => {
    fixture.componentRef.setInput('totalItems', 30);
    fixture.componentRef.setInput('pageSize', 6);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.hasPrevious()).toBe(false);
    expect(component.hasNext()).toBe(true);

    component.next();
    expect(component.currentPage()).toBe(2);
    expect(component.hasPrevious()).toBe(true);

    component.previous();
    expect(component.currentPage()).toBe(1);
  });

  it('should not navigate beyond bounds', async () => {
    fixture.componentRef.setInput('totalItems', 12);
    fixture.componentRef.setInput('pageSize', 6);
    fixture.detectChanges();
    await fixture.whenStable();

    // Already on page 1, previous should do nothing
    component.previous();
    expect(component.currentPage()).toBe(1);

    component.goToPage(2);
    expect(component.currentPage()).toBe(2);

    // On last page (2), next should do nothing
    component.next();
    expect(component.currentPage()).toBe(2);

    // Cannot set beyond bounds
    component.goToPage(99);
    expect(component.currentPage()).toBe(2);

    component.goToPage(-5);
    expect(component.currentPage()).toBe(1);
  });

  it('should window pages when totalPages exceeds maxVisiblePages', async () => {
    fixture.componentRef.setInput('totalItems', 60);
    fixture.componentRef.setInput('pageSize', 6);
    fixture.componentRef.setInput('maxVisiblePages', 5);
    component.currentPage.set(6);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.totalPages()).toBe(10);
    expect(component.pages()).toEqual([4, 5, 6, 7, 8]);
  });

  it('should render disabled state on previous button on page 1', async () => {
    fixture.componentRef.setInput('totalItems', 24);
    fixture.componentRef.setInput('pageSize', 6);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const prevBtn = compiled.querySelector('button[aria-label="Page précédente"]') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
  });

  it('should render active state on current page button', async () => {
    fixture.componentRef.setInput('totalItems', 24);
    fixture.componentRef.setInput('pageSize', 6);
    component.currentPage.set(2);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const activeBtn = compiled.querySelector('button[aria-current="page"]');
    expect(activeBtn?.textContent?.trim()).toBe('2');
  });

  it('should hide pagination when hideOnSinglePage is true and totalPages is 1', async () => {
    fixture.componentRef.setInput('totalItems', 4);
    fixture.componentRef.setInput('pageSize', 6);
    fixture.componentRef.setInput('hideOnSinglePage', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav')).toBeNull();
  });
});
