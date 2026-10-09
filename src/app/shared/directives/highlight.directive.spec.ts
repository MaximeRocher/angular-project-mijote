import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighlightDirective } from './highlight.directive';

@Component({
  imports: [HighlightDirective],
  template: `<div appHighlight="rgb(1, 2, 3)"><button type="button">ok</button></div>`,
})
class Host {}

describe('HighlightDirective', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return fixture.nativeElement.querySelector('div') as HTMLElement;
  }

  it('highlights on hover and resets on leave', async () => {
    const el = await setup();
    expect(el.style.backgroundColor).toBe('');

    el.dispatchEvent(new Event('mouseenter'));
    TestBed.tick();
    expect(el.style.backgroundColor).toBe('rgb(1, 2, 3)');

    el.dispatchEvent(new Event('mouseleave'));
    TestBed.tick();
    expect(el.style.backgroundColor).toBe('');
  });

  it('highlights when a child receives focus', async () => {
    const el = await setup();
    el.dispatchEvent(new Event('focusin'));
    TestBed.tick();
    expect(el.style.backgroundColor).toBe('rgb(1, 2, 3)');
  });
});
