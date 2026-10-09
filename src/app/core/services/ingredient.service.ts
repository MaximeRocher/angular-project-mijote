import { Service, inject, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap, catchError, throwError } from "rxjs";
import { environment } from "@/environments/environment";
import { Ingredient } from "@/core/models/ingredient.model";

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

  getAll(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(this.url);
  }

  getById(id: string | number): Observable<Ingredient> {
    return this.http.get<Ingredient>(`${this.url}/${id}`);
  }

  loadAll(): Observable<Ingredient[]> {
    this.loading.set(true);
    this.error.set(null);
    return this.getAll().pipe(
      tap((ingredients) => {
        this.ingredients.set(ingredients);
        this.loading.set(false);
      }),
      catchError((err: unknown) => {
        const message =
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des ingrédients";
        this.error.set(message);
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  getIngredientName(id: string | number): string | undefined {
    return this.ingredientsMap().get(String(id))?.name;
  }
}
