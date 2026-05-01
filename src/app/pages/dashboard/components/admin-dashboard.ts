import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../../services/user.service';
import { InternshipService } from '../../../services/internship.service';
import { StageService } from '../../../services/stage.service';

@Component({
    standalone: true,
    selector: 'app-admin-dashboard',
    imports: [CommonModule],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <!-- Stats Widgets -->
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-lg border-none hover:scale-105 transition-transform duration-300">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Total Utilisateurs</span>
                            <div class="text-surface-900 dark:text-surface-0 font-extrabold text-3xl">{{ userCount() }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-xl" style="width: 3.5rem; height: 3.5rem">
                            <i class="pi pi-users text-blue-600 text-2xl!"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-sm">+{{ newUserCount() }}</span>
                        <span class="text-muted-color text-sm">ce mois-ci</span>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-lg border-none hover:scale-105 transition-transform duration-300">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Offres Actives</span>
                            <div class="text-surface-900 dark:text-surface-0 font-extrabold text-3xl">{{ offerCount() }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-xl" style="width: 3.5rem; height: 3.5rem">
                            <i class="pi pi-briefcase text-orange-600 text-2xl!"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-orange-500 font-bold bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded text-sm">{{ pendingOfferCount() }}</span>
                        <span class="text-muted-color text-sm">en attente</span>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-lg border-none hover:scale-105 transition-transform duration-300">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Stages Actifs</span>
                            <div class="text-surface-900 dark:text-surface-0 font-extrabold text-3xl">{{ activeStageCount() }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-xl" style="width: 3.5rem; height: 3.5rem">
                            <i class="pi pi-id-card text-cyan-600 text-2xl!"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-cyan-500 font-bold bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded text-sm">{{ totalStageCount() }}</span>
                        <span class="text-muted-color text-sm">au total</span>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-lg border-none hover:scale-105 transition-transform duration-300">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Attestations</span>
                            <div class="text-surface-900 dark:text-surface-0 font-extrabold text-3xl">12</div>
                        </div>
                        <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-xl" style="width: 3.5rem; height: 3.5rem">
                            <i class="pi pi-verified text-purple-600 text-2xl!"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-purple-500 font-bold bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded text-sm">+2</span>
                        <span class="text-muted-color text-sm">cette semaine</span>
                    </div>
                </div>
            </div>

            <!-- Detailed Stats & Activity -->
            <div class="col-span-12 xl:col-span-8">
                <div class="card border-none shadow-xl min-h-[400px]">
                    <div class="flex justify-between items-center mb-6">
                        <div class="font-bold text-2xl text-primary">Utilisateurs Récents</div>
                        <button class="p-button p-button-text p-button-sm">Gérer tout</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="text-muted-color border-b border-surface-200 dark:border-surface-700">
                                    <th class="py-4 px-2 font-semibold">Nom</th>
                                    <th class="py-4 px-2 font-semibold">Email</th>
                                    <th class="py-4 px-2 font-semibold">Rôle</th>
                                    <th class="py-4 px-2 font-semibold">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let user of recentUsers()" class="hover:bg-surface-50 dark:hover:bg-surface-900/50 transition-colors border-b border-surface-100 dark:border-surface-800 last:border-0">
                                    <td class="py-4 px-2">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {{ user.firstName?.charAt(0) }}{{ user.lastName?.charAt(0) }}
                                            </div>
                                            <span class="font-semibold">{{ user.firstName }} {{ user.lastName }}</span>
                                        </div>
                                    </td>
                                    <td class="py-4 px-2 text-muted-color">{{ user.email }}</td>
                                    <td class="py-4 px-2">
                                        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" 
                                              [ngClass]="getRoleBadgeClass(user.role)">
                                            {{ user.role }}
                                        </span>
                                    </td>
                                    <td class="py-4 px-2">
                                        <div class="flex items-center gap-2">
                                            <span class="w-2 h-2 rounded-full bg-green-500"></span>
                                            <span class="text-sm font-medium">Actif</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="col-span-12 xl:col-span-4">
                <div class="card border-none shadow-xl bg-gradient-to-br from-surface-0 to-surface-50 dark:from-surface-900 dark:to-surface-950">
                    <div class="font-bold text-xl mb-6 flex items-center gap-2">
                        <i class="pi pi-cog text-primary"></i>
                        <span>État du Système</span>
                    </div>
                    <div class="flex flex-col gap-6">
                        <div class="p-4 rounded-2xl bg-white dark:bg-surface-800 shadow-sm border border-surface-100 dark:border-surface-700">
                            <div class="flex justify-between items-center mb-3">
                                <span class="font-bold">Base de données</span>
                                <span class="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-black uppercase">En ligne</span>
                            </div>
                            <div class="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
                                <div class="bg-green-500 h-full rounded-full" style="width: 98%"></div>
                            </div>
                            <div class="mt-2 text-xs text-muted-color">Uptime: 99.9% | Latence: 12ms</div>
                        </div>

                        <div class="p-4 rounded-2xl bg-white dark:bg-surface-800 shadow-sm border border-surface-100 dark:border-surface-700">
                            <div class="flex justify-between items-center mb-3">
                                <span class="font-bold">Serveur Keycloak</span>
                                <span class="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-black uppercase">Connecté</span>
                            </div>
                            <div class="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
                                <div class="bg-blue-500 h-full rounded-full" style="width: 100%"></div>
                            </div>
                            <div class="mt-2 text-xs text-muted-color">Sincronisation: OK | Utilisateurs: {{ userCount() }}</div>
                        </div>

                        <div class="p-4 rounded-2xl bg-white dark:bg-surface-800 shadow-sm border border-surface-100 dark:border-surface-700">
                            <div class="flex justify-between items-center mb-3">
                                <span class="font-bold">Stockage Alfresco</span>
                                <span class="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-black uppercase">85% Plein</span>
                            </div>
                            <div class="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
                                <div class="bg-orange-500 h-full rounded-full" style="width: 85%"></div>
                            </div>
                            <div class="mt-2 text-xs text-muted-color">Utilisé: 42.5 GB / 50 GB</div>
                        </div>
                    </div>
                    
                    <div class="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700">
                        <button class="p-button p-button-outlined w-full rounded-xl">
                            <i class="pi pi-refresh mr-2"></i> Redémarrer Services
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AdminDashboard implements OnInit {
    private userService = inject(UserService);
    private internshipService = inject(InternshipService);
    private stageService = inject(StageService);

    userCount = signal(0);
    newUserCount = signal(0);
    offerCount = signal(0);
    pendingOfferCount = signal(0);
    activeStageCount = signal(0);
    totalStageCount = signal(0);
    recentUsers = signal<User[]>([]);

    async ngOnInit() {
        this.loadData();
    }

    async loadData() {
        try {
            const users = await this.userService.getUsers();
            this.userCount.set(users.length);
            this.recentUsers.set(users.slice(0, 5));
            this.newUserCount.set(Math.floor(users.length * 0.1)); // Simulation

            const offers = await this.internshipService.getOffersWithRecommendations();
            this.offerCount.set(offers.length);
            this.pendingOfferCount.set(offers.filter(o => !o.id).length);

            const stages = await this.stageService.getAllStages();
            this.totalStageCount.set(stages.length);
            
            const activeStages = await this.stageService.getAllStagesEnCours();
            this.activeStageCount.set(activeStages.length);

        } catch (err) {
            console.error('Error loading admin dashboard data', err);
        }
    }

    getRoleBadgeClass(role: string | undefined): string {
        switch (role?.toLowerCase()) {
            case 'admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            case 'rh': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'encadrant': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300';
            case 'stagiaire': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300';
        }
    }
}

