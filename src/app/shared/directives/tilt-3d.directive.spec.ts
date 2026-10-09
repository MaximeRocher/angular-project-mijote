import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tilt3dDirective } from './tilt-3d.directive';

@Component({
  imports: [Tilt3dDirective],
  template: `
    <div class="parent">
      <div id="target" appTilt3d [maxTilt]="12" [scale]="1.05">Card Content</div>
    </div>
  `,
})
class TestHostComponent {}

describe('Tilt3dDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should instantiate without throwing errors', () => {
    const el = fixture.nativeElement.querySelector('#target');
    expect(el).toBeTruthy();
  });
});
