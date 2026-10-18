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
      providers: [provideHttpClient(), provideHttpClientTesting(), RecipeService],
    });

    service = TestBed.inject(RecipeService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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
        r.params.get('name') === 'burger',
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

  describe('addRate', () => {
    it('should GET the recipe then PUT it back with the new rate appended', () => {
      const rate = { login: 'abc1-', rate: 4, review: 'Super' };
      let result: Recipe | undefined;
      service.addRate('1', rate).subscribe((r) => (result = r));

      httpTesting.expectOne({ method: 'GET', url: `${apiUrl}/1` }).flush(mockRecipes[0]);

      const put = httpTesting.expectOne({ method: 'PUT', url: `${apiUrl}/1` });
      expect(put.request.body.rates).toEqual([...(mockRecipes[0].rates ?? []), rate]);
      put.flush({ ...mockRecipes[0], rates: put.request.body.rates });

      expect(result?.rates?.at(-1)).toEqual(rate);
    });
  });
});
