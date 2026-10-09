import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RecipesList } from './recipes-list';
import { RecipeService } from '@/core/services/recipe.service';
import { IngredientService } from '@/core/services/ingredient.service';
import { Recipe } from '@/core/models/recipe.model';

describe('RecipesList', () => {
  let component: RecipesList;
  let fixture: ComponentFixture<RecipesList>;
  let mockRecipeService: any;
  let mockIngredientService: any;

  const mockRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Cheese burger',
      description: 'Un délicieux burger garni de fromage fondu et de salade fraîche.',
      composition: [
        { idIngredient: '1', quantity: 2 },
        { idIngredient: '2', quantity: 1 },
      ],
    },
    {
      id: '2',
      name: 'Salade César',
      description: 'Une salade classique avec des croûtons et du parmesan râpé.',
      composition: [
        { idIngredient: '4', quantity: 1 },
        { idIngredient: '3', quantity: 1 },
      ],
    },
  ];

  beforeEach(async () => {
    mockRecipeService = {
      getAll: vi.fn().mockReturnValue(of(mockRecipes)),
      getPaginated: vi.fn().mockReturnValue(of(mockRecipes)),
      delete: vi.fn().mockReturnValue(of(mockRecipes[0])),
    };

    mockIngredientService = {
      loadAll: vi.fn().mockReturnValue(of([])),
      getIngredientName: vi.fn().mockImplementation((id: string | number) => `Ingrédient #${id}`),
    };

    await TestBed.configureTestingModule({
      imports: [RecipesList],
      providers: [
        provideRouter([]),
        { provide: RecipeService, useValue: mockRecipeService },
        { provide: IngredientService, useValue: mockIngredientService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipesList);
    component = fixture.componentInstance;
  });

  it('should create and load recipes and ingredients on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component).toBeTruthy();
    expect(mockIngredientService.loadAll).toHaveBeenCalled();
    expect(mockRecipeService.getAll).toHaveBeenCalled();
    expect(mockRecipeService.getPaginated).toHaveBeenCalledWith(1, component.pageSize, undefined);
    expect(component.recipes().length).toBe(2);
    expect(component.totalItems()).toBe(2);
    expect(component.loading()).toBe(false);
  });

  it('should render recipe cards when recipes are loaded', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-recipe-card');
    expect(cards.length).toBe(2);
  });

  it('should filter recipes when searching', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    mockRecipeService.getAll.mockReturnValue(of([mockRecipes[0]]));
    mockRecipeService.getPaginated.mockReturnValue(of([mockRecipes[0]]));

    component.onSearch('burger');

    expect(component.searchTerm()).toBe('burger');
    expect(component.currentPage()).toBe(1);
    expect(mockRecipeService.getAll).toHaveBeenCalledWith({ name: 'burger' });
    expect(mockRecipeService.getPaginated).toHaveBeenCalledWith(1, component.pageSize, 'burger');
    expect(component.recipes().length).toBe(1);
  });

  it('should clear search and reload all recipes', async () => {
    component.searchTerm.set('burger');
    component.clearSearch();

    expect(component.searchTerm()).toBe('');
    expect(component.currentPage()).toBe(1);
    expect(mockRecipeService.getAll).toHaveBeenCalledWith({ name: undefined });
  });

  it('should handle pagination page change', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.onPageChange(2);

    expect(component.currentPage()).toBe(2);
    expect(mockRecipeService.getPaginated).toHaveBeenCalledWith(2, component.pageSize, undefined);
  });

  it('should show empty state when no recipes match', async () => {
    mockRecipeService.getAll.mockReturnValue(of([]));
    mockRecipeService.getPaginated.mockReturnValue(of([]));

    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aucune recette trouvée');
  });

  it('should display error message on service failure', async () => {
    mockRecipeService.getAll.mockReturnValue(throwError(() => new Error('Connexion perdue')));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.error()).toBe('Connexion perdue');
    expect(component.loading()).toBe(false);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Connexion perdue');
  });

  it('should delete a recipe when confirmed', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.onDeleteRecipe('1');

    expect(mockRecipeService.delete).toHaveBeenCalledWith('1');
  });
});
