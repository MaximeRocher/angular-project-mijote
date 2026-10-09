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
  readonly color = input('#fff0dc', { alias: 'appHighlight' });
  protected readonly active = signal(false);
}
