import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RecipeCard } from './recipe-card';
import { Recipe } from '@/core/models/recipe.model';
import { IngredientService } from '@/core/services/ingredient.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAppIcons } from '@/core/icons';

describe('RecipeCard', () => {
  let component: RecipeCard;
  let fixture: ComponentFixture<RecipeCard>;

  const mockRecipe: Recipe = {
    id: '1',
    name: 'Cheese burger maison',
    description: 'Un hamburger simple avec du bon fromage fondant et un steak bien cuit.',
    composition: [
      { idIngredient: '1', quantity: 2 },
      { idIngredient: '2', quantity: 1 },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeCard],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
        {
          provide: IngredientService,
          useValue: {
            getIngredientName: (id: string | number) => {
              if (String(id) === '1') return 'Pain';
              if (String(id) === '2') return 'Steak';
              return `Ingrédient #${id}`;
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('recipe', mockRecipe);
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the recipe name as an accessible link and full description by default', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const titleLink = compiled.querySelector('h3 a') as HTMLAnchorElement;
    expect(titleLink).toBeTruthy();
    expect(titleLink.textContent?.trim()).toBe('Cheese burger maison');
    expect(titleLink.getAttribute('href')).toBe('/recipes/1');
    expect(compiled.querySelector('p')?.textContent).toContain(
      'Un hamburger simple avec du bon fromage fondant et un steak bien cuit.',
    );
  });

  it('should truncate the description to 15 characters with ellipsis when truncateDescription is true', async () => {
    fixture.componentRef.setInput('truncateDescription', true);
    fixture.componentRef.setInput('maxDescriptionLength', 15);
    fixture.detectChanges();
    await fixture.whenStable();

    const expected = `${mockRecipe.description.slice(0, 15)}…`;
    expect(component.displayedDescription()).toBe(expected);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent?.trim()).toBe(expected);
  });

  it('should not add ellipsis if description length is less than or equal to maxDescriptionLength', async () => {
    const shortRecipe: Recipe = {
      ...mockRecipe,
      description: 'Court',
    };
    fixture.componentRef.setInput('recipe', shortRecipe);
    fixture.componentRef.setInput('truncateDescription', true);
    fixture.componentRef.setInput('maxDescriptionLength', 15);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.displayedDescription()).toBe('Court');
  });

  it('should display "Non noté" when recipe has no ratings', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Non noté');
    expect(component.ratingInfo()).toBeNull();
  });

  it('should display average rate and count when recipe has ratings', async () => {
    const ratedRecipe: Recipe = {
      ...mockRecipe,
      rates: [
        { login: 'Alex', rate: 5, review: 'Super' },
        { login: 'Marie', rate: 4, review: 'Très bon' },
      ],
    };
    fixture.componentRef.setInput('recipe', ratedRecipe);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.ratingInfo()).toEqual({
      average: 4.5,
      count: 2,
      rounded: 5,
      ariaLabel: 'Note moyenne de 4.5 sur 5, basée sur 2 avis',
    });

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('4.5 / 5');
    expect(compiled.textContent).toContain('(2 avis)');
  });

  it('should render ingredients with resolved names and quantities when showIngredients is true', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0]?.textContent).toContain('Pain');
    expect(items[0]?.textContent).toContain('×2');
    expect(items[1]?.textContent).toContain('Steak');
    expect(items[1]?.textContent).toContain('×1');
  });

  it('should not render ingredients when showIngredients is false', async () => {
    fixture.componentRef.setInput('showIngredients', false);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('ul')).toBeNull();
  });
});
