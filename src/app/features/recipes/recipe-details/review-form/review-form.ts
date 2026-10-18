import { Component, computed, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TablerIconComponent } from '@tabler/icons-angular';
import { form, FormField, FormRoot, max, maxLength, min } from '@angular/forms/signals';
import { Recipe, RecipeRate } from '@/core/models/recipe.model';
import { AuthService } from '@/core/services/auth.service';
import { RecipeService } from '@/core/services/recipe.service';
import { errorMessage } from '@/core/utils/error-message';

const STARS = [1, 2, 3, 4, 5];

@Component({
  selector: 'app-review-form',
  imports: [FormField, FormRoot, TablerIconComponent],
  templateUrl: './review-form.html',
  styleUrl: './review-form.css',
})
export class ReviewForm {
  private readonly recipeService = inject(RecipeService);
  private readonly auth = inject(AuthService);

  readonly recipeId = input.required<string>();
  /** Emits the recipe returned by the API once the review is saved. */
  readonly reviewAdded = output<Recipe>();

  protected readonly author = computed(() => this.auth.user()?.login ?? 'Gourmet Anonyme');
  protected readonly initials = computed(() => this.author().slice(0, 2).toUpperCase());

  readonly submitting = signal(false);
  readonly success = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  private readonly hovered = signal<number | null>(null);

  readonly model = signal({ rate: 5, review: '' });
  readonly form = form(
    this.model,
    (path) => {
      min(path.rate, 1);
      max(path.rate, 5);
      maxLength(path.review, 500);
    },
    { submission: { action: () => this.submit() } },
  );

  protected readonly stars = computed(() => {
    const shown = this.hovered() ?? this.model().rate;
    return STARS.map((value) => ({ value, active: value <= shown }));
  });

  setRating(rate: number): void {
    this.model.update((m) => ({ ...m, rate: Math.min(5, Math.max(1, rate)) }));
  }

  hover(rate: number | null): void {
    this.hovered.set(rate);
  }

  onStarKey(event: Event, rate: number): void {
    event.preventDefault();
    this.setRating(rate);
    const group = (event.target as HTMLElement | null)?.parentElement;
    group?.querySelectorAll<HTMLElement>('[role=radio]')[this.model().rate - 1]?.focus();
  }

  private async submit(): Promise<undefined> {
    const { rate, review } = this.model();
    const newRate: RecipeRate = {
      login: this.author(),
      rate,
      review: review.trim() || undefined,
    };

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      const updated = await firstValueFrom(this.recipeService.addRate(this.recipeId(), newRate));
      this.success.set('Votre avis a été publié avec succès !');
      this.model.set({ rate: 5, review: '' });
      this.form().reset();
      this.reviewAdded.emit(updated);
    } catch (err) {
      this.error.set(
        errorMessage(err, "Une erreur est survenue lors de l'enregistrement de votre avis."),
      );
    } finally {
      this.submitting.set(false);
    }
  }
}
