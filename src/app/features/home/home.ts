import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  styleUrl: './home.css',
  template: `
    <main class="page">
      <h1>Bienvenue {{ auth.user()?.login }}</h1>
      <button type="button" (click)="auth.logout()">Se déconnecter</button>
    </main>
  `,
})
export class Home {
  protected readonly auth = inject(AuthService);
}
