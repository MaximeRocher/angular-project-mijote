import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '@/environments/environment';
import {
  Recipe,
  RecipeRate,
  CreateRecipeDto,
  RecipeQueryOptions,
  RecipeValidationResult,
  RecipeValidationError,
} from '@/core/models/recipe.model';

@Service()
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}${environment.endpoints.recipes}`;

  /**
   * Fetches recipes with optional pagination, sorting, or name search.
   */
  getAll(options?: RecipeQueryOptions): Observable<Recipe[]> {
    let params = new HttpParams();
    if (options?.page !== undefined) params = params.set('page', options.page.toString());
    if (options?.limit !== undefined) params = params.set('limit', options.limit.toString());
    if (options?.sortBy) params = params.set('sortBy', options.sortBy);
    if (options?.order) params = params.set('order', options.order);
    if (options?.name) params = params.set('name', options.name);
    if (options?.search) params = params.set('search', options.search);

    return this.http.get<Recipe[]>(this.url, { params });
  }

  /**
   * Fetches the 5 most recent recipes (sorted by ID descending).
   */
  getLatest(limit = 5): Observable<Recipe[]> {
    return this.getAll({
      sortBy: 'id',
      order: 'desc',
      page: 1,
      limit,
    });
  }

  /**
   * Fetches paginated recipes with optional name search.
   */
  getPaginated(
    page: number,
    limit = environment.defaultPageSize,
    name?: string,
  ): Observable<Recipe[]> {
    return this.getAll({
      page,
      limit,
      name: name?.trim() ? name.trim() : undefined,
    });
  }

  /**
   * Fetches a single recipe by its ID.
   */
  getById(id: string | number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.url}/${id}`);
  }

  /**
   * Creates a new recipe.
   */
  create(recipe: CreateRecipeDto): Observable<Recipe> {
    return this.http.post<Recipe>(this.url, recipe);
  }

  /**
   * Updates an existing recipe.
   */
  update(id: string | number, recipe: Partial<CreateRecipeDto>): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.url}/${id}`, recipe);
  }

  /**
   * Adds a new rating/review to a recipe and persists the updated recipe.
   */
  addRate(id: string | number, rate: RecipeRate): Observable<Recipe> {
    return this.getById(id).pipe(
      switchMap((recipe) => this.update(id, { ...recipe, rates: [...(recipe.rates ?? []), rate] })),
    );
  }

  /**
   * Deletes a recipe by ID.
   */
  delete(id: string | number): Observable<Recipe> {
    return this.http.delete<Recipe>(`${this.url}/${id}`);
  }

  /**
   * Validates recipe according to business rules:
   * - Name is mandatory
   * - Description >= 30 characters
   * - Composition >= 2 ingredients with quantity > 0
   */
  validateRecipe(recipe: Partial<CreateRecipeDto>): RecipeValidationResult {
    const errors: RecipeValidationError[] = [];

    if (!recipe.name || recipe.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Le nom de la recette est obligatoire.' });
    }

    if (!recipe.description || recipe.description.trim().length < 30) {
      errors.push({
        field: 'description',
        message: 'La description doit contenir au moins 30 caractères.',
      });
    }

    if (!recipe.composition || recipe.composition.length < 2) {
      errors.push({
        field: 'composition',
        message: "La recette doit être composée d'au moins 2 ingrédients.",
      });
    } else {
      const hasInvalidQuantity = recipe.composition.some(
        (item) => !item.quantity || item.quantity <= 0,
      );
      if (hasInvalidQuantity) {
        errors.push({
          field: 'composition',
          message: 'Chaque ingrédient doit avoir une quantité supérieure à 0.',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
