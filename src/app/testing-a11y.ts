import { ComponentFixture } from '@angular/core/testing';
import axe from 'axe-core';

/**
 * Runs axe on a rendered fixture. Colour contrast is skipped because jsdom has no
 * layout engine; it is covered by the design tokens instead.
 */
export async function axeViolations(fixture: ComponentFixture<unknown>): Promise<string[]> {
  const results = await axe.run(fixture.nativeElement as HTMLElement, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  return results.violations.map((v) => `${v.id}: ${v.help}`);
}
