import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TablerIconComponent } from '@tabler/icons-angular';
import { AuthService } from '../../core/services/auth.service';
import { RecipeService } from '../../core/services/recipe.service';
import { HighlightDirective } from '../../shared/directives/highlight.directive';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { ratingInfo } from '../../shared/utils/rating';
import { StaggerListDirective } from '../../shared/directives/stagger-list.directive';
import { CocottePotComponent } from '../../shared/components/culinary-art/cocotte-pot.component';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    HighlightDirective,
    TruncatePipe,
    StaggerListDirective,
    TablerIconComponent,
    CocottePotComponent,
  ],
  styleUrl: './home.css',
  template: `
    <div class="page">
      <header class="welcome-banner">
        <div class="welcome-text">
          <div class="welcome-badge">
            <tabler-icon icon="leaf" [size]="16" aria-hidden="true" />
            <span>Table de cuisine</span>
          </div>
          <h1>Bienvenue {{ auth.user()?.login }}</h1>
          <p class="welcome-sub">
            Retrouvez les dernières inspirations mijotées par la communauté.
          </p>
        </div>
        <div class="welcome-illustration" aria-hidden="true">
          <app-cocotte-pot size="sm" />
        </div>
      </header>

      <section aria-labelledby="latest-title">
        <div class="section-header">
          <h2 id="latest-title">Dernières recettes</h2>
          @if (!loading() && !failed()) {
            <span class="recipe-counter">{{ latest().length }} recettes</span>
          }
        </div>

        @if (loading()) {
          <div class="loading-box" role="status" aria-live="polite">
            <div class="spinner"></div>
            <p>Chargement…</p>
          </div>
        } @else if (failed()) {
          <p class="error-msg" role="alert">Impossible de charger les recettes.</p>
        } @else {
          <ul class="recipes" appStaggerList>
            @for (recipe of latest(); track recipe.id) {
              <li appHighlight class="recipe-item">
                <a [routerLink]="['/recipes', recipe.id]" class="recipe-item-link">
                  <div class="recipe-bullet" aria-hidden="true">
                    <tabler-icon icon="flame" [size]="18" />
                  </div>
                  <div class="recipe-details">
                    <h3>{{ recipe.name }}</h3>
                    <p>{{ recipe.description | truncate }}</p>
                    <p class="recipe-rating">
                      <span class="sr-only">{{
                        recipe.rating?.ariaLabel ?? 'Aucune note pour cette recette'
                      }}</span>
                      <span aria-hidden="true">{{
                        recipe.rating ? '★ ' + recipe.rating.average + ' / 5' : 'Non noté'
                      }}</span>
                    </p>
                  </div>
                </a>
              </li>
            } @empty {
              <li class="empty-state">
                <tabler-icon icon="leaf" [size]="32" aria-hidden="true" />
                <p>Aucune recette pour le moment.</p>
              </li>
            }
          </ul>
        }
      </section>
    </div>
  `,
})
export class Home {
  protected readonly auth = inject(AuthService);
  protected readonly recipes = inject(RecipeService);
  private readonly latestRecipes = rxResource({ stream: () => this.recipes.getLatest() });
  protected readonly loading = this.latestRecipes.isLoading;
  protected readonly failed = this.latestRecipes.error;
  protected readonly latest = computed(() =>
    (this.latestRecipes.hasValue() ? this.latestRecipes.value() : []).map((recipe) => ({
      ...recipe,
      rating: ratingInfo(recipe.rates),
    })),
  );
}
