import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  input,
  ElementRef,
  DestroyRef,
  afterNextRender,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { gsap } from 'gsap';
import { Recipe, RecipeRate } from '@/core/models/recipe.model';
import { RecipeService } from '@/core/services/recipe.service';
import { IngredientService } from '@/core/services/ingredient.service';
import { AuthService } from '@/core/services/auth.service';
import { GsapService } from '@/core/services/gsap.service';
import { TablerIconComponent } from '@tabler/icons-angular';

@Component({
  selector: 'app-recipe-details',
  imports: [RouterLink, ReactiveFormsModule, TablerIconComponent],
  templateUrl: './recipe-details.html',
  styleUrl: './recipe-details.css',
})
export class RecipeDetails implements OnInit {
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly recipeService = inject(RecipeService);
  protected readonly ingredientService = inject(IngredientService);
  protected readonly authService = inject(AuthService);
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly el = inject(ElementRef);
  private readonly fb = inject(FormBuilder);

  protected readonly Math = Math;

  /** Optional input for router input binding or direct test injection */
  readonly id = input<string | undefined>(undefined);

  readonly recipe = signal<Recipe | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly submittingReview = signal<boolean>(false);
  readonly reviewSuccess = signal<string | null>(null);
  readonly reviewError = signal<string | null>(null);
  readonly hoveredRating = signal<number | null>(null);

  readonly reviewForm = this.fb.group({
    rate: this.fb.control<number>(5, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(5)],
    }),
    review: this.fb.control<string>('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });

  readonly currentAuthor = computed(() => {
    return this.authService.user()?.login ?? 'Gourmet Anonyme';
  });

  readonly ratingInfo = computed(() => {
    const current = this.recipe();
    const rates = current?.rates;
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
      ariaLabel: `Note moyenne de ${average} sur 5, basée sur ${count} avis`,
    };
  });

  private get recipeId(): string | null {
    return this.id() || this.route?.snapshot.paramMap.get('id') || null;
  }

  constructor() {
    afterNextRender(() => {
      this.initAnimations();
    });
  }

  ngOnInit(): void {
    // Load ingredients in case they aren't preloaded
    this.ingredientService.loadAll().subscribe({ error: () => {} });
    this.loadRecipe();
  }

  loadRecipe(): void {
    const id = this.recipeId;
    if (!id) {
      this.error.set('Identifiant de recette manquant.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.recipeService.getById(id).subscribe({
      next: (data) => {
        this.recipe.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        const msg =
          err instanceof Error
            ? err.message
            : 'Impossible de charger la recette demandée.';
        this.error.set(msg);
        this.loading.set(false);
      },
    });
  }

  reloadRecipe(): void {
    this.loadRecipe();
  }

  getIngredientName(idIngredient: string | number): string {
    return this.ingredientService.getIngredientName(idIngredient) ?? `Ingrédient #${idIngredient}`;
  }

  setRating(rating: number): void {
    this.reviewForm.controls.rate.setValue(rating);
    this.reviewForm.controls.rate.markAsDirty();
  }

  hoverRating(rating: number): void {
    this.hoveredRating.set(rating);
  }

  clearHoverRating(): void {
    this.hoveredRating.set(null);
  }

  isStarActive(star: number): boolean {
    const currentHover = this.hoveredRating();
    if (currentHover !== null) {
      return star <= currentHover;
    }
    return star <= this.reviewForm.controls.rate.value;
  }

  onSubmitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const currentRecipe = this.recipe();
    if (!currentRecipe) return;

    const newRate: RecipeRate = {
      login: this.currentAuthor(),
      rate: this.reviewForm.controls.rate.value,
      review: this.reviewForm.controls.review.value.trim() || undefined,
    };

    this.submittingReview.set(true);
    this.reviewError.set(null);
    this.reviewSuccess.set(null);

    this.recipeService.addRate(currentRecipe.id, newRate).subscribe({
      next: (updatedRecipe) => {
        this.recipe.set(updatedRecipe);
        this.submittingReview.set(false);
        this.reviewSuccess.set('Votre avis a été publié avec succès !');
        this.reviewForm.controls.review.reset('');
        this.reviewForm.controls.rate.setValue(5);

        this.animateNewReview();
      },
      error: (err: unknown) => {
        this.submittingReview.set(false);
        const msg =
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de l'enregistrement de votre avis.";
        this.reviewError.set(msg);
      },
    });
  }

  private initAnimations(): void {
    if (this.gsapService.prefersReducedMotion()) return;

    const host = this.el.nativeElement as HTMLElement;
    if (!host) return;

    const ctx = this.gsapService.createContext(host);
    ctx.add(() => {
      const hero = host.querySelector('.recipe-hero');
      const desc = host.querySelector('.recipe-description');
      const ingredients = host.querySelector('.recipe-ingredients');
      const addReview = host.querySelector('.recipe-add-review');
      const reviewsList = host.querySelector('.recipe-reviews-list');

      const elements = [hero, desc, ingredients, addReview, reviewsList].filter(Boolean);
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

    this.destroyRef.onDestroy(() => {
      this.gsapService.cleanupContext(ctx);
    });
  }

  private animateNewReview(): void {
    if (this.gsapService.prefersReducedMotion()) return;

    const host = this.el.nativeElement as HTMLElement;
    if (!host) return;

    const successBanner = host.querySelector('.review-success-banner');
    if (successBanner) {
      gsap.from(successBanner, {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        ease: 'back.out(1.7)',
      });
    }

    const reviewCards = host.querySelectorAll('.review-card');
    if (reviewCards.length > 0) {
      const lastCard = reviewCards[reviewCards.length - 1];
      gsap.from(lastCard, {
        scale: 0.95,
        backgroundColor: '#e6f0c8',
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  }
}
