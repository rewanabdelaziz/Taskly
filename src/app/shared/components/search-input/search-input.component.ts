import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [IconComponent , FormsModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.css'
})
export class SearchInputComponent implements OnInit{
  placeholder = input<string>('search')
  customClass = input<string>()

  searchValue = output<string>()

  private searchSubject = new Subject<string>();
  private search$!: Subscription;
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.search$ = this.searchSubject .pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next : (val) =>{
        this.searchValue.emit(val)
      }
    })
  }

  onSearch(event : Event){
    const val  =(event.target as HTMLInputElement)?.value
    this.searchSubject.next(val)
  }
}
