import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { reverseAuthGuard } from './core/guards/reverse-auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'project' },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./features/auth/components/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [reverseAuthGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login/login.component').then((m) => m.LoginComponent),
    canActivate: [reverseAuthGuard],
  },
  {
    path: 'project',
    loadComponent: () =>
      import('./features/projects/components/projects/projects.component').then((m) => m.ProjectsComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'add',
        loadComponent: () =>
          import('./features/projects/components/add-project/add-project.component').then((m) => m.AddProjectComponent),
      },
      {
        path: '',
        loadComponent: () =>
          import('./features/projects/components/projects-list/projects-list.component').then((m) => m.ProjectsListComponent),
      }
    ],
  },
  
];
