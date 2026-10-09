import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-layout',
  imports: [Navbar, RouterOutlet],
  styleUrl: './layout.css',
  template: `
    <a class="skip" href="#content">Aller au contenu</a>
    <app-navbar />
    <main id="content" tabindex="-1">
      <router-outlet />
    </main>
  `,
})
export class Layout {}
