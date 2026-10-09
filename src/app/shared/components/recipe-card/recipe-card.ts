import { Component, input, output, computed, inject } from "@angular/core";
import { Recipe } from "@/core/models/recipe.model";
import { IngredientService } from "@/core/services/ingredient.service";

@Component({
  selector: "app-recipe-card",
  imports: [],
  templateUrl: "./recipe-card.html",
  styleUrl: "./recipe-card.css",
})
export class RecipeCard {
  protected readonly ingredientService = inject(IngredientService, { optional: true });

  readonly recipe = input.required<Recipe>();
  readonly truncateDescription = input<boolean>(false);
  readonly maxDescriptionLength = input<number>(15);
  readonly showIngredients = input<boolean>(true);
  readonly showActions = input<boolean>(false);

  readonly delete = output<string>();
  readonly selected = output<Recipe>();

  readonly displayedDescription = computed(() => {
    const desc = this.recipe().description || "";
    if (this.truncateDescription()) {
      return desc.slice(0, this.maxDescriptionLength());
    }
    return desc;
  });

  getIngredientName(id: string | number): string {
    return this.ingredientService?.getIngredientName(id) ?? `Ingrédient #${id}`;
  }
}
