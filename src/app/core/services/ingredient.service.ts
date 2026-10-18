import { Service, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { Ingredient } from '@/core/models/ingredient.model';

@Service()
export class IngredientService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}${environment.endpoints.ingredients}`;

  readonly ingredients = signal<Ingredient[]>([]);
  readonly loading = signal<boolean>(false);

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
    this.http.get<Ingredient[]>(this.url).subscribe({
      next: (ingredients) => {
        this.ingredients.set(ingredients);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getIngredientName(id: string | number): string {
    return this.ingredientsMap().get(String(id))?.name ?? `Ingrédient #${id}`;
  }
}
