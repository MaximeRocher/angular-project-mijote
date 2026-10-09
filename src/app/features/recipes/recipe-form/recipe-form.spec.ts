import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RecipeForm } from './recipe-form';
import { RecipeService } from '@/core/services/recipe.service';
import { IngredientService } from '@/core/services/ingredient.service';
import { Recipe } from '@/core/models/recipe.model';

describe('RecipeForm', () => {
  let component: RecipeForm;
  let fixture: ComponentFixture<RecipeForm>;
  let mockRecipeService: any;
  let mockIngredientService: any;
  let router: Router;

  const mockCreatedRecipe: Recipe = {
    id: '123',
    name: 'Tarte aux pommes',
    description: 'Une superbe tarte aux pommes dorée au four et bien croustillante.',
    composition: [
      { idIngredient: '1', quantity: 2 },
      { idIngredient: '2', quantity: 1 },
    ],
  };

  beforeEach(async () => {
    mockRecipeService = {
      create: vi.fn().mockReturnValue(of(mockCreatedRecipe)),
      validateRecipe: vi.fn().mockReturnValue({ valid: true, errors: [] }),
    };

    mockIngredientService = {
      ingredients: vi.fn().mockReturnValue([
        { id: '1', name: 'Pommes' },
        { id: '2', name: 'Pâte brisée' },
        { id: '3', name: 'Sucre' },
      ]),
      loadAll: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [RecipeForm],
      providers: [
        provideRouter([]),
        { provide: RecipeService, useValue: mockRecipeService },
        { provide: IngredientService, useValue: mockIngredientService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeForm);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the form component and initialize with 2 ingredients', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.composition.length).toBe(2);
    expect(mockIngredientService.loadAll).toHaveBeenCalled();
  });

  it('should be invalid when form fields are empty', () => {
    expect(component.form.valid).toBe(false);
    expect(component.form.get('name')?.valid).toBe(false);
    expect(component.form.get('description')?.valid).toBe(false);
  });

  it('should validate description length strictly (>= 30 characters)', () => {
    const descControl = component.form.get('description');
    descControl?.setValue('Court');
    expect(descControl?.valid).toBe(false);

    descControl?.setValue('Une description de plus de trente caractères pour le test');
    expect(descControl?.valid).toBe(true);
  });

  it('should add a new ingredient row with addIngredient()', () => {
    expect(component.composition.length).toBe(2);
    component.addIngredient();
    expect(component.composition.length).toBe(3);
  });

  it('should allow removing ingredients only when more than 2 exist', () => {
    component.addIngredient(); // 3 rows
    expect(component.composition.length).toBe(3);

    component.removeIngredient(2); // removes to 2 rows
    expect(component.composition.length).toBe(2);

    // Try removing when only 2 rows left - should NOT remove
    component.removeIngredient(1);
    expect(component.composition.length).toBe(2);
  });

  it('should mark all fields touched and not submit when form is invalid', () => {
    component.onSubmit();
    expect(component.form.touched).toBe(true);
    expect(mockRecipeService.create).not.toHaveBeenCalled();
  });

  it('should submit successfully and navigate to /recipes when valid', () => {
    vi.useFakeTimers();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.form.patchValue({
      name: 'Tarte aux pommes',
      description: 'Une superbe tarte aux pommes dorée au four et bien croustillante.',
    });

    component.composition.at(0).patchValue({
      idIngredient: '1',
      quantity: 2,
    });
    component.composition.at(1).patchValue({
      idIngredient: '2',
      quantity: 1,
    });

    expect(component.form.valid).toBe(true);

    component.onSubmit();

    expect(mockRecipeService.create).toHaveBeenCalledWith({
      name: 'Tarte aux pommes',
      description: 'Une superbe tarte aux pommes dorée au four et bien croustillante.',
      composition: [
        { idIngredient: '1', quantity: 2 },
        { idIngredient: '2', quantity: 1 },
      ],
    });

    expect(component.successMessage()).toContain('Tarte aux pommes');

    vi.advanceTimersByTime(1000);
    expect(navigateSpy).toHaveBeenCalledWith(['/recipes']);
    vi.useRealTimers();
  });

  it('should display error message when creation fails', () => {
    mockRecipeService.create.mockReturnValue(
      throwError(() => new Error('Erreur de connexion au serveur API'))
    );

    component.form.patchValue({
      name: 'Tarte aux pommes',
      description: 'Une superbe tarte aux pommes dorée au four et bien croustillante.',
    });
    component.composition.at(0).patchValue({ idIngredient: '1', quantity: 2 });
    component.composition.at(1).patchValue({ idIngredient: '2', quantity: 1 });

    component.onSubmit();

    expect(component.submitting()).toBe(false);
    expect(component.errorMessage()).toBe('Erreur de connexion au serveur API');
  });
});
