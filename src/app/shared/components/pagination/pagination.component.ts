import { Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  currentPage = input.required<number>();
  total = input.required<number>();
  limit = input.required<number>();
  currentLength = input.required<number>();
  isLoading = input<boolean>(false);
  itemsLabel = input<string>('items');

  pageChange = output<number>();

  EndPageNum = computed(() => Math.ceil(this.total() / this.limit()) || 1);

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  next() {
    this.onPageChange(this.currentPage() + 1);
  }

  prev() {
    this.onPageChange(this.currentPage() - 1);
  }

}
