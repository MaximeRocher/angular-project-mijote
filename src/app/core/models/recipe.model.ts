export interface RecipeIngredient {
  idIngredient: number | string;
  quantity: number;
}

export interface RecipeRate {
  login: string;
  rate: number;
  review?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  composition: RecipeIngredient[];
  rates?: RecipeRate[];
}

export type CreateRecipeDto = Omit<Recipe, 'id'>;

export interface RecipeQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  name?: string;
}
