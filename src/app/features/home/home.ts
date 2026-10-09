import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { RecipeService } from '../../core/services/recipe.service';
import { HighlightDirective } from '../../shared/directives/highlight.directive';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-home',
  imports: [HighlightDirective, TruncatePipe],
  styleUrl: './home.css',
  template: `
    <div class="page">
      <h1>Bienvenue {{ auth.user()?.login }}</h1>

      <section aria-labelledby="latest-title">
        <h2 id="latest-title">Dernières recettes</h2>
        @if (recipes.loading()) {
          <p role="status">Chargement…</p>
        } @else if (recipes.error()) {
          <p role="alert">Impossible de charger les recettes.</p>
        } @else {
          <ul class="recipes">
            @for (recipe of recipes.latestRecipes(); track recipe.id) {
              <li appHighlight>
                <h3>{{ recipe.name }}</h3>
                <p>{{ recipe.description | truncate }}</p>
              </li>
            } @empty {
              <li>Aucune recette pour le moment.</li>
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
