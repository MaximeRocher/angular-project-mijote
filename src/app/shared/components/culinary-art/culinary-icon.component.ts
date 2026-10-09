import { Component, input } from '@angular/core';

@Component({
  selector: 'app-culinary-icon',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
    svg {
      display: block;
    }
  `,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      [attr.aria-label]="name()"
    >
      @switch (name()) {
        @case ('rosemary') {
          <!-- Botanical Rosemary Sprig -->
          <path d="M4 20 C10 16, 14 10, 20 4" stroke="#486940" stroke-width="2" stroke-linecap="round" />
          <path d="M8 17 C6 14, 5 12, 5 9" stroke="#5d8553" stroke-width="1.75" stroke-linecap="round" />
          <path d="M10 15 C13 14, 15 14, 17 16" stroke="#5d8553" stroke-width="1.75" stroke-linecap="round" />
          <path d="M12 12 C9 9, 8 7, 9 4" stroke="#5d8553" stroke-width="1.75" stroke-linecap="round" />
          <path d="M14 10 C17 9, 19 9, 21 11" stroke="#5d8553" stroke-width="1.75" stroke-linecap="round" />
          <path d="M17 7 C16 4, 15 2, 17 1" stroke="#5d8553" stroke-width="1.75" stroke-linecap="round" />
        }
        @case ('tomato') {
          <!-- Heirloom Tomato -->
          <circle cx="12" cy="14" r="8" fill="#c73c18" />
          <circle cx="9.5" cy="12" r="6" fill="#dc4a24" opacity="0.8" />
          <!-- Calyx & Stem -->
          <path d="M12 6 L12 2 C13 2, 15 3, 14 4" stroke="#49703c" stroke-width="2" stroke-linecap="round" />
          <path d="M12 6 L8 5 M12 6 L16 5 M12 6 L9 8 M12 6 L15 8" stroke="#5a874b" stroke-width="1.8" stroke-linecap="round" />
        }
        @case ('knife') {
          <!-- Chef Knife -->
          <path d="M21 3 C21 3, 11 4, 6 9 C4 11, 4 14, 7 14 L15 14 L21 3 Z" fill="#cfd6de" stroke="#7e8a99" stroke-width="1.5" />
          <path d="M4 14 L2 18 C1.5 19, 2.5 20.5, 3.5 20.5 L6 20.5 L7 14 Z" fill="#6d462f" />
          <circle cx="4.5" cy="17.5" r="0.8" fill="#d99b26" />
        }
        @case ('garlic') {
          <!-- Garlic Bulb -->
          <path d="M12 3 C12 3, 4 9, 4 15 C4 18.5, 7.5 21, 12 21 C16.5 21, 20 18.5, 20 15 C20 9, 12 3, 12 3 Z" fill="#faf5eb" stroke="#cbb89d" stroke-width="1.5" />
          <path d="M12 3 L12 21" stroke="#cbb89d" stroke-width="1.2" />
          <path d="M12 3 C9 9, 8 16, 8 20.5" stroke="#cbb89d" stroke-width="1.2" />
          <path d="M12 3 C15 9, 16 16, 16 20.5" stroke="#cbb89d" stroke-width="1.2" />
          <path d="M12 3 L12 1" stroke="#877156" stroke-width="2" stroke-linecap="round" />
        }
        @case ('spoon') {
          <!-- Wooden Spoon -->
          <ellipse cx="17.5" cy="6.5" rx="4.5" ry="3.5" transform="rotate(-45 17.5 6.5)" fill="#c78c58" stroke="#8a5323" stroke-width="1.5" />
          <path d="M15 9 L4 20 C3 21, 2 20, 3 19 L14 8" stroke="#8a5323" stroke-width="2.2" stroke-linecap="round" />
        }
        @case ('pepper') {
          <!-- Chili Pepper -->
          <path d="M18 5 C18 5, 20 10, 16 16 C12 22, 6 22, 4 21 C3.5 20.5, 4 19, 6 18 C11 15, 14 11, 15 5 Z" fill="#bf2e1b" stroke="#7a180b" stroke-width="1.5" />
          <path d="M18 5 C19 3, 21 2, 22 3" stroke="#486940" stroke-width="2" stroke-linecap="round" />
        }
        @case ('carrot') {
          <!-- Garden Carrot -->
          <path d="M17 7 L7 21 C6 22, 5 21, 5 20 L9 9 Z" fill="#e66e19" stroke="#994105" stroke-width="1.5" />
          <path d="M15 5 C15 2, 17 2, 18 1 M15 5 C17 4, 20 5, 21 4 M15 5 C14 3, 14 1, 13 1" stroke="#507c42" stroke-width="1.5" stroke-linecap="round" />
        }
        @case ('book') {
          <!-- Culinary Journal -->
          <path d="M4 19.5 C4 18.12 5.12 17 6.5 17 H20" stroke="#7e4a2d" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M6.5 2 H20 V22 H6.5 C5.12 22 4 20.88 4 19.5 V4.5 C4 3.12 5.12 2 6.5 2 Z" fill="#fdfaf3" stroke="#7e4a2d" stroke-width="1.8" />
          <path d="M11 2 V9 L13.5 7.5 L16 9 V2" fill="#b4410f" />
        }
        @case ('clock') {
          <!-- Kitchen Simmer Clock -->
          <circle cx="12" cy="12" r="9" stroke="#7e4a2d" stroke-width="1.8" fill="#fffdf9" />
          <path d="M12 7 V12 L15.5 14" stroke="#b4410f" stroke-width="2" stroke-linecap="round" />
        }
        @case ('flame') {
          <!-- Low Simmer Flame -->
          <path d="M12 2 C12 2, 17 8, 17 14 C17 17.5, 14.5 20.5, 12 20.5 C9.5 20.5, 7 17.5, 7 14 C7 10, 10 7, 10 7 C10 7, 11 11, 12 11 C13 11, 14 10, 13 8 C12.5 7, 12 2, 12 2 Z" fill="#e66519" />
          <path d="M12 12 C12 12, 14 14, 14 16 C14 17.5, 13 19, 12 19 C11 19, 10 17.5, 10 16 C10 14, 12 12, 12 12 Z" fill="#fed65b" />
        }
        @default {
          <!-- Fallback Culinary Sparkle -->
          <path d="M12 2 L14 9 L21 12 L14 15 L12 22 L10 15 L3 12 L10 9 Z" fill="#b4410f" />
        }
      }
    </svg>
  `,
})
export class CulinaryIconComponent {
  readonly name = input.required<string>();
  readonly size = input<number>(24);
}
