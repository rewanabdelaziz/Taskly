import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  currentPage = signal(1);
  limit = signal(1);

  offset = computed(() => (this.currentPage() - 1) * this.limit());
  
  getEndPageNum(total: number) {
    return Math.ceil(total / this.limit()) || 1;
  }

  init(limit: number = 3) {
    this.limit.set(limit);
    this.resetPage();
  }

  currentLength(itemsCount: number) {
    if (this.currentPage() === 1) {
      return itemsCount;
    }
    return this.limit() * (this.currentPage() - 1) + itemsCount;
  }
  
  goToPage(page: number, total: number) {
    const maxPage = this.getEndPageNum(total);
    if (page >= 1 && page <= maxPage) {
      this.currentPage.set(page);
    }
  }



  resetPage() {
    this.currentPage.set(1);
  }
  
}
