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
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        IngredientService,
      ],
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

  it('should get all ingredients via getAll()', () => {
    let result: Ingredient[] | undefined;
    service.getAll().subscribe((ingredients) => {
      result = ingredients;
    });

    const req = httpTesting.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockIngredients);

    expect(result).toEqual(mockIngredients);
  });

  it('should get a single ingredient by id via getById()', () => {
    let result: Ingredient | undefined;
    service.getById('2').subscribe((ingredient) => {
      result = ingredient;
    });

    const req = httpTesting.expectOne(`${apiUrl}/2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockIngredients[1]);

    expect(result).toEqual({ id: '2', name: 'Steak' });
  });

  it('should update signals on loadAll() success', () => {
    expect(service.loading()).toBe(false);

    service.loadAll().subscribe();

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

  it('should update error signal on loadAll() failure', () => {
    service.loadAll().subscribe({
      error: () => {
        // expected error
      },
    });

    const req = httpTesting.expectOne(apiUrl);
    req.flush('Error loading ingredients', {
      status: 500,
      statusText: 'Server Error',
    });

    expect(service.loading()).toBe(false);
    expect(service.error()).toBeTruthy();
    expect(service.ingredients()).toEqual([]);
  });
});
