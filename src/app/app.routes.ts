import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { reverseAuthGuard } from './core/guards/reverse-auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'project' },
  
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

  {
    path: '',
    loadComponent: () =>
      import('./features/auth/components/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    canActivate: [reverseAuthGuard],
    
    children: [
      {
        path: 'sign-up',
        loadComponent: () =>
          import('./features/auth/components/register/register.component').then((m) => m.RegisterComponent),
        
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/components/login/login.component').then((m) => m.LoginComponent),
       
      },
      {
        path:'forgot-password',
        loadComponent: () => import('./features/auth/components/forget-password/forget-password.component').then((m) => m.ForgetPasswordComponent), 
       
      },
      
    ],
  },

  {
    path:'reset-password',
    loadComponent: () => import('./features/auth/components/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent), 
  }
  
];
