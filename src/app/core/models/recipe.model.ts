export interface RecipeIngredient {
  idIngredient: number | string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  composition: RecipeIngredient[];
}

export type CreateRecipeDto = Omit<Recipe, "id">;
