import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { IngredientService } from './ingredient.service';
import { Ingredient } from '@/core/models/ingredient.model';
import { environment } from '@/environments/environment';

describe('IngredientService', () => {
  let service: IngredientService;
  let httpTesting: HttpTestingController;
  const apiUrl = `${environment.apiBaseUrl}${environment.endpoints.ingredients}`;

  const mockIngredients: Ingredient[] = [
    { id: '1', name: 'Pain' },
    { id: '2', name: 'Steak' },
    { id: '3', name: 'Fromage' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), IngredientService],
    });

    service = TestBed.inject(IngredientService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.ingredients()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('should update signals on load() success', () => {
    expect(service.loading()).toBe(false);

    service.load();

    expect(service.loading()).toBe(true);

    const req = httpTesting.expectOne(apiUrl);
    req.flush(mockIngredients);

    expect(service.loading()).toBe(false);
    expect(service.ingredients()).toEqual(mockIngredients);
    expect(service.error()).toBeNull();
    expect(service.getIngredientName('1')).toBe('Pain');
    expect(service.getIngredientName(2)).toBe('Steak');
    expect(service.getIngredientName('999')).toBeUndefined();
  });

  it('should update error signal on load() failure', () => {
    service.load();

    const req = httpTesting.expectOne(apiUrl);
    req.flush('Error loading ingredients', {
      status: 500,
      statusText: 'Server Error',
    });

    expect(service.loading()).toBe(false);
    expect(service.error()).toBeTruthy();
    expect(service.ingredients()).toEqual([]);
  });

  it('should only fetch once', () => {
    service.load();
    service.load();
    httpTesting.expectOne(apiUrl).flush(mockIngredients);

    service.load();
    httpTesting.expectNone(apiUrl);
  });
});
