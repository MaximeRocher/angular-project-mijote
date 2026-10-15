import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { GsapService } from '@/core/services/gsap.service';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';
import { Tilt3dDirective } from '@/shared/directives/tilt-3d.directive';
import { CulinaryIconComponent } from '@/shared/components/culinary-art/culinary-icon.component';

interface FeatureCard {
  id: string;
  iconName: string;
  tag: string;
  title: string;
  preview: string;
  detail: string;
  stat?: string;
  statLabel?: string;
  colorClass: string;
  gridClass: string;
}

@Component({
  selector: 'app-bento-grid-section',
  imports: [ScrollRevealDirective, Tilt3dDirective, CulinaryIconComponent],
  styleUrl: './bento-grid.css',
  template: `
    <section id="features" class="bento-section" aria-label="Fonctionnalités de Mijote">
      <div class="section-header" appScrollReveal [direction]="'up'" [distance]="40">
        <span class="section-tag">FONCTIONNALITÉS</span>
        <h2 class="section-title">Tout ce qu'il faut pour cuisiner comme un chef</h2>
        <p class="section-subtitle">
          Une interface moderne et intuitive conçue pour simplifier chaque étape de votre aventure
          culinaire.
        </p>
      </div>

      <div #gridContainer class="bento-grid" role="list">
        @for (card of cards; track card.id) {
          <div
            appTilt3d
            [maxTilt]="expandedId() === card.id ? 0 : 6"
            [scale]="expandedId() === card.id ? 1 : 1.015"
            class="bento-card {{ card.colorClass }} {{ card.gridClass }}"
            [class.expanded]="expandedId() === card.id"
            (click)="toggleCard(card.id)"
            (keydown.enter)="toggleCard(card.id)"
            (keydown.space)="toggleCard(card.id); $event.preventDefault()"
            role="listitem"
            tabindex="0"
            [attr.aria-expanded]="expandedId() === card.id"
          >
            <div class="card-inner">
              <div class="card-top">
                <div class="card-icon-wrap">
                  <app-culinary-icon [name]="card.iconName" [size]="28" />
                </div>
                <span class="card-tag">{{ card.tag }}</span>
              </div>

              <div class="card-body">
                <h3 class="card-title">{{ card.title }}</h3>
                <p class="card-preview">{{ card.preview }}</p>

                @if (expandedId() === card.id) {
                  <div class="card-expanded-content">
                    <p class="card-detail">{{ card.detail }}</p>
                    @if (card.stat) {
                      <div class="card-stat-block">
                        <span class="stat-number">{{ card.stat }}</span>
                        <span class="stat-label">{{ card.statLabel }}</span>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="card-footer">
                <span class="card-hint">
                  {{ expandedId() === card.id ? 'Cliquer pour refermer ↑' : 'En savoir plus →' }}
                </span>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class BentoGridSection {
  private readonly gsapService = inject(GsapService);
  private readonly gridContainer = viewChild.required<ElementRef>('gridContainer');

  protected readonly expandedId = signal<string | null>(null);

  protected readonly cards: FeatureCard[] = [
    {
      id: 'organize',
      iconName: 'book',
      tag: 'ORGANISATION',
      title: 'Votre carnet de recettes interactif',
      preview:
        'Centralisez toutes vos recettes de famille et découvertes culinaires dans un espace ordonné.',
      detail:
        'Filtrez par type de plat, ingrédients ou temps de préparation. Ajoutez des notes personnelles, des variantes et retrouvez instantanément vos plats préférés.',
      stat: '∞',
      statLabel: 'recettes sauvegardées sans limite',
      colorClass: 'card-warm',
      gridClass: 'col-span-2 row-span-1',
    },
    {
      id: 'create',
      iconName: 'knife',
      tag: 'CRÉATION',
      title: 'Éditeur fluide & précis',
      preview:
        'Créez de nouvelles recettes avec calcul automatique des proportions et ingrédients.',
      detail:
        "Une saisie rapide avec validation instantanée. Précisez les quantités exactes et ajustez les portions selon le nombre de convives d'un simple clic.",
      stat: '0s',
      statLabel: 'temps de configuration requis',
      colorClass: 'card-accent',
      gridClass: 'col-span-1 row-span-1',
    },
    {
      id: 'pantry',
      iconName: 'carrot',
      tag: 'INGRÉDIENTS',
      title: 'Gestion intelligente des stocks',
      preview:
        'Visualisez vos ingrédients et trouvez des idées de plats à cuisiner avec ce que vous avez.',
      detail:
        "Ne gaspillez plus rien : renseignez ce qu'il vous reste dans le réfrigérateur, Mijote vous propose les meilleures associations culinaires adaptées.",
      stat: '-30%',
      statLabel: 'de gaspillage alimentaire en moyenne',
      colorClass: 'card-light',
      gridClass: 'col-span-1 row-span-1',
    },
    {
      id: 'step-by-step',
      iconName: 'flame',
      tag: 'EN CUISINE',
      title: 'Mode guidé pas-à-pas',
      preview: "Cuisinez l'esprit libre avec une vue épurée des étapes et minuteurs intégrés.",
      detail:
        "Un affichage contrasté et aéré spécialement pensé pour la cuisine : gardez l'écran lisible même les mains occupées.",
      stat: 'AA',
      statLabel: "niveau d'accessibilité visé (WCAG)",
      colorClass: 'card-terracotta',
      gridClass: 'col-span-2 row-span-1',
    },
  ];

  toggleCard(id: string): void {
    if (this.gsapService.prefersReducedMotion()) {
      this.expandedId.set(this.expandedId() === id ? null : id);
      return;
    }

    const containerEl = this.gridContainer().nativeElement as HTMLElement;
    const cards = containerEl.querySelectorAll('.bento-card');

    // Capture state before DOM changes
    const state = Flip.getState(Array.from(cards));

    // Update signal
    this.expandedId.set(this.expandedId() === id ? null : id);

    // Apply FLIP animation on the next frame after Angular re-renders
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.55,
        ease: 'power3.inOut',
        nested: true,
        absolute: false,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
          ),
        onLeave: (elements) => gsap.to(elements, { opacity: 0, duration: 0.25, ease: 'power2.in' }),
      });
    });
  }
}
