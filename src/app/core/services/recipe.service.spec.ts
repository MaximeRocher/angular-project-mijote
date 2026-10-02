import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RecipeService } from './recipe.service';
import { Recipe, CreateRecipeDto } from '@/core/models/recipe.model';
import { environment } from '@/environments/environment';

describe('RecipeService', () => {
  let service: RecipeService;
  let httpTesting: HttpTestingController;
  const apiUrl = `${environment.apiBaseUrl}${environment.endpoints.recipes}`;

  const mockRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Cheese burger',
      description: 'Un hamburger simple avec du fromage fondant pour le repas.',
      composition: [
        { idIngredient: '1', quantity: 2 },
        { idIngredient: '2', quantity: 1 },
      ],
    },
    {
      id: '2',
      name: 'Salade composée',
      description: 'Une délicieuse salade fraîche avec des tomates de saison.',
      composition: [
        { idIngredient: '4', quantity: 1 },
        { idIngredient: '5', quantity: 2 },
      ],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        RecipeService,
      ],
    });

    service = TestBed.inject(RecipeService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created with initial signals state', () => {
    expect(service).toBeTruthy();
    expect(service.recipes()).toEqual([]);
    expect(service.latestRecipes()).toEqual([]);
    expect(service.currentRecipe()).toBeNull();
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('should fetch recipes without options via getAll()', () => {
    let result: Recipe[] | undefined;
    service.getAll().subscribe((recipes) => {
      result = recipes;
    });

    const req = httpTesting.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockRecipes);

    expect(result).toEqual(mockRecipes);
  });

  it('should fetch recipes with query options via getAll()', () => {
    service
      .getAll({
        page: 2,
        limit: 6,
        sortBy: 'id',
        order: 'desc',
        name: 'burger',
      })
      .subscribe();

    const req = httpTesting.expectOne(
      (r) =>
        r.url === apiUrl &&
        r.params.get('page') === '2' &&
        r.params.get('limit') === '6' &&
        r.params.get('sortBy') === 'id' &&
        r.params.get('order') === 'desc' &&
        r.params.get('name') === 'burger'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockRecipes);
  });

  it('should fetch the latest 5 recipes via getLatest()', () => {
    service.getLatest(5).subscribe();

    const req = httpTesting.expectOne(
      (r) =>
        r.url === apiUrl &&
        r.params.get('page') === '1' &&
        r.params.get('limit') === '5' &&
        r.params.get('sortBy') === 'id' &&
        r.params.get('order') === 'desc'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockRecipes);
  });

  it('should fetch paginated recipes via getPaginated()', () => {
    service.getPaginated(1, 6, 'burger').subscribe();

    const req = httpTesting.expectOne(
      (r) =>
        r.url === apiUrl &&
        r.params.get('page') === '1' &&
        r.params.get('limit') === '6' &&
        r.params.get('name') === 'burger'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockRecipes);
  });

  it('should fetch a single recipe by id via getById()', () => {
    let result: Recipe | undefined;
    service.getById('1').subscribe((recipe) => {
      result = recipe;
    });

    const req = httpTesting.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRecipes[0]);

    expect(result).toEqual(mockRecipes[0]);
  });

  it('should create a recipe via create()', () => {
    const newRecipeDto: CreateRecipeDto = {
      name: 'Omelette',
      description: 'Une omelette simple et savoureuse aux herbes fraîches du jardin.',
      composition: [
        { idIngredient: '1', quantity: 3 },
        { idIngredient: '3', quantity: 1 },
      ],
    };

    let created: Recipe | undefined;
    service.create(newRecipeDto).subscribe((res) => {
      created = res;
    });

    const req = httpTesting.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newRecipeDto);
    req.flush({ id: '3', ...newRecipeDto });

    expect(created).toEqual({ id: '3', ...newRecipeDto });
  });

  it('should update a recipe via update()', () => {
    const updateDto: Partial<CreateRecipeDto> = {
      name: 'Super Cheese Burger',
    };

    service.update('1', updateDto).subscribe();

    const req = httpTesting.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    req.flush({ ...mockRecipes[0], name: 'Super Cheese Burger' });
  });

  it('should delete a recipe via delete()', () => {
    service.delete('1').subscribe();

    const req = httpTesting.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockRecipes[0]);
  });

  describe('validateRecipe', () => {
    it('should validate a correct recipe', () => {
      const validDto: CreateRecipeDto = {
        name: 'Tarte aux pommes',
        description: 'Une délicieuse tarte aux pommes croustillante et bien dorée au four.',
        composition: [
          { idIngredient: '1', quantity: 2 },
          { idIngredient: '2', quantity: 1 },
        ],
      };

      const result = service.validateRecipe(validDto);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should fail validation when name is missing or whitespace', () => {
      const invalid = service.validateRecipe({
        name: '   ',
        description: 'Une délicieuse tarte aux pommes croustillante et bien dorée au four.',
        composition: [
          { idIngredient: '1', quantity: 2 },
          { idIngredient: '2', quantity: 1 },
        ],
      });

      expect(invalid.valid).toBe(false);
      expect(invalid.errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('should fail validation when description is under 30 characters', () => {
      const invalid = service.validateRecipe({
        name: 'Tarte',
        description: 'Trop court.',
        composition: [
          { idIngredient: '1', quantity: 2 },
          { idIngredient: '2', quantity: 1 },
        ],
      });

      expect(invalid.valid).toBe(false);
      expect(invalid.errors.some((e) => e.field === 'description')).toBe(true);
    });

    it('should fail validation when composition has less than 2 ingredients', () => {
      const invalid = service.validateRecipe({
        name: 'Tarte aux pommes',
        description: 'Une délicieuse tarte aux pommes croustillante et bien dorée au four.',
        composition: [{ idIngredient: '1', quantity: 2 }],
      });

      expect(invalid.valid).toBe(false);
      expect(invalid.errors.some((e) => e.field === 'composition')).toBe(true);
    });

    it('should fail validation when ingredient quantity is zero or negative', () => {
      const invalid = service.validateRecipe({
        name: 'Tarte aux pommes',
        description: 'Une délicieuse tarte aux pommes croustillante et bien dorée au four.',
        composition: [
          { idIngredient: '1', quantity: 0 },
          { idIngredient: '2', quantity: 1 },
        ],
      });

      expect(invalid.valid).toBe(false);
      expect(invalid.errors.some((e) => e.field === 'composition')).toBe(true);
    });
  });

  describe('Signal loading workflows', () => {
    it('should update latestRecipes signal on loadLatest() success', () => {
      expect(service.loading()).toBe(false);

      service.loadLatest(5).subscribe();

      expect(service.loading()).toBe(true);

      const req = httpTesting.expectOne(
        (r) =>
          r.url === apiUrl &&
          r.params.get('page') === '1' &&
          r.params.get('limit') === '5'
      );
      req.flush(mockRecipes);

      expect(service.loading()).toBe(false);
      expect(service.latestRecipes()).toEqual(mockRecipes);
      expect(service.error()).toBeNull();
    });

    it('should update recipes signal on loadPaginated() success', () => {
      service.loadPaginated(1, 6).subscribe();

      const req = httpTesting.expectOne(
        (r) =>
          r.url === apiUrl &&
          r.params.get('page') === '1' &&
          r.params.get('limit') === '6'
      );
      req.flush(mockRecipes);

      expect(service.loading()).toBe(false);
      expect(service.recipes()).toEqual(mockRecipes);
      expect(service.error()).toBeNull();
    });

    it('should update currentRecipe signal on loadById() success', () => {
      service.loadById('1').subscribe();

      const req = httpTesting.expectOne(`${apiUrl}/1`);
      req.flush(mockRecipes[0]);

      expect(service.loading()).toBe(false);
      expect(service.currentRecipe()).toEqual(mockRecipes[0]);
    });

    it('should set error signal on loadPaginated() failure', () => {
      service.loadPaginated(1, 6).subscribe({
        error: () => {
          // handled
        },
      });

      const req = httpTesting.expectOne(
        (r) =>
          r.url === apiUrl &&
          r.params.get('page') === '1' &&
          r.params.get('limit') === '6'
      );
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(service.loading()).toBe(false);
      expect(service.error()).toBeTruthy();
    });
  });
});
