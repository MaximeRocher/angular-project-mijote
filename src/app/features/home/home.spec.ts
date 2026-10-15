import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Home } from './home';
import { AuthService } from '../../core/services/auth.service';
import { RecipeService } from '../../core/services/recipe.service';
import { Recipe } from '../../core/models/recipe.model';
import { provideAppIcons } from '@/core/icons';
import { axeViolations } from '@/testing-a11y';

describe('Home Component', () => {
  let fixture: ComponentFixture<Home>;
  let getLatest: ReturnType<typeof vi.fn>;

  const recipes: Recipe[] = [
    {
      id: '1',
      name: 'Boeuf Bourguignon',
      description: 'Plat traditionnel mijoté lentement au vin rouge et aromates.',
      composition: [],
      rates: [
        { login: 'a', rate: 5 },
        { login: 'b', rate: 4 },
      ],
    },
    {
      id: '2',
      name: 'Ratatouille Provençale',
      description: 'Légumes du soleil mijotés aux herbes fraîches et huile d’olive.',
      composition: [],
    },
  ];

  async function render(): Promise<void> {
    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    getLatest = vi.fn().mockReturnValue(of(recipes));
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        provideAppIcons(),
        { provide: RecipeService, useValue: { getLatest } },
        { provide: AuthService, useValue: { user: signal({ id: '1', login: 'ChefAuguste' }) } },
      ],
    }).compileComponents();
  });

  it('should render welcome greeting with user name', async () => {
    await render();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Bienvenue ChefAuguste');
    expect(el.querySelector('.welcome-badge')?.textContent).toContain('Table de cuisine');
  });

  it('should render the latest recipes with truncated description and average rating', async () => {
    await render();
    const items = (fixture.nativeElement as HTMLElement).querySelectorAll('.recipe-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Boeuf Bourguignon');
    expect(items[0].textContent).toContain('Plat traditionn…');
    expect(items[0].textContent).toContain('★ 4.5 / 5');
    expect(items[1].textContent).toContain('Non noté');
  });

  it('should render empty state when no recipes exist', async () => {
    getLatest.mockReturnValue(of([]));
    await render();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.empty-state')?.textContent,
    ).toContain('Aucune recette pour le moment.');
  });

  it('should show an error when loading fails', async () => {
    getLatest.mockReturnValue(throwError(() => new Error('boom')));
    await render();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role=alert]')?.textContent,
    ).toContain('Impossible de charger les recettes.');
  });

  it('has no axe violations', async () => {
    await render();
    expect(await axeViolations(fixture)).toEqual([]);
  });
});
