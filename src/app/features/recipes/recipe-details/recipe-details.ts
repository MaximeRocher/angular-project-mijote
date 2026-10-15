import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { TablerIconComponent } from '@tabler/icons-angular';
import { Recipe } from '@/core/models/recipe.model';
import { RecipeService } from '@/core/services/recipe.service';
import { IngredientService } from '@/core/services/ingredient.service';
import { GsapService } from '@/core/services/gsap.service';
import { errorMessage } from '@/core/utils/error-message';
import { ratingInfo } from '@/shared/utils/rating';
import { ReviewForm } from './review-form/review-form';
import { ReviewList } from './review-list/review-list';

@Component({
  selector: 'app-recipe-details',
  imports: [RouterLink, TablerIconComponent, ReviewForm, ReviewList],
  templateUrl: './recipe-details.html',
  styleUrl: './recipe-details.css',
})
export class RecipeDetails {
  private readonly recipeService = inject(RecipeService);
  private readonly ingredientService = inject(IngredientService);
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly el = inject(ElementRef);
  private readonly title = inject(Title);

  /** Bound from the `:id` route param (withComponentInputBinding). */
  readonly id = input.required<string>();

  private readonly resource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.recipeService.getById(params),
  });

  readonly recipe = computed<Recipe | undefined>(() =>
    this.resource.hasValue() ? this.resource.value() : undefined,
  );
  readonly loading = this.resource.isLoading;
  readonly error = computed(() => {
    const err = this.resource.error();
    return err ? errorMessage(err, 'Impossible de charger la recette demandée.') : null;
  });

  readonly ratingInfo = computed(() => ratingInfo(this.recipe()?.rates));
  readonly ingredients = computed(() =>
    (this.recipe()?.composition ?? []).map((c) => ({
      name:
        this.ingredientService.getIngredientName(c.idIngredient) ?? `Ingrédient #${c.idIngredient}`,
      quantity: c.quantity,
    })),
  );

  constructor() {
    this.ingredientService.load();

    effect(() => {
      const recipe = this.recipe();
      if (recipe) this.title.setTitle(`${recipe.name} - Mijoté`);
    });

    afterNextRender(() => this.initAnimations());
  }

  reloadRecipe(): void {
    this.resource.reload();
  }

  onReviewAdded(updated: Recipe): void {
    this.resource.value.set(updated);
    afterNextRender(() => this.animateNewReview(), { injector: this.injector });
  }

  private initAnimations(): void {
    if (this.gsapService.prefersReducedMotion()) return;

    const host = this.el.nativeElement as HTMLElement;
    const ctx = this.gsapService.createContext(host);
    ctx.add(() => {
      const elements = [
        '.recipe-hero',
        '.recipe-description',
        '.recipe-ingredients',
        '.recipe-add-review',
        '.recipe-reviews-list',
      ]
        .map((selector) => host.querySelector(selector))
        .filter(Boolean);
      if (elements.length > 0) {
        gsap.from(elements, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
        });
      }
    });

    this.destroyRef.onDestroy(() => this.gsapService.cleanupContext(ctx));
  }

  private animateNewReview(): void {
    if (this.gsapService.prefersReducedMotion()) return;

    const host = this.el.nativeElement as HTMLElement;
    const successBanner = host.querySelector('.review-success-banner');
    if (successBanner) {
      gsap.from(successBanner, { scale: 0.9, opacity: 0, duration: 0.4, ease: 'back.out(1.7)' });
    }

    const lastCard = [...host.querySelectorAll('.review-card')].pop();
    if (lastCard) {
      gsap.from(lastCard, {
        scale: 0.95,
        backgroundColor: '#e6f0c8',
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  }
}
