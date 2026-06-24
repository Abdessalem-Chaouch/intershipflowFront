import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { UserService } from '@/app/services/user.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu implements OnInit {
    private userService = inject(UserService);
    private router = inject(Router);
    model: MenuItem[] = [];

    ngOnInit() {
        const user = this.userService.currentUser();
        const role = user?.role || 'User';

        if (role === 'User') {
            this.model = [
                {
                    label: 'Compte',
                    items: [
                        {
                            label: 'Mon Profil',
                            icon: 'pi pi-fw pi-user',
                            routerLink: ['/landing/profile']
                        },
                        {
                            label: 'Se déconnecter',
                            icon: 'pi pi-fw pi-sign-out',
                            command: () => {
                                this.userService.logout();
                                this.router.navigate(['/landing']);
                            }
                        }
                    ]
                }
            ];
            return;
        }

        const hasRole = (roles: string[]) => roles.includes(role);

        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }]
            }
        ];

        // Pages Group
        const pagesItems = [];
        pagesItems.push({ label: 'Landing', icon: 'pi pi-fw pi-globe', routerLink: ['/landing'] });

        if (hasRole(['Admin', 'RH'])) {
            pagesItems.push({ label: 'Gestion Utilisateurs', icon: 'pi pi-fw pi-users', routerLink: ['/pages/user-management'] });
            pagesItems.push({ label: 'Gestion des Offres', icon: 'pi pi-fw pi-briefcase', routerLink: ['/pages/offer-management'] });
            pagesItems.push({ label: 'Candidatures', icon: 'pi pi-fw pi-paperclip', routerLink: ['/pages/application-management'] });
        }

        if (hasRole(['Admin', 'RH', 'Encadrant'])) {
            pagesItems.push({ label: 'Gestion des Tests', icon: 'pi pi-fw pi-file-edit', routerLink: ['/pages/test-management'] });
            pagesItems.push({ label: 'Gestion des Exercices', icon: 'pi pi-fw pi-list', routerLink: ['/pages/exercice-management'] });
            pagesItems.push({ label: 'Gestion des Questions', icon: 'pi pi-fw pi-question-circle', routerLink: ['/pages/question-management'] });
        }

        this.model.push({
            label: 'Pages',
            icon: 'pi pi-fw pi-briefcase',
            items: pagesItems
        });

        // Suivi des Stages Group
        const stageItems = [];
        if (hasRole(['Stagiaire'])) {
            stageItems.push({ label: 'Mes Stages', icon: 'pi pi-fw pi-list', routerLink: ['/pages/mes-stages'] });
            stageItems.push({ label: 'Dépôt Stagiaire', icon: 'pi pi-fw pi-cloud-upload', routerLink: ['/pages/stagiaire-documents'] });
            stageItems.push({ label: 'Mes Attestations', icon: 'pi pi-fw pi-file', routerLink: ['/pages/mes-attestations'] });
        }

        if (hasRole(['Admin', 'RH', 'Encadrant'])) {
            stageItems.push({ label: 'Gestion Stages', icon: 'pi pi-fw pi-cog', routerLink: ['/pages/gestion-stages'] });
        }

        if (hasRole(['Encadrant', 'Admin', 'RH'])) {
            stageItems.push({ label: 'Évaluation Encadrant', icon: 'pi pi-fw pi-check-square', routerLink: ['/pages/encadrant-documents'] });
        }

        if (hasRole(['Encadrant'])) {
            stageItems.push({ label: 'Mes Stagiaires', icon: 'pi pi-fw pi-users', routerLink: ['/pages/mes-stagiaires'] });
        }

        if (hasRole(['Admin', 'RH'])) {
            stageItems.push({ label: 'Gestion Attestations', icon: 'pi pi-fw pi-shield', routerLink: ['/pages/gestion-attestations'] });
        }

        if (stageItems.length > 0) {
            this.model.push({
                label: 'Suivi des Stages',
                icon: 'pi pi-fw pi-folder-open',
                items: stageItems
            });
        }

        this.model.push({
            label: 'Compte',
            items: [
                { label: 'Mon Profil', icon: 'pi pi-fw pi-user', routerLink: ['/pages/profile'] },
                {
                    label: 'Se déconnecter',
                    icon: 'pi pi-fw pi-sign-out',
                    command: () => {
                        this.userService.logout();
                        this.router.navigate(['/landing']);
                    }
                }
            ]
        });
    }
}
