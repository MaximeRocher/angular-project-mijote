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

  readonly totalPages = computed(() => {
    const size = this.pageSize();
    if (size <= 0) return 1;
    return Math.max(1, Math.ceil(this.totalItems() / size));
  });

  readonly hasPrevious = computed(() => this.currentPage() > 1);
  readonly hasNext = computed(() => this.currentPage() < this.totalPages());

  readonly pages = computed<number[]>(() => {
    const total = this.totalPages();
    const maxVisible = MAX_VISIBLE_PAGES;
    const current = this.currentPage();

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > total) {
      end = total;
      start = Math.max(1, end - maxVisible + 1);
    }

    const pagesArray: number[] = [];
    for (let i = start; i <= end; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  });

  goToPage(page: number): void {
    const target = Math.max(1, Math.min(page, this.totalPages()));
    if (target !== this.currentPage()) {
      this.currentPage.set(target);
    }
  }

  previous(): void {
    if (this.hasPrevious()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  next(): void {
    if (this.hasNext()) {
      this.goToPage(this.currentPage() + 1);
    }
  }
}
