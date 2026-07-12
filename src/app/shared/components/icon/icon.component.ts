import { HttpClient } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css',
})
export class IconComponent implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  // input signals
  name = input.required<string>();
  size = input<number>(24);
  color = input<string>('currentColor');
  // final inner HtML
  safeSvgContent = signal<SafeHtml>('');

  ngOnInit(): void {
    if (this.name()) {
      this.http.get(`assets/icons/${this.name()}.svg`, { responseType: 'text' }).subscribe({
        next: (svgText) => {
          this.safeSvgContent.set(this.sanitizer.bypassSecurityTrustHtml(svgText));
        },
        error: () => {
          console.error(`Icon "${this.name}" not found in assets/icons/`);
        },
      });
    }
  }
}
