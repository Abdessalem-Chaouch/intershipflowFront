import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AdminDashboard } from './components/admin-dashboard';
import { RHDashboard } from './components/rh-dashboard';
import { EncadrantDashboard } from './components/encadrant-dashboard';
import { StagiaireDashboard } from './components/stagiaire-dashboard';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule, 
        AdminDashboard, 
        RHDashboard, 
        EncadrantDashboard, 
        StagiaireDashboard
    ],
    template: `
        <ng-container [ngSwitch]="userRole()">
            <app-admin-dashboard *ngSwitchCase="'Admin'" />
            <app-rh-dashboard *ngSwitchCase="'RH'" />
            <app-encadrant-dashboard *ngSwitchCase="'Encadrant'" />
            <app-stagiaire-dashboard *ngSwitchCase="'Stagiaire'" />
            <div *ngSwitchDefault class="card">
                <div class="text-center py-20">
                    <i class="pi pi-lock text-5xl text-muted-color mb-4"></i>
                    <div class="text-2xl font-bold">Accès Restreint</div>
                    <p class="text-muted-color mt-2">Vous n'avez pas de tableau de bord associé à votre rôle.</p>
                </div>
            </div>
        </ng-container>
    `
})
export class Dashboard {
    private userService = inject(UserService);
    userRole = computed(() => this.userService.currentUser()?.role);
}
