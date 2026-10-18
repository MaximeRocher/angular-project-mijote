import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RecipeDetails } from './recipe-details';
import { RecipeService } from '@/core/services/recipe.service';
import { IngredientService } from '@/core/services/ingredient.service';
import { AuthService } from '@/core/services/auth.service';
import { GsapService } from '@/core/services/gsap.service';
import { Recipe } from '@/core/models/recipe.model';
import { provideAppIcons } from '@/core/icons';
import { axeViolations } from '@/testing-a11y';

describe('RecipeDetails', () => {
  let component: RecipeDetails;
  let fixture: ComponentFixture<RecipeDetails>;
  let mockRecipeService: {
    getById: ReturnType<typeof vi.fn>;
    addRate: ReturnType<typeof vi.fn>;
  };

  const sampleRecipe: Recipe = {
    id: '42',
    name: 'Ratatouille Traditionnelle',
    description: 'Une ratatouille provençale savoureuse mijotée à feu doux avec des légumes frais.',
    composition: [
      { idIngredient: '1', quantity: 3 },
      { idIngredient: '2', quantity: 2 },
    ],
    rates: [
      { login: 'Sophie', rate: 5, review: 'Absolument délicieux !' },
      { login: 'Lucas', rate: 4, review: 'Très bonne recette facile à faire.' },
    ],
  };

  async function render(): Promise<void> {
    fixture.componentRef.setInput('id', '42');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    mockRecipeService = {
      getById: vi.fn().mockReturnValue(of(sampleRecipe)),
      addRate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RecipeDetails],
      providers: [
        provideRouter([]),
        provideAppIcons(),
        { provide: RecipeService, useValue: mockRecipeService },
        {
          provide: IngredientService,
          useValue: {
            load: vi.fn(),
            getIngredientName: (id: string | number) =>
              ({ '1': 'Tomate', '2': 'Courgette' })[String(id)],
          },
        },
        { provide: AuthService, useValue: { user: () => ({ login: 'ChefJulien' }) } },
        {
          provide: GsapService,
          useValue: {
            prefersReducedMotion: () => true, // skip animation execution in tests
            createContext: () => ({ add: (cb: () => void) => cb(), revert: () => undefined }),
            cleanupContext: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeDetails);
    component = fixture.componentInstance;
  });

  it('loads the recipe of the bound id and puts its name in the tab title', async () => {
    await render();

    expect(mockRecipeService.getById).toHaveBeenCalledWith('42');
    expect(component.recipe()?.name).toBe('Ratatouille Traditionnelle');
    expect(component.loading()).toBe(false);
    expect(TestBed.inject(Title).getTitle()).toBe('Ratatouille Traditionnelle - Mijoté');
  });

  it('displays name, description and resolved ingredients', async () => {
    await render();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Ratatouille Traditionnelle');
    expect(compiled.querySelector('.recipe-description')?.textContent).toContain(
      'Une ratatouille provençale savoureuse',
    );

    const items = compiled.querySelectorAll('.ingredient-pill');
    expect(items.length).toBe(2);
    expect(items[0]?.textContent).toContain('Tomate');
    expect(items[0]?.textContent).toContain('Qté : 3');
    expect(items[1]?.textContent).toContain('Courgette');
  });

  it('renders the rating summary and every review', async () => {
    await render();

    expect(component.ratingInfo()?.average).toBe(4.5);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('4.5 / 5');
    expect(compiled.textContent).toContain('2 avis de la communauté');

    const cards = compiled.querySelectorAll('.review-card');
    expect(cards.length).toBe(2);
    expect(cards[0]?.textContent).toContain('Sophie');
    expect(cards[0]?.textContent).toContain('Absolument délicieux !');
    expect(cards[1]?.textContent).toContain('Lucas');
  });

  it('shows the empty state when the recipe has no reviews', async () => {
    mockRecipeService.getById.mockReturnValue(of({ ...sampleRecipe, rates: [] }));
    await render();

    expect(component.ratingInfo()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aucun avis pour l');
  });

  it('replaces the recipe when a review is added', async () => {
    await render();
    const updated = { ...sampleRecipe, rates: [...sampleRecipe.rates!, { login: 'Zoé', rate: 3 }] };

    component.onReviewAdded(updated);
    fixture.detectChanges();

    expect(component.recipe()?.rates?.length).toBe(3);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.review-card').length).toBe(3);
  });

  it('shows an error and can retry when loading fails', async () => {
    mockRecipeService.getById.mockReturnValue(throwError(() => new Error('Recette introuvable')));
    await render();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('Recette introuvable');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Recette introuvable');

    mockRecipeService.getById.mockReturnValue(of(sampleRecipe));
    component.reloadRecipe();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.recipe()?.name).toBe('Ratatouille Traditionnelle');
  });

  it('has no axe violations', async () => {
    await render();
    expect(await axeViolations(fixture)).toEqual([]);
  });
});
