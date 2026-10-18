import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RecipesList } from './recipes-list';
import { RecipeService } from '@/core/services/recipe.service';
import { IngredientService } from '@/core/services/ingredient.service';
import { Recipe } from '@/core/models/recipe.model';
import { provideAppIcons } from '@/core/icons';
import { axeViolations } from '@/testing-a11y';

describe('RecipesList', () => {
  let component: RecipesList;
  let fixture: ComponentFixture<RecipesList>;
  let mockRecipeService: Record<string, ReturnType<typeof vi.fn>>;
  let mockIngredientService: {
    load: ReturnType<typeof vi.fn>;
    getIngredientName: ReturnType<typeof vi.fn>;
  };

  const mockRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Cheese burger',
      description: 'Un délicieux burger garni de fromage fondu et de salade fraîche.',
      composition: [
        { idIngredient: '1', quantity: 2 },
        { idIngredient: '2', quantity: 1 },
      ],
      rates: [
        { login: 'Alex', rate: 5, review: 'Super' },
        { login: 'Mathieu', rate: 5, review: 'Top' },
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
      load: vi.fn(),
      getIngredientName: vi.fn().mockImplementation((id: string | number) => `Ingrédient #${id}`),
    };

    await TestBed.configureTestingModule({
      imports: [RecipesList],
      providers: [
        provideRouter([]),
        provideAppIcons(),
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
    expect(mockIngredientService.load).toHaveBeenCalled();
    expect(mockRecipeService['getAll']).toHaveBeenCalled();
    expect(mockRecipeService['getPaginated']).toHaveBeenCalledWith(
      1,
      component.pageSize,
      undefined,
    );
    expect(component.recipes().length).toBe(2);
    expect(component.totalItems()).toBe(2);
    expect(component.loading()).toBe(false);
  });

  it('should render recipe cards when recipes are loaded with ratings and truncated descriptions', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-recipe-card');
    expect(cards.length).toBe(2);

    // Card 1: has rating (5/5) and truncated description
    expect(cards[0].querySelector('h3')?.textContent).toContain('Cheese burger');
    expect(cards[0].querySelector('p')?.textContent?.trim()).toBe('Un délicieux bu…');
    expect(cards[0].textContent).toContain('5 / 5');
    expect(cards[0].textContent).toContain('(2 avis)');

    // Card 2: unrated recipe
    expect(cards[1].querySelector('h3')?.textContent).toContain('Salade César');
    expect(cards[1].querySelector('p')?.textContent?.trim()).toBe('Une salade clas…');
    expect(cards[1].textContent).toContain('Non noté');
  });

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  /** Types in the search box, waits out the debounce and lets the resource reload. */
  async function search(term: string): Promise<void> {
    component.searchTerm.set(term);
    TestBed.tick();
    await sleep(350);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  describe('search (debounced)', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });
    it('should wait for a pause in typing before querying', async () => {
      mockRecipeService['getAll'].mockClear();

      component.searchTerm.set('bur');
      TestBed.tick();
      await sleep(150);
      expect(mockRecipeService['getAll']).not.toHaveBeenCalled();

      await search('burger');
      expect(mockRecipeService['getAll']).toHaveBeenCalledTimes(1);
    });

    it('should filter recipes and go back to page 1', async () => {
      component.currentPage.set(2);
      mockRecipeService['getAll'].mockReturnValue(of([mockRecipes[0]]));
      mockRecipeService['getPaginated'].mockReturnValue(of([mockRecipes[0]]));

      await search('burger');

      expect(component.currentPage()).toBe(1);
      expect(mockRecipeService['getAll']).toHaveBeenCalledWith({ name: 'burger' });
      expect(mockRecipeService['getPaginated']).toHaveBeenCalledWith(
        1,
        component.pageSize,
        'burger',
      );
      expect(component.recipes().length).toBe(1);
    });

    it('should clear the search and reload all recipes', async () => {
      await search('burger');
      component.clearSearch();
      expect(component.searchTerm()).toBe('');

      await search('');
      expect(mockRecipeService['getAll']).toHaveBeenLastCalledWith({ name: undefined });
    });
  });

  it('should load the requested page when the page changes', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.currentPage.set(2);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockRecipeService['getPaginated']).toHaveBeenCalledWith(
      2,
      component.pageSize,
      undefined,
    );
  });

  it('should show empty state when no recipes match', async () => {
    mockRecipeService['getAll'].mockReturnValue(of([]));
    mockRecipeService['getPaginated'].mockReturnValue(of([]));

    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aucune recette trouvée');
  });

  it('should display error message on service failure', async () => {
    mockRecipeService['getAll'].mockReturnValue(throwError(() => new Error('Connexion perdue')));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.error()).toBe('Connexion perdue');
    expect(component.loading()).toBe(false);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Connexion perdue');
  });

  it('has no axe violations', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(await axeViolations(fixture)).toEqual([]);
  });
});
