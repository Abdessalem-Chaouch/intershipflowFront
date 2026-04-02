import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

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
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                path: '/pages',
                items: [
                    {
                        label: 'Landing',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/landing']
                    },
                    {
                        label: 'Gestion Utilisateurs',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/pages/user-management']
                    },
                    {
                        label: 'Gestion des Offres',
                        icon: 'pi pi-fw pi-briefcase',
                        routerLink: ['/pages/offer-management']
                    },
                    {
                        label: 'Candidatures',
                        icon: 'pi pi-fw pi-paperclip',
                        routerLink: ['/pages/application-management']
                    },
                    {
                        label: 'Gestion des Tests',
                        icon: 'pi pi-fw pi-file-edit',
                        routerLink: ['/pages/test-management']
                    },
                    {
                        label: 'Gestion des Exercices',
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/pages/exercice-management']
                    },
                    {
                        label: 'Gestion des Questions',
                        icon: 'pi pi-fw pi-question-circle',
                        routerLink: ['/pages/question-management']
                    }
                ]
            }
        ];
    }
}
