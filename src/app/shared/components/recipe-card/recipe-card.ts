import { Component, input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TablerIconComponent } from '@tabler/icons-angular';
import { Recipe } from '@/core/models/recipe.model';
import { IngredientService } from '@/core/services/ingredient.service';
import { Tilt3dDirective } from '@/shared/directives/tilt-3d.directive';
import { ratingInfo } from '@/shared/utils/rating';

@Component({
  selector: 'app-recipe-card',
  imports: [RouterLink, TablerIconComponent, Tilt3dDirective],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.css',
})
export class RecipeCard {
  private readonly ingredientService = inject(IngredientService);

  readonly recipe = input.required<Recipe>();
  readonly truncateDescription = input<boolean>(false);
  readonly maxDescriptionLength = input<number>(15);
  readonly showIngredients = input<boolean>(true);

  readonly displayedDescription = computed(() => {
    const desc = this.recipe().description || '';
    if (this.truncateDescription()) {
      const max = this.maxDescriptionLength();
      return desc.length > max ? `${desc.slice(0, max)}…` : desc;
    }
    return desc;
  });

  readonly ratingInfo = computed(() => ratingInfo(this.recipe().rates));

  protected readonly ingredients = computed(() =>
    this.recipe().composition.map((c) => ({
      name: this.ingredientService.getIngredientName(c.idIngredient),
      quantity: c.quantity,
    })),
  );
}
