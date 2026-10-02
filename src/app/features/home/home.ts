import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { RecipeService } from '../../core/services/recipe.service';

const DESCRIPTION_LENGTH = 15;

@Component({
  selector: 'app-home',
  styleUrl: './home.css',
  template: `
    <main class="page">
      <header class="top">
        <h1>Bienvenue {{ auth.user()?.login }}</h1>
        <button type="button" (click)="auth.logout()">Se déconnecter</button>
      </header>

      <section aria-labelledby="latest-title">
        <h2 id="latest-title">Dernières recettes</h2>
        @if (recipes.isLoading()) {
          <p role="status">Chargement…</p>
        } @else if (recipes.error()) {
          <p role="alert">Impossible de charger les recettes.</p>
        } @else {
          <ul class="recipes">
            @for (recipe of recipes.latest(); track recipe.id) {
              <li>
                <h3>{{ recipe.name }}</h3>
                <p>{{ preview(recipe.description) }}</p>
              </li>
            } @empty {
              <li>Aucune recette pour le moment.</li>
            }
          </ul>
        }
      </section>
    </main>
  `,
})
export class Home {
  protected readonly auth = inject(AuthService);
  protected readonly recipes = inject(RecipeService);

  protected preview(description: string): string {
    return description.length > DESCRIPTION_LENGTH
      ? `${description.slice(0, DESCRIPTION_LENGTH)}…`
      : description;
  }
}
