import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Home } from './home';
import { AuthService } from '../../core/services/auth.service';
import { RecipeService } from '../../core/services/recipe.service';
import { Recipe } from '../../core/models/recipe.model';
import { provideAppIcons } from '@/core/icons';
import { axeViolations } from '@/testing-a11y';

describe('Home Component', () => {
  let fixture: ComponentFixture<Home>;
  let component: Home;

  const mockRecipesSignal = signal<Recipe[]>([
    {
      id: '1',
      name: 'Boeuf Bourguignon',
      description: 'Plat traditionnel mijoté lentement au vin rouge et aromates.',
      composition: [],
    },
    {
      id: '2',
      name: 'Ratatouille Provençale',
      description: 'Légumes du soleil mijotés aux herbes fraîches et huile d’olive.',
      composition: [],
    },
  ]);

  const mockRecipeService = {
    latestRecipes: mockRecipesSignal,
    loading: signal(false),
    error: signal<string | null>(null),
    loadLatest: vi.fn().mockReturnValue(of([])),
  };

  const mockAuthService = {
    user: signal({ id: '1', login: 'ChefAuguste' }),
  };

  beforeEach(async () => {
    mockRecipesSignal.set([
      {
        id: '1',
        name: 'Boeuf Bourguignon',
        description: 'Plat traditionnel mijoté lentement au vin rouge et aromates.',
        composition: [],
      },
      {
        id: '2',
        name: 'Ratatouille Provençale',
        description: 'Légumes du soleil mijotés aux herbes fraîches et huile d’olive.',
        composition: [],
      },
    ]);

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        provideAppIcons(),
        { provide: RecipeService, useValue: mockRecipeService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should render welcome greeting with user name', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Bienvenue ChefAuguste');
    expect(el.querySelector('.welcome-badge')?.textContent).toContain('Table de cuisine');
  });

  it('should render list of latest recipes', () => {
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('.recipe-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Boeuf Bourguignon');
  });

  it('should render empty state when no recipes exist', () => {
    mockRecipesSignal.set([]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empty-state')?.textContent).toContain('Aucune recette pour le moment.');
  });

  it('has no axe violations', async () => {
    expect(await axeViolations(fixture)).toEqual([]);
  });
});
