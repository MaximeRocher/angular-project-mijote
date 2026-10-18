import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TablerIconComponent } from '@tabler/icons-angular';
import { catchError, debounceTime, forkJoin, map, of, tap, throwError } from 'rxjs';
import { Recipe } from '@/core/models/recipe.model';
import { RecipeService } from '@/core/services/recipe.service';
import { IngredientService } from '@/core/services/ingredient.service';
import { RecipeCard } from '@/shared/components/recipe-card/recipe-card';
import { Pagination } from '@/shared/components/pagination/pagination';
import { StaggerListDirective } from '@/shared/directives/stagger-list.directive';
import { AppHttpError } from '@/core/interceptors/error.interceptor';
import { errorMessage } from '@/core/utils/error-message';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-recipes-list',
  imports: [
    RouterLink,
    RecipeCard,
    Pagination,
    StaggerListDirective,
    TablerIconComponent,
  ],
  templateUrl: './recipes-list.html',
})
export class RecipesList {
  private readonly recipeService = inject(RecipeService);

  readonly pageSize = environment.defaultPageSize;
  /** Raw input value; the request only follows it after a 300 ms pause. */
  readonly searchTerm = signal<string>('');
  private readonly debouncedSearch = toSignal(
    toObservable(this.searchTerm).pipe(
      debounceTime(300),
      map((term) => term.trim()),
    ),
    { initialValue: '' },
  );
  /** Back to page 1 whenever the search changes. */
  readonly currentPage = linkedSignal({ source: this.debouncedSearch, computation: () => 1 });
  readonly totalItems = signal<number>(0);

  // One resource cancels stale requests when page or search changes.
  private readonly page = rxResource({
    params: () => ({ page: this.currentPage(), search: this.debouncedSearch() || undefined }),
    stream: ({ params }) =>
      forkJoin([
        // MockAPI has no count endpoint: total = every match, items = the requested page.
        this.recipeService.getAll({ name: params.search }),
        this.recipeService.getPaginated(params.page, this.pageSize, params.search),
      ]).pipe(
        map(([all, items]) => ({ total: all.length, items })),
        // MockAPI answers 404 when nothing matches the search
        catchError((err: unknown) =>
          err instanceof AppHttpError && err.status === 404
            ? of({ total: 0, items: [] as Recipe[] })
            : throwError(() => err),
        ),
        tap(({ total }) => this.totalItems.set(total)),
      ),
  });

  readonly recipes = computed(() => (this.page.hasValue() ? this.page.value().items : []));
  readonly loading = this.page.isLoading;
  readonly error = computed(() => {
    const loadError = this.page.error();
    return loadError
      ? errorMessage(loadError, 'Impossible de charger les recettes pour le moment.')
      : null;
  });

  constructor() {
    // Preload ingredient names for composition badges
    inject(IngredientService).load();
  }

  retry(): void {
    this.page.reload();
  }

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }
}
