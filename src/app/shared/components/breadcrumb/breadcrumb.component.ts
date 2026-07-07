import { Component, Input } from '@angular/core';
import { Breadcrumbs } from '../../models/breadcrumbs';
import { IconComponent } from '../icon/icon.component';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [IconComponent,RouterLink,RouterLinkActive],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
 @Input() breadcrumbs!: Breadcrumbs[]
}
