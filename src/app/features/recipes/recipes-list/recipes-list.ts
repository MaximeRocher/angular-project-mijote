import { Component, inject, signal, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Recipe } from "@/core/models/recipe.model";
import { RecipeService } from "@/core/services/recipe.service";
import { IngredientService } from "@/core/services/ingredient.service";
import { RecipeCard } from "@/shared/components/recipe-card/recipe-card";
import { Pagination } from "@/shared/components/pagination/pagination";
import { AppHttpError } from "@/core/interceptors/error.interceptor";
import { environment } from "@/environments/environment";

@Component({
  selector: "app-recipes-list",
  imports: [RouterLink, RecipeCard, Pagination],
  templateUrl: "./recipes-list.html",
  styleUrl: "./recipes-list.css",
})
export class RecipesList implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly ingredientService = inject(IngredientService);

  readonly pageSize = environment.defaultPageSize || 6;
  readonly currentPage = signal<number>(1);
  readonly searchTerm = signal<string>("");
  readonly recipes = signal<Recipe[]>([]);
  readonly totalItems = signal<number>(0);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    // Preload ingredient names for composition badges
    this.ingredientService.loadAll().subscribe({ error: () => {} });
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loading.set(true);
    this.error.set(null);
    const search = this.searchTerm().trim();

    // Fetch total matching recipes count for accurate pagination
    this.recipeService.getAll({ name: search || undefined }).subscribe({
      next: (allMatching) => {
        this.totalItems.set(allMatching.length);

        // Fetch paginated slice for current page
        this.recipeService
          .getPaginated(this.currentPage(), this.pageSize, search || undefined)
          .subscribe({
            next: (pageRecipes) => {
              this.recipes.set(pageRecipes);
              this.loading.set(false);
            },
            error: (err: unknown) => {
              this.handleError(err);
            },
          });
      },
      error: (err: unknown) => {
        // MockAPI returns 404 when no items match search query
        if (err instanceof AppHttpError && err.status === 404) {
          this.recipes.set([]);
          this.totalItems.set(0);
          this.loading.set(false);
          return;
        }
        this.handleError(err);
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadRecipes();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadRecipes();
  }

  onDeleteRecipe(id: string): void {
    const target = this.recipes().find((r) => r.id === id);
    const name = target ? `"${target.name}"` : "cette recette";

    if (confirm(`Voulez-vous vraiment supprimer ${name} ?`)) {
      this.recipeService.delete(id).subscribe({
        next: () => {
          // If we deleted the last item of a page, adjust current page
          if (this.recipes().length === 1 && this.currentPage() > 1) {
            this.currentPage.set(this.currentPage() - 1);
          }
          this.loadRecipes();
        },
        error: (err: unknown) => {
          this.error.set(
            err instanceof Error ? err.message : "Erreur lors de la suppression de la recette."
          );
        },
      });
    }
  }

  clearSearch(): void {
    this.onSearch("");
  }

  private handleError(err: unknown): void {
    const message =
      err instanceof Error ? err.message : "Impossible de charger les recettes pour le moment.";
    this.error.set(message);
    this.loading.set(false);
  }
}
