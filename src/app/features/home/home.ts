import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { RecipeService } from '../../core/services/recipe.service';
import { HighlightDirective } from '../../shared/directives/highlight.directive';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { StaggerListDirective } from '../../shared/directives/stagger-list.directive';
import { CulinaryIconComponent } from '../../shared/components/culinary-art/culinary-icon.component';
import { CocottePotComponent } from '../../shared/components/culinary-art/cocotte-pot.component';

@Component({
  selector: 'app-home',
  imports: [
    HighlightDirective,
    TruncatePipe,
    StaggerListDirective,
    CulinaryIconComponent,
    CocottePotComponent,
  ],
  styleUrl: './home.css',
  template: `
    <div class="page">
      <header class="welcome-banner">
        <div class="welcome-text">
          <div class="welcome-badge">
            <app-culinary-icon name="rosemary" [size]="16" />
            <span>Table de cuisine</span>
          </div>
          <h1>Bienvenue {{ auth.user()?.login }}</h1>
          <p class="welcome-sub">
            Retrouvez les dernières inspirations mijotées par la communauté.
          </p>
        </div>
        <div class="welcome-illustration" aria-hidden="true">
          <app-cocotte-pot [size]="'sm'" />
        </div>
      </header>

      <section aria-labelledby="latest-title">
        <div class="section-header">
          <h2 id="latest-title">Dernières recettes</h2>
          @if (!recipes.loading() && !recipes.error()) {
            <span class="recipe-counter">{{ recipes.latestRecipes().length }} recettes</span>
          }
        </div>

        @if (recipes.loading()) {
          <div class="loading-box" role="status" aria-live="polite">
            <div class="spinner"></div>
            <p>Chargement…</p>
          </div>
        } @else if (recipes.error()) {
          <p class="error-msg" role="alert">Impossible de charger les recettes.</p>
        } @else {
          <ul class="recipes" appStaggerList>
            @for (recipe of recipes.latestRecipes(); track recipe.id) {
              <li appHighlight class="recipe-item">
                <div class="recipe-bullet" aria-hidden="true">
                  <app-culinary-icon name="flame" [size]="18" />
                </div>
                <div class="recipe-details">
                  <h3>{{ recipe.name }}</h3>
                  <p>{{ recipe.description | truncate }}</p>
                </div>
              </li>
            } @empty {
              <li class="empty-state">
                <app-culinary-icon name="rosemary" [size]="32" />
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

  constructor() {
    this.recipes.loadLatest().subscribe({ error: () => undefined });
  }
}

