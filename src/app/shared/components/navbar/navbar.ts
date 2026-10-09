import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive],
  styleUrl: './navbar.css',
  template: `
    <header class="bar">
      <a class="brand" routerLink="/home">
        <img ngSrc="images/cooking-pot.svg" width="32" height="32" alt="" />
        <span>Mijote</span>
      </a>

      <nav aria-label="Navigation principale">
        <ul>
          <li>
            <a routerLink="/home" routerLinkActive="active" ariaCurrentWhenActive="page">
              Accueil
            </a>
          </li>
        </ul>
      </nav>

      <div class="user">
        <span>{{ auth.user()?.login }}</span>
        <button type="button" (click)="auth.logout()">Se déconnecter</button>
      </div>
    </header>
  `,
})
export class Navbar {
  protected readonly auth = inject(AuthService);
}
