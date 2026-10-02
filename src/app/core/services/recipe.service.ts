import { httpResource } from '@angular/common/http';
import { computed, Service } from '@angular/core';
import { Recipe } from '../models/recipe.model';

const RECIPES_URL = 'https://6ab976bcf84897980b729a5b.mockapi.io/recipies';
const LATEST_COUNT = 5;

@Service()
export class RecipeService {
  private readonly recipes = httpResource<Recipe[]>(() => RECIPES_URL);

  readonly isLoading = this.recipes.isLoading;
  readonly error = this.recipes.error;

  /** The most recent recipes (highest ids first). */
  readonly latest = computed(() =>
    [...(this.recipes.value() ?? [])]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, LATEST_COUNT),
  );
}
