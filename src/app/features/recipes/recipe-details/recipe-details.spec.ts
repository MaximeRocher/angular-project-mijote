import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RecipeDetails } from './recipe-details';
import { RecipeService } from '@/core/services/recipe.service';
import { IngredientService } from '@/core/services/ingredient.service';
import { AuthService } from '@/core/services/auth.service';
import { GsapService } from '@/core/services/gsap.service';
import { Recipe, RecipeRate } from '@/core/models/recipe.model';
import { provideAppIcons } from '@/core/icons';
import { axeViolations } from '@/testing-a11y';

describe('RecipeDetails', () => {
  let component: RecipeDetails;
  let fixture: ComponentFixture<RecipeDetails>;
  let mockRecipeService: {
    getById: ReturnType<typeof vi.fn>;
    addRate: ReturnType<typeof vi.fn>;
  };
  let mockIngredientService: {
    loadAll: ReturnType<typeof vi.fn>;
    getIngredientName: ReturnType<typeof vi.fn>;
  };
  let mockAuthService: {
    user: ReturnType<typeof vi.fn>;
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

  beforeEach(async () => {
    mockRecipeService = {
      getById: vi.fn().mockReturnValue(of(sampleRecipe)),
      addRate: vi.fn().mockImplementation((id: string, rate: RecipeRate) =>
        of({
          ...sampleRecipe,
          rates: [...(sampleRecipe.rates || []), rate],
        })
      ),
    };

    mockIngredientService = {
      loadAll: vi.fn().mockReturnValue(of([])),
      getIngredientName: vi.fn().mockImplementation((id: string | number) => {
        if (String(id) === '1') return 'Tomate';
        if (String(id) === '2') return 'Courgette';
        return `Ingrédient #${id}`;
      }),
    };

    mockAuthService = {
      user: vi.fn().mockReturnValue({ login: 'ChefJulien' }),
    };

    await TestBed.configureTestingModule({
      imports: [RecipeDetails],
      providers: [
        provideRouter([]),
        provideAppIcons(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? '42' : null),
              },
            },
          },
        },
        { provide: RecipeService, useValue: mockRecipeService },
        { provide: IngredientService, useValue: mockIngredientService },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: GsapService,
          useValue: {
            prefersReducedMotion: () => true, // skip animation execution in tests
            createContext: () => ({ add: (cb: () => void) => cb(), revert: () => {} }),
            cleanupContext: () => {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeDetails);
    component = fixture.componentInstance;
  });

  it('should create and load recipe details on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component).toBeTruthy();
    expect(mockRecipeService.getById).toHaveBeenCalledWith('42');
    expect(component.recipe()?.name).toBe('Ratatouille Traditionnelle');
    expect(component.loading()).toBe(false);
  });

  it('should display recipe name, description, and resolved ingredients', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Ratatouille Traditionnelle');
    expect(compiled.querySelector('.recipe-description')?.textContent).toContain(
      'Une ratatouille provençale savoureuse'
    );

    const ingredientItems = compiled.querySelectorAll('.ingredient-pill');
    expect(ingredientItems.length).toBe(2);
    expect(ingredientItems[0]?.textContent).toContain('Tomate');
    expect(ingredientItems[0]?.textContent).toContain('Qté : 3');
    expect(ingredientItems[1]?.textContent).toContain('Courgette');
    expect(ingredientItems[1]?.textContent).toContain('Qté : 2');
  });

  it('should compute and render rating summary correctly', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const ratingInfo = component.ratingInfo();
    expect(ratingInfo).toEqual({
      average: 4.5,
      count: 2,
      ariaLabel: 'Note moyenne de 4.5 sur 5, basée sur 2 avis',
    });

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('4.5 / 5');
    expect(compiled.textContent).toContain('2 avis de la communauté');
  });

  it('should list all existing reviews with author, rating, and comment', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const reviewCards = compiled.querySelectorAll('.review-card');
    expect(reviewCards.length).toBe(2);

    expect(reviewCards[0]?.textContent).toContain('Sophie');
    expect(reviewCards[0]?.textContent).toContain('Absolument délicieux !');

    expect(reviewCards[1]?.textContent).toContain('Lucas');
    expect(reviewCards[1]?.textContent).toContain('Très bonne recette facile à faire.');
  });

  it('should display empty state when recipe has no reviews', async () => {
    const unratedRecipe: Recipe = {
      ...sampleRecipe,
      rates: [],
    };
    mockRecipeService.getById.mockReturnValue(of(unratedRecipe));

    component.loadRecipe();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.ratingInfo()).toBeNull();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aucun avis pour l');
  });

  it('should handle star rating selection and hover state', () => {
    fixture.detectChanges();

    expect(component.reviewForm.controls.rate.value).toBe(5);

    component.setRating(3);
    expect(component.reviewForm.controls.rate.value).toBe(3);

    component.hoverRating(4);
    expect(component.isStarActive(4)).toBe(true);
    expect(component.isStarActive(5)).toBe(false);

    component.clearHoverRating();
    expect(component.isStarActive(3)).toBe(true);
    expect(component.isStarActive(4)).toBe(false);
  });

  it('should submit a new review and update recipe and review form', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.setRating(5);
    component.reviewForm.controls.review.setValue('Test review extra !');

    component.onSubmitReview();

    expect(mockRecipeService.addRate).toHaveBeenCalledWith('42', {
      login: 'ChefJulien',
      rate: 5,
      review: 'Test review extra !',
    });

    expect(component.reviewSuccess()).toBe('Votre avis a été publié avec succès !');
    expect(component.reviewForm.controls.review.value).toBe('');
    expect(component.recipe()?.rates?.length).toBe(3);
  });

  it('should handle submission error gracefully', async () => {
    mockRecipeService.addRate.mockReturnValue(
      throwError(() => new Error('Erreur de connexion serveur'))
    );

    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmitReview();

    expect(component.submittingReview()).toBe(false);
    expect(component.reviewError()).toBe('Erreur de connexion serveur');
  });

  it('should display error message when loading recipe fails', async () => {
    mockRecipeService.getById.mockReturnValue(
      throwError(() => new Error('Recette introuvable'))
    );

    component.loadRecipe();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('Recette introuvable');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Recette introuvable');
  });

  it('should show error when id is missing', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [RecipeDetails],
      providers: [
        provideRouter([]),
        provideAppIcons(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: RecipeService, useValue: mockRecipeService },
        { provide: IngredientService, useValue: mockIngredientService },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: GsapService,
          useValue: {
            prefersReducedMotion: () => true,
            createContext: () => ({ add: (cb: () => void) => cb(), revert: () => {} }),
            cleanupContext: () => {},
          },
        },
      ],
    }).compileComponents();

    const noIdFixture = TestBed.createComponent(RecipeDetails);
    noIdFixture.detectChanges();
    await noIdFixture.whenStable();

    expect(noIdFixture.componentInstance.error()).toBe('Identifiant de recette manquant.');
  });

  it('has no axe violations', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const violations = await axeViolations(fixture);
    expect(violations).toEqual([]);
  });
});
