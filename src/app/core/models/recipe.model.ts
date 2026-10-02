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

export interface RecipeQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  name?: string;
  search?: string;
}

export interface RecipeValidationError {
  field: "name" | "description" | "composition";
  message: string;
}

export interface RecipeValidationResult {
  valid: boolean;
  errors: RecipeValidationError[];
}
