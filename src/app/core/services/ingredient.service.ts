import { Service, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { Ingredient } from '@/core/models/ingredient.model';
import { errorMessage } from '@/core/utils/error-message';

@Service()
export class IngredientService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}${environment.endpoints.ingredients}`;

  readonly ingredients = signal<Ingredient[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly ingredientsMap = computed(() => {
    const map = new Map<string, Ingredient>();
    for (const ingredient of this.ingredients()) {
      map.set(String(ingredient.id), ingredient);
    }
    return map;
  });

  /** Fetches the ingredients once; later calls are no-ops unless the last attempt failed. */
  load(): void {
    if (this.loading() || this.ingredients().length > 0) return;
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Ingredient[]>(this.url).subscribe({
      next: (ingredients) => {
        this.ingredients.set(ingredients);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(errorMessage(err, 'Erreur lors du chargement des ingrédients'));
        this.loading.set(false);
      },
    });
  }

  getIngredientName(id: string | number): string | undefined {
    return this.ingredientsMap().get(String(id))?.name;
  }
}
