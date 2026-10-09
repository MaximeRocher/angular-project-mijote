import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StaggerListDirective } from './stagger-list.directive';

@Component({
  imports: [StaggerListDirective],
  template: `
    <ul appStaggerList id="test-list">
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  `,
})
class TestHostComponent {}

describe('StaggerListDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should instantiate on a list without throwing errors', () => {
    const list = fixture.nativeElement.querySelector('#test-list');
    expect(list).toBeTruthy();
    expect(list.children.length).toBe(3);
  });
});
