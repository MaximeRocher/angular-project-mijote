import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeCard } from './recipe-card';
import { Recipe } from '@/core/models/recipe.model';
import { IngredientService } from '@/core/services/ingredient.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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
        provideHttpClient(),
        provideHttpClientTesting(),
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

  it('should display the recipe name and full description by default', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Cheese burger maison');
    expect(compiled.querySelector('p')?.textContent).toContain(
      'Un hamburger simple avec du bon fromage fondant et un steak bien cuit.'
    );
  });

  it('should truncate the description to 15 characters when truncateDescription is true', async () => {
    fixture.componentRef.setInput('truncateDescription', true);
    fixture.componentRef.setInput('maxDescriptionLength', 15);
    fixture.detectChanges();
    await fixture.whenStable();

    const expected = mockRecipe.description.slice(0, 15);
    expect(component.displayedDescription()).toBe(expected);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent?.trim()).toBe(expected);
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

  it('should emit delete output when delete button is clicked and showActions is true', async () => {
    fixture.componentRef.setInput('showActions', true);
    fixture.detectChanges();
    await fixture.whenStable();

    let deletedId: string | undefined;
    component.delete.subscribe((id) => {
      deletedId = id;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const deleteBtn = compiled.querySelector('button') as HTMLButtonElement;
    expect(deleteBtn).toBeTruthy();
    deleteBtn.click();

    expect(deletedId).toBe('1');
  });
});
