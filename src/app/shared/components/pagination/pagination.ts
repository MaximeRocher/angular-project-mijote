import { Component, input, model, computed } from '@angular/core';
import { TablerIconComponent } from '@tabler/icons-angular';

const MAX_VISIBLE_PAGES = 5;

@Component({
  selector: 'app-pagination',
  imports: [TablerIconComponent],
  templateUrl: './pagination.html',
})
export class Pagination {
  readonly currentPage = model<number>(1);
  readonly totalItems = input<number>(0);
  readonly pageSize = input<number>(6);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  readonly hasPrevious = computed(() => this.currentPage() > 1);
  readonly hasNext = computed(() => this.currentPage() < this.totalPages());

  readonly pages = computed<number[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - Math.floor(MAX_VISIBLE_PAGES / 2));
    let end = start + MAX_VISIBLE_PAGES - 1;

    if (end > total) {
      end = total;
      start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  goToPage(page: number): void {
    this.currentPage.set(Math.max(1, Math.min(page, this.totalPages())));
  }

  previous(): void {
    this.goToPage(this.currentPage() - 1);
  }

  next(): void {
    this.goToPage(this.currentPage() + 1);
  }
}
