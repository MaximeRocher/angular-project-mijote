import {
  Component,
  ElementRef,
  inject,
  input,
  computed,
  afterNextRender,
  DestroyRef,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { GsapService } from '@/core/services/gsap.service';

@Component({
  selector: 'app-cocotte-pot',
  styles: `
    :host {
      display: inline-block;
      vertical-align: middle;
      line-height: 0;
    }
    svg {
      display: block;
      overflow: visible;
      filter: drop-shadow(0 14px 28px rgba(60, 90, 30, 0.18));
    }
    .steam-line {
      opacity: 0;
      transform-origin: bottom center;
      will-change: transform, opacity;
    }
  `,
  template: `
    <svg
      #svgRef
      [attr.width]="pixelSize()"
      [attr.height]="pixelSize() * 0.88"
      viewBox="0 0 200 176"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Cocotte en fonte Mijote"
    >
      <defs>
        <!-- Body Terracotta Gradient -->
        <linearGradient
          id="potBodyGrad"
          x1="20"
          y1="80"
          x2="180"
          y2="150"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stop-color="#8fb04f" />
          <stop offset="50%" stop-color="#4f7022" />
          <stop offset="100%" stop-color="#33491a" />
        </linearGradient>

        <!-- Lid Gradient -->
        <linearGradient
          id="lidGrad"
          x1="30"
          y1="58"
          x2="170"
          y2="92"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stop-color="#8fb04f" />
          <stop offset="60%" stop-color="#4f7022" />
          <stop offset="100%" stop-color="#33491a" />
        </linearGradient>

        <!-- Brass Knob Gradient -->
        <linearGradient
          id="brassGrad"
          x1="90"
          y1="42"
          x2="110"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stop-color="#fceda2" />
          <stop offset="40%" stop-color="#d4af37" />
          <stop offset="100%" stop-color="#8a6d1c" />
        </linearGradient>

        <!-- Specular Highlight -->
        <linearGradient
          id="specularGrad"
          x1="50"
          y1="85"
          x2="150"
          y2="115"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>

        <!-- Steam Gradient -->
        <linearGradient id="steamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="50%" stop-color="#ffffff" stop-opacity="0.65" />
          <stop offset="100%" stop-color="#f0f6e0" stop-opacity="0.1" />
        </linearGradient>
      </defs>

      <!-- Animated Steam (visible if showSteam is true) -->
      @if (showSteam()) {
        <g class="steam-group" aria-hidden="true">
          <path
            #steam1
            class="steam-line steam-1"
            d="M82 46 C74 34, 90 22, 80 8"
            stroke="url(#steamGrad)"
            stroke-width="3"
            stroke-linecap="round"
          />
          <path
            #steam2
            class="steam-line steam-2"
            d="M100 42 C108 30, 92 18, 102 4"
            stroke="url(#steamGrad)"
            stroke-width="3.5"
            stroke-linecap="round"
          />
          <path
            #steam3
            class="steam-line steam-3"
            d="M118 46 C126 34, 110 22, 120 8"
            stroke="url(#steamGrad)"
            stroke-width="3"
            stroke-linecap="round"
          />
        </g>
      }

      <!-- Cast Iron Handles -->
      <path
        d="M16 96 C8 96, 6 112, 18 116 C24 118, 28 114, 28 110"
        stroke="#33491a"
        stroke-width="7"
        stroke-linecap="round"
      />
      <path
        d="M184 96 C192 96, 194 112, 182 116 C176 118, 172 114, 172 110"
        stroke="#33491a"
        stroke-width="7"
        stroke-linecap="round"
      />

      <!-- Cocotte Body Base -->
      <path
        d="M26 88 C26 88, 30 152, 100 152 C170 152, 174 88, 174 88 Z"
        fill="url(#potBodyGrad)"
      />

      <!-- Body Rim / Shadow Line -->
      <path d="M26 88 C40 94, 160 94, 174 88" stroke="#2a3d15" stroke-width="3" fill="none" />

      <!-- Body Specular Sheen -->
      <path d="M36 94 C38 126, 66 144, 98 144 C60 144, 40 122, 38 94 Z" fill="url(#specularGrad)" />

      <!-- Cocotte Lid -->
      <path
        d="M22 84 C30 68, 64 60, 100 60 C136 60, 170 68, 178 84 C170 88, 136 92, 100 92 C64 92, 30 88, 22 84 Z"
        fill="url(#lidGrad)"
        stroke="#2f4418"
        stroke-width="1.5"
      />

      <!-- Lid Edge Highlight -->
      <path
        d="M25 83 C55 70, 145 70, 175 83"
        stroke="#b7d27d"
        stroke-width="1.5"
        stroke-linecap="round"
        fill="none"
        opacity="0.8"
      />

      <!-- Brass Lid Knob -->
      <ellipse
        cx="100"
        cy="54"
        rx="14"
        ry="7"
        fill="url(#brassGrad)"
        stroke="#684f0f"
        stroke-width="1"
      />
      <ellipse cx="100" cy="51" rx="9" ry="3.5" fill="#fef0ab" opacity="0.8" />
    </svg>
  `,
})
export class CocottePotComponent {
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);

  readonly size = input<'sm' | 'md' | 'lg' | 'xl' | number>('md');
  readonly showSteam = input<boolean>(true);

  private readonly steam1 = viewChild<ElementRef>('steam1');
  private readonly steam2 = viewChild<ElementRef>('steam2');
  private readonly steam3 = viewChild<ElementRef>('steam3');

  readonly pixelSize = computed(() => {
    const s = this.size();
    if (typeof s === 'number') return s;
    switch (s) {
      case 'sm':
        return 54;
      case 'md':
        return 110;
      case 'lg':
        return 180;
      case 'xl':
        return 270;
      default:
        return 110;
    }
  });

  constructor() {
    afterNextRender(() => {
      if (!this.showSteam() || this.gsapService.prefersReducedMotion()) return;

      const s1 = this.steam1()?.nativeElement;
      const s2 = this.steam2()?.nativeElement;
      const s3 = this.steam3()?.nativeElement;

      if (!s1 || !s2 || !s3) return;

      const tl = gsap.timeline({ repeat: -1 });

      const animateSteam = (el: Element, delay: number) => {
        return gsap.fromTo(
          el,
          { opacity: 0, y: 10, scaleY: 0.7 },
          {
            opacity: 0.85,
            y: -16,
            scaleY: 1.15,
            duration: 2.2,
            repeat: -1,
            yoyo: false,
            ease: 'sine.inOut',
            delay,
            onRepeat: () => {
              gsap.to(el, { opacity: 0, duration: 0.6, ease: 'power1.out' });
            },
          },
        );
      };

      const anim1 = animateSteam(s1, 0);
      const anim2 = animateSteam(s2, 0.7);
      const anim3 = animateSteam(s3, 1.4);

      [anim1, anim2, anim3].forEach((anim) => this.gsapService.stopAfter(anim));

      this.destroyRef.onDestroy(() => {
        tl.kill();
        anim1.kill();
        anim2.kill();
        anim3.kill();
      });
    });
  }
}
