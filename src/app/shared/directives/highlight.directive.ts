import { Directive, input, signal } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '[style.background-color]': 'active() ? color() : null',
    '(mouseenter)': 'active.set(true)',
    '(mouseleave)': 'active.set(false)',
    '(focusin)': 'active.set(true)',
    '(focusout)': 'active.set(false)',
  },
})
export class HighlightDirective {
  readonly color = input('#e9f2d0', { alias: 'appHighlight' });
  protected readonly active = signal(false);
}
