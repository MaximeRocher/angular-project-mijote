import { ComponentFixture, TestBed } from '@angular/core/testing';
import { submit } from '@angular/forms/signals';
import { of, throwError } from 'rxjs';
import { ReviewForm } from './review-form';
import { RecipeService } from '@/core/services/recipe.service';
import { AuthService } from '@/core/services/auth.service';
import { Recipe } from '@/core/models/recipe.model';
import { provideAppIcons } from '@/core/icons';
import { axeViolations } from '@/testing-a11y';

describe('ReviewForm', () => {
  let fixture: ComponentFixture<ReviewForm>;
  let component: ReviewForm;
  let addRate: ReturnType<typeof vi.fn>;

  const updated: Recipe = {
    id: '42',
    name: 'Ratatouille',
    description: 'Une ratatouille provençale savoureuse mijotée à feu doux.',
    composition: [],
    rates: [{ login: 'ChefJulien', rate: 5, review: 'Test review extra !' }],
  };

  beforeEach(async () => {
    addRate = vi.fn().mockReturnValue(of(updated));
    await TestBed.configureTestingModule({
      imports: [ReviewForm],
      providers: [
        provideAppIcons(),
        { provide: RecipeService, useValue: { addRate } },
        { provide: AuthService, useValue: { user: () => ({ login: 'ChefJulien' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewForm);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('recipeId', '42');
    fixture.detectChanges();
  });

  it('defaults to 5 stars and hover does not change the value', () => {
    expect(component.model().rate).toBe(5);

    component.setRating(3);
    expect(component.model().rate).toBe(3);

    component.hover(4);
    expect(component.model().rate).toBe(3);
  });

  it('moves the rating with arrow keys, clamped between 1 and 5', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.setRating(5);
    component.onStarKey(event, 6);
    expect(component.model().rate).toBe(5);
    component.onStarKey(event, 0);
    expect(component.model().rate).toBe(1);
  });

  it('submits the review as the logged-in user, emits the updated recipe and resets', async () => {
    const emitted: Recipe[] = [];
    component.reviewAdded.subscribe((r) => emitted.push(r));
    component.model.set({ rate: 5, review: '  Test review extra !  ' });

    await submit(component.form);

    expect(addRate).toHaveBeenCalledWith('42', {
      login: 'ChefJulien',
      rate: 5,
      review: 'Test review extra !',
    });
    expect(component.success()).toBe('Votre avis a été publié avec succès !');
    expect(component.model()).toEqual({ rate: 5, review: '' });
    expect(emitted).toEqual([updated]);
  });

  it('sends no comment when the textarea is blank', async () => {
    component.model.set({ rate: 4, review: '   ' });
    await submit(component.form);
    expect(addRate).toHaveBeenCalledWith('42', { login: 'ChefJulien', rate: 4, review: undefined });
  });

  it('refuses a comment over 500 characters', async () => {
    component.model.set({ rate: 4, review: 'x'.repeat(501) });
    await submit(component.form);
    expect(addRate).not.toHaveBeenCalled();
  });

  it('shows the error when saving fails', async () => {
    addRate.mockReturnValue(throwError(() => new Error('Erreur de connexion serveur')));
    await submit(component.form);

    expect(component.submitting()).toBe(false);
    expect(component.error()).toBe('Erreur de connexion serveur');
    expect(component.success()).toBeNull();
  });

  it('has no axe violations', async () => {
    expect(await axeViolations(fixture)).toEqual([]);
  });
});
