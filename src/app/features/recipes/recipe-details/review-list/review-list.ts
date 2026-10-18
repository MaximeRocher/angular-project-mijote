import { Component, computed, input } from '@angular/core';
import { TablerIconComponent } from '@tabler/icons-angular';
import { RecipeRate } from '@/core/models/recipe.model';
import { ratingInfo } from '@/shared/utils/rating';

@Component({
  selector: 'app-review-list',
  imports: [TablerIconComponent],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css',
})
export class ReviewList {
  readonly rates = input.required<RecipeRate[]>();

  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly info = computed(() => ratingInfo(this.rates()));
}
