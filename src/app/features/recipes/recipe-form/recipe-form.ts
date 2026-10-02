import { Component, inject, signal, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { RecipeService } from "@/core/services/recipe.service";
import { IngredientService } from "@/core/services/ingredient.service";
import { CreateRecipeDto } from "@/core/models/recipe.model";

export type IngredientFormGroup = FormGroup<{
  idIngredient: FormControl<string>;
  quantity: FormControl<number>;
}>;

@Component({
  selector: "app-recipe-form",
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: "./recipe-form.html",
  styleUrl: "./recipe-form.css",
})
export class RecipeForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly recipeService = inject(RecipeService);
  protected readonly ingredientService = inject(IngredientService);
  private readonly router = inject(Router);

  readonly submitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    name: this.fb.control("", {
      nonNullable: true,
      validators: [
        Validators.required,
        (c: AbstractControl): ValidationErrors | null =>
          typeof c.value === "string" && c.value.trim().length > 0
            ? null
            : { required: true },
      ],
    }),
    description: this.fb.control("", {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(30)],
    }),
    composition: this.fb.array<IngredientFormGroup>(
      [this.createIngredientGroup(), this.createIngredientGroup()],
      [
        (c: AbstractControl): ValidationErrors | null => {
          const arr = c as FormArray;
          return arr.length >= 2 ? null : { minIngredients: true };
        },
      ]
    ),
  });

  get composition(): FormArray<IngredientFormGroup> {
    return this.form.controls.composition;
  }

  ngOnInit(): void {
    this.ingredientService.loadAll().subscribe({ error: () => {} });
  }

  createIngredientGroup(idIngredient = "", quantity = 1): IngredientFormGroup {
    return this.fb.group({
      idIngredient: this.fb.control(idIngredient, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      quantity: this.fb.control(quantity, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
    });
  }

  addIngredient(): void {
    this.composition.push(this.createIngredientGroup());
  }

  removeIngredient(index: number): void {
    if (this.composition.length > 2) {
      this.composition.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue();
    const recipeDto: CreateRecipeDto = {
      name: val.name.trim(),
      description: val.description.trim(),
      composition: val.composition.map((c) => ({
        idIngredient: c.idIngredient,
        quantity: c.quantity || 1,
      })),
    };

    // Validate using RecipeService business rules
    const validation = this.recipeService.validateRecipe(recipeDto);
    if (!validation.valid) {
      this.errorMessage.set(validation.errors.map((e) => e.message).join(" "));
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.recipeService.create(recipeDto).subscribe({
      next: (created) => {
        this.submitting.set(false);
        this.successMessage.set(
          `La recette "${created.name}" a été créée avec succès ! Redirection en cours...`
        );
        setTimeout(() => {
          this.router.navigate(["/recipes"]);
        }, 1000);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        const msg =
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la création de la recette.";
        this.errorMessage.set(msg);
      },
    });
  }
}
