import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Landing } from './app/pages/landing/landing';
import { LandingProfile } from './app/pages/landing/profile';
import { Notfound } from './app/pages/notfound/notfound';
import { InternshipList } from './app/pages/internship-list/internship-list';
import { authGuard } from './app/services/auth.guard';

export const appRoutes: Routes = [
    { path: '', redirectTo: 'landing', pathMatch: 'full' },
    { path: 'landing', component: Landing },
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'RH', 'Encadrant', 'Stagiaire'] },
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing/profile', component: LandingProfile, canActivate: [authGuard] },
    { path: 'internship-list', component: InternshipList },

    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];