import { Component, computed, input} from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css',
})
export class IconComponent {
  name = input.required<string>();
  size = input<number>(24);
  color = input<string>('currentColor');
  customClass = input<string | null>(null)
  svgMaskStyle = computed(() => `url('assets/icons/${this.name()}.svg')`);

}
