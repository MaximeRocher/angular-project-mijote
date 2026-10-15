import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { submit } from '@angular/forms/signals';
import { of, throwError } from 'rxjs';
import { RecipeForm } from './recipe-form';
import { RecipeService } from '@/core/services/recipe.service';
import { IngredientService } from '@/core/services/ingredient.service';
import { Recipe } from '@/core/models/recipe.model';
import { provideAppIcons } from '@/core/icons';
import { axeViolations } from '@/testing-a11y';

describe('RecipeForm', () => {
  let component: RecipeForm;
  let fixture: ComponentFixture<RecipeForm>;
  let recipeService: { create: ReturnType<typeof vi.fn>; validateRecipe: ReturnType<typeof vi.fn> };
  let ingredientService: { ingredients: ReturnType<typeof signal>; load: ReturnType<typeof vi.fn> };
  let router: Router;

  const created: Recipe = {
    id: '123',
    name: 'Tarte aux pommes',
    description: 'Une superbe tarte aux pommes dorée au four et bien croustillante.',
    composition: [
      { idIngredient: '1', quantity: 2 },
      { idIngredient: '2', quantity: 1 },
    ],
  };

  const validModel = {
    name: '  Tarte aux pommes ',
    description: 'Une superbe tarte aux pommes dorée au four et bien croustillante.',
    composition: [
      { idIngredient: '1', quantity: 2 },
      { idIngredient: '2', quantity: 1 },
    ],
  };

  beforeEach(async () => {
    recipeService = {
      create: vi.fn().mockReturnValue(of(created)),
      validateRecipe: vi.fn().mockReturnValue({ valid: true, errors: [] }),
    };
    ingredientService = {
      ingredients: signal([
        { id: '1', name: 'Pommes' },
        { id: '2', name: 'Pâte brisée' },
        { id: '3', name: 'Sucre' },
      ]),
      load: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RecipeForm],
      providers: [
        provideRouter([]),
        provideAppIcons(),
        { provide: RecipeService, useValue: recipeService },
        { provide: IngredientService, useValue: ingredientService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeForm);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => vi.useRealTimers());

  it('starts with 2 ingredient rows and loads the ingredient list', () => {
    expect(component.model().composition.length).toBe(2);
    expect(ingredientService.load).toHaveBeenCalled();
  });

  it('is invalid when empty', () => {
    expect(component.form().valid()).toBe(false);
    expect(component.form.name().valid()).toBe(false);
    expect(component.form.description().valid()).toBe(false);
  });

  it('requires a description of at least 30 characters', () => {
    component.form.description().value.set('Court');
    expect(component.form.description().valid()).toBe(false);

    component.form
      .description()
      .value.set('Une description de plus de trente caractères pour le test');
    expect(component.form.description().valid()).toBe(true);
  });

  it('rejects a whitespace-only name', () => {
    component.form.name().value.set('   ');
    expect(component.form.name().valid()).toBe(false);
  });

  it('rejects the same ingredient picked twice', () => {
    component.model.set({
      ...validModel,
      composition: [
        { idIngredient: '1', quantity: 1 },
        { idIngredient: '1', quantity: 1 },
      ],
    });
    expect(component.form.composition().valid()).toBe(false);

    component.form.composition[1].idIngredient().value.set('2');
    expect(component.form.composition().valid()).toBe(true);
  });

  it('never goes below 2 ingredient rows and can add more', () => {
    component.removeIngredient(0);
    expect(component.model().composition.length).toBe(2);

    component.addIngredient();
    expect(component.model().composition.length).toBe(3);
    component.removeIngredient(0);
    expect(component.model().composition.length).toBe(2);
  });

  it('does not submit an invalid form', async () => {
    await submit(component.form);
    expect(recipeService.create).not.toHaveBeenCalled();
  });

  it('creates the recipe with trimmed values then redirects', async () => {
    vi.useFakeTimers();
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.model.set(validModel);

    await submit(component.form);

    expect(recipeService.create).toHaveBeenCalledWith({
      name: 'Tarte aux pommes',
      description: validModel.description,
      composition: [
        { idIngredient: '1', quantity: 2 },
        { idIngredient: '2', quantity: 1 },
      ],
    });
    expect(component.successMessage()).toContain('Tarte aux pommes');
    expect(component.submitting()).toBe(false);

    vi.advanceTimersByTime(1000);
    expect(navigate).toHaveBeenCalledWith(['/recipes']);
  });

  it('shows the error when creation fails', async () => {
    recipeService.create.mockReturnValue(
      throwError(() => new Error('Erreur de connexion au serveur API')),
    );
    component.model.set(validModel);

    await submit(component.form);

    expect(component.submitting()).toBe(false);
    expect(component.errorMessage()).toBe('Erreur de connexion au serveur API');
    expect(component.successMessage()).toBeNull();
  });

  it('has no axe violations', async () => {
    expect(await axeViolations(fixture)).toEqual([]);
  });
});
