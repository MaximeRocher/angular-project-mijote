import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TablerIconComponent } from '@tabler/icons-angular';
import {
  applyEach,
  form,
  FormField,
  FormRoot,
  min,
  required,
  validate,
} from '@angular/forms/signals';
import { RecipeService } from '@/core/services/recipe.service';
import { IngredientService } from '@/core/services/ingredient.service';
import { CreateRecipeDto } from '@/core/models/recipe.model';
import { errorMessage } from '@/core/utils/error-message';

const emptyRow = () => ({ idIngredient: '', quantity: 1 });

@Component({
  selector: 'app-recipe-form',
  imports: [RouterLink, FormField, FormRoot, TablerIconComponent],
  templateUrl: './recipe-form.html',
})
export class RecipeForm {
  private readonly recipeService = inject(RecipeService);
  protected readonly ingredientService = inject(IngredientService);
  private readonly router = inject(Router);

  readonly submitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly model = signal({
    name: '',
    description: '',
    composition: [emptyRow(), emptyRow()],
  });

  readonly form = form(
    this.model,
    (path) => {
      validate(path.name, ({ value }) =>
        value().trim()
          ? undefined
          : { kind: 'required', message: 'Le nom de la recette est obligatoire.' },
      );
      validate(path.description, ({ value }) =>
        value().trim().length >= 30
          ? undefined
          : { kind: 'minlength', message: 'La description doit comporter au moins 30 caractères.' },
      );
      applyEach(path.composition, (row) => {
        required(row.idIngredient, { message: 'Veuillez choisir un ingrédient.' });
        min(row.quantity, 1, { message: 'Quantité minimum : 1.' });
      });
      validate(path.composition, ({ value }) => {
        const ids = value()
          .map((row) => row.idIngredient)
          .filter(Boolean);
        return new Set(ids).size === ids.length
          ? undefined
          : {
              kind: 'duplicateIngredient',
              message: "Chaque ingrédient ne peut être choisi qu'une seule fois.",
            };
      });
    },
    { submission: { action: () => this.create() } },
  );

  private redirectTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.ingredientService.load();
    inject(DestroyRef).onDestroy(() => clearTimeout(this.redirectTimer));
  }

  addIngredient(): void {
    this.model.update((m) => ({ ...m, composition: [...m.composition, emptyRow()] }));
  }

  removeIngredient(index: number): void {
    if (this.model().composition.length > 2) {
      this.model.update((m) => ({
        ...m,
        composition: m.composition.filter((_, i) => i !== index),
      }));
    }
  }

  private async create(): Promise<undefined> {
    const { name, description, composition } = this.model();
    const dto: CreateRecipeDto = {
      name: name.trim(),
      description: description.trim(),
      // Copy the fields: Signal Forms tags array items with a tracking Symbol
      composition: composition.map(({ idIngredient, quantity }) => ({ idIngredient, quantity })),
    };

    this.submitting.set(true);
    this.errorMessage.set(null);
    try {
      const created = await firstValueFrom(this.recipeService.create(dto));
      this.successMessage.set(
        `La recette "${created.name}" a été créée avec succès ! Redirection en cours...`,
      );
      this.redirectTimer = setTimeout(() => void this.router.navigate(['/recipes']), 1000);
    } catch (err) {
      this.errorMessage.set(
        errorMessage(err, 'Une erreur est survenue lors de la création de la recette.'),
      );
    } finally {
      this.submitting.set(false);
    }
  }
}
