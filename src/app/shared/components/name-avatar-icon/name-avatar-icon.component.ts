import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-name-avatar-icon',
  standalone: true,
  imports: [],
  templateUrl: './name-avatar-icon.component.html',
  styleUrl: './name-avatar-icon.component.css',
})
export class NameAvatarIconComponent {
  userName = input.required<string>();
  size = input<number>(40);
  customBgColor = input<string | null>(null);
  customTextColor = input<string | null>(null);

  avatar = computed(() => {
    const name = this.userName().trim();
    if (!name) return '';
    const nameParts = name.split(/\s+/);

    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }

    return nameParts[0].substring(0, 2).toUpperCase();
  });

  Colors = computed(() => {
    if (this.customBgColor() && this.customTextColor()) {
      return { bg: this.customBgColor(), text: this.customTextColor() };
    }

    const figmaPalette = [
      { bg: '#DAE2FF', text: '#003D9B' },
      { bg: '#82F9BE', text: '#002113' },
      { bg: '#D6E3FF', text: '#091C35' },
      { bg: '#E0E8FF', text: '#003D9B' },
    ];

    // calculate index to make sure not change the colors every refresh
    let hash = 0;
    const name = this.userName();
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash); // <<5 Bitwise Left Shift
    }
    const index = Math.abs(hash) % figmaPalette.length; // to be in range [0,1,2,3]
    return figmaPalette[index];
  });
}
