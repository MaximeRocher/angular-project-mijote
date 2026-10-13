import { Component, input, output, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Recipe } from "@/core/models/recipe.model";
import { IngredientService } from "@/core/services/ingredient.service";
import { Tilt3dDirective } from "@/shared/directives/tilt-3d.directive";
import { CulinaryIconComponent } from "@/shared/components/culinary-art/culinary-icon.component";

@Component({
  selector: "app-recipe-card",
  imports: [RouterLink, Tilt3dDirective, CulinaryIconComponent],
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

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.delete.emit(this.recipe().id);
  }

  readonly displayedDescription = computed(() => {
    const desc = this.recipe().description || "";
    if (this.truncateDescription()) {
      const max = this.maxDescriptionLength();
      return desc.length > max ? `${desc.slice(0, max)}…` : desc;
    }
    return desc;
  });

  readonly ratingInfo = computed(() => {
    const rates = this.recipe().rates;
    if (!rates || rates.length === 0) {
      return null;
    }
    const sum = rates.reduce((acc, curr) => acc + (Number(curr.rate) || 0), 0);
    const avg = sum / rates.length;
    const average = Math.round(avg * 10) / 10;
    const count = rates.length;
    return {
      average,
      count,
      label: `${count} avis`,
      ariaLabel: `Note moyenne de ${average} sur 5, basée sur ${count} avis`,
    };
  });

  getIngredientName(id: string | number): string {
    return this.ingredientService?.getIngredientName(id) ?? `Ingrédient #${id}`;
  }
}
