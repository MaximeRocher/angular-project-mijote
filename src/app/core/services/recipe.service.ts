import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '@/environments/environment';
import {
  Recipe,
  RecipeRate,
  CreateRecipeDto,
  RecipeQueryOptions,
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

    return this.http.get<Recipe[]>(this.url, { params });
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
}
