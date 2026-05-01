import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { InternshipService, InternshipApplication } from '../../../services/internship.service';

@Component({
    standalone: true,
    selector: 'app-rh-dashboard',
    imports: [CommonModule],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <!-- Summary Stats -->
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none shadow-lg">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-blue-100 font-medium mb-4 uppercase text-xs tracking-wider">Offres Publiées</span>
                            <div class="text-white font-extrabold text-3xl">{{ offerCount() }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-white/20 rounded-xl" style="width: 3.5rem; height: 3.5rem">
                            <i class="pi pi-briefcase text-white text-2xl!"></i>
                        </div>
                    </div>
                    <div class="text-sm font-bold text-blue-100">
                        <i class="pi pi-arrow-up mr-1 text-xs"></i> 3 cette semaine
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0 bg-gradient-to-br from-orange-500 to-orange-700 text-white border-none shadow-lg">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-orange-100 font-medium mb-4 uppercase text-xs tracking-wider">Candidatures</span>
                            <div class="text-white font-extrabold text-3xl">{{ applicationCount() }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-white/20 rounded-xl" style="width: 3.5rem; height: 3.5rem">
                            <i class="pi pi-users text-white text-2xl!"></i>
                        </div>
                    </div>
                    <div class="text-sm font-bold text-orange-100">
                        {{ pendingCount() }} en attente de revue
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0 bg-gradient-to-br from-cyan-500 to-cyan-700 text-white border-none shadow-lg">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-cyan-100 font-medium mb-4 uppercase text-xs tracking-wider">Entretiens</span>
                            <div class="text-white font-extrabold text-3xl">14</div>
                        </div>
                        <div class="flex items-center justify-center bg-white/20 rounded-xl" style="width: 3.5rem; height: 3.5rem">
                            <i class="pi pi-calendar text-white text-2xl!"></i>
                        </div>
                    </div>
                    <div class="text-sm font-bold text-cyan-100">
                        5 prévus aujourd'hui
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none shadow-lg">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-emerald-100 font-medium mb-4 uppercase text-xs tracking-wider">Acceptation</span>
                            <div class="text-white font-extrabold text-3xl">{{ acceptanceRate() }}%</div>
                        </div>
                        <div class="flex items-center justify-center bg-white/20 rounded-xl" style="width: 3.5rem; height: 3.5rem">
                            <i class="pi pi-chart-line text-white text-2xl!"></i>
                        </div>
                    </div>
                    <div class="text-sm font-bold text-emerald-100">
                        +2% vs mois dernier
                    </div>
                </div>
            </div>

            <!-- Pipeline & Recent Apps -->
            <div class="col-span-12 xl:col-span-8">
                <div class="card border-none shadow-xl">
                    <div class="flex justify-between items-center mb-8">
                        <div>
                            <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Flux de Candidatures</h2>
                            <p class="text-muted-color text-sm">Gestion des talents et scoring IA</p>
                        </div>
                        <div class="flex gap-2">
                            <button class="p-button p-button-sm p-button-outlined">Filtrer</button>
                            <button class="p-button p-button-sm">Nouvelle Offre</button>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="text-muted-color border-b border-surface-200 dark:border-surface-700">
                                    <th class="py-4 px-2 font-semibold">Candidat</th>
                                    <th class="py-4 px-2 font-semibold">Offre Visée</th>
                                    <th class="py-4 px-2 font-semibold text-center">Score IA</th>
                                    <th class="py-4 px-2 font-semibold text-center">Statut</th>
                                    <th class="py-4 px-2 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let app of recentApplications()" class="hover:bg-surface-50 dark:hover:bg-surface-900/50 transition-colors border-b border-surface-100 dark:border-surface-800 last:border-0">
                                    <td class="py-4 px-2">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-primary font-bold">
                                                {{ app.firstName.charAt(0) }}{{ app.lastName.charAt(0) }}
                                            </div>
                                            <div>
                                                <div class="font-bold">{{ app.firstName }} {{ app.lastName }}</div>
                                                <div class="text-xs text-muted-color">Le {{ app.date | date:'dd MMM' }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="py-4 px-2 font-medium max-w-[180px] truncate text-primary">{{ app.offerTitle }}</td>
                                    <td class="py-4 px-2 text-center">
                                        <div class="inline-flex items-center px-2 py-1 rounded-lg font-bold text-sm" 
                                             [ngClass]="getScoreClass(app.iaScore)">
                                            <i class="pi pi-bolt mr-1 text-xs"></i>
                                            {{ app.iaScore }}%
                                        </div>
                                    </td>
                                    <td class="py-4 px-2 text-center">
                                        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" 
                                              [ngClass]="getStatusClass(app.status)">
                                            {{ app.status }}
                                        </span>
                                    </td>
                                    <td class="py-4 px-2 text-right">
                                        <button class="p-button p-button-text p-button-sm p-button-rounded">
                                            <i class="pi pi-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="col-span-12 xl:col-span-4 flex flex-col gap-8">
                <!-- Recruitment Health -->
                <div class="card border-none shadow-xl">
                    <div class="font-bold text-xl mb-6">Pipeline de Recrutement</div>
                    <div class="flex flex-col gap-6">
                        <div>
                            <div class="flex justify-between text-sm mb-2">
                                <span class="font-medium text-muted-color">Nouvelles Candidatures</span>
                                <span class="font-bold">{{ pendingCount() }}</span>
                            </div>
                            <div class="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-2">
                                <div class="bg-blue-500 h-full rounded-full" [style.width]="(pendingCount() / applicationCount() * 100) + '%'"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between text-sm mb-2">
                                <span class="font-medium text-muted-color">En Cours d'Entretien</span>
                                <span class="font-bold">14</span>
                            </div>
                            <div class="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-2">
                                <div class="bg-orange-500 h-full rounded-full" style="width: 35%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between text-sm mb-2">
                                <span class="font-medium text-muted-color">Offres Acceptées</span>
                                <span class="font-bold">28</span>
                            </div>
                            <div class="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-2">
                                <div class="bg-emerald-500 h-full rounded-full" style="width: 65%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Insights -->
                <div class="card border-none shadow-xl bg-primary text-white overflow-hidden relative">
                    <div class="relative z-10">
                        <div class="font-bold text-xl mb-2 flex items-center gap-2">
                            <i class="pi pi-sparkles"></i>
                            <span>Intelligence Artificielle</span>
                        </div>
                        <p class="text-blue-100 text-sm mb-6">3 candidats ont été identifiés comme "Match Parfait" pour vos offres en cours.</p>
                        <button class="p-button p-button-white p-button-sm w-full font-bold">Voir Recommandations</button>
                    </div>
                    <i class="pi pi-bolt absolute right-[-20px] bottom-[-20px] text-white/10 text-[120px]"></i>
                </div>
            </div>
        </div>
    `
})
export class RHDashboard implements OnInit {
    private internshipService = inject(InternshipService);

    offerCount = signal(0);
    applicationCount = signal(0);
    pendingCount = signal(0);
    recentApplications = signal<InternshipApplication[]>([]);
    acceptanceRate = signal(18);

    async ngOnInit() {
        this.loadData();
    }

    async loadData() {
        try {
            const offers = await this.internshipService.getOffersWithRecommendations();
            this.offerCount.set(offers.length);

            const apps = this.internshipService.getApplications();
            this.applicationCount.set(apps().length);
            this.pendingCount.set(apps().filter(a => a.status === 'EN_ATTENTE').length);
            this.recentApplications.set(apps().slice(0, 5));

        } catch (err) {
            console.error('Error loading RH dashboard data', err);
        }
    }

    getScoreClass(score: number | undefined): string {
        if (!score) return 'bg-surface-100 text-surface-400';
        if (score >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
        if (score >= 60) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    }

    getStatusClass(status: string | undefined): string {
        switch (status) {
            case 'EN_ATTENTE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'ACCEPTEE': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
            case 'REFUSEE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300';
        }
    }
}

