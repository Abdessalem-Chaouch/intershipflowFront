import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../../services/user.service';
import { StageService, Stage } from '../../../services/stage.service';
import { DocumentStageService, DocumentStage } from '../../../services/document-stage.service';

@Component({
    standalone: true,
    selector: 'app-encadrant-dashboard',
    imports: [CommonModule],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <!-- Stats Widgets -->
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-lg border-l-4 border-indigo-500">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Mes Stagiaires</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">{{ myStagiaires().length }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-indigo-100 dark:bg-indigo-400/10 rounded-lg" style="width: 3rem; height: 3rem">
                            <i class="pi pi-users text-indigo-500 text-xl!"></i>
                        </div>
                    </div>
                    <span class="text-indigo-500 font-medium">{{ activeInternCount() }} actifs </span>
                    <span class="text-muted-color">en ce moment</span>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-lg border-l-4 border-orange-500">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">À Valider</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">{{ pendingDocs().length }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-lg" style="width: 3rem; height: 3rem">
                            <i class="pi pi-file-check text-orange-500 text-xl!"></i>
                        </div>
                    </div>
                    <span class="text-orange-500 font-medium">Livrables en attente</span>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-lg border-l-4 border-cyan-500">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Stages Finis</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">12</div>
                        </div>
                        <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-lg" style="width: 3rem; height: 3rem">
                            <i class="pi pi-check-circle text-cyan-500 text-xl!"></i>
                        </div>
                    </div>
                    <span class="text-cyan-500 font-medium">Promotion 2025</span>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-lg border-l-4 border-purple-500">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Réunions</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">2</div>
                        </div>
                        <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-lg" style="width: 3rem; height: 3rem">
                            <i class="pi pi-video text-purple-500 text-xl!"></i>
                        </div>
                    </div>
                    <span class="text-purple-500 font-medium">Prévues cette semaine</span>
                </div>
            </div>

            <!-- Stagiaires List -->
            <div class="col-span-12 xl:col-span-7">
                <div class="card border-none shadow-xl">
                    <div class="font-bold text-xl mb-6 flex items-center gap-2">
                        <i class="pi pi-chart-line text-primary"></i>
                        <span>Suivi de Progression</span>
                    </div>
                    <div class="flex flex-col gap-4">
                        <div *ngFor="let stagiaire of myStagiaires()" class="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-surface-50 dark:bg-surface-900/50 rounded-2xl border border-surface-100 dark:border-surface-800 gap-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md border-2 border-white dark:border-slate-800">
                                    <img *ngIf="stagiaire.photoUrl" [src]="stagiaire.photoUrl" class="w-full h-full object-cover" [alt]="stagiaire.firstName" />
                                    <span *ngIf="!stagiaire.photoUrl">{{ stagiaire.firstName?.charAt(0) }}{{ stagiaire.lastName?.charAt(0) }}</span>
                                </div>
                                <div>
                                    <div class="font-bold text-surface-900 dark:text-surface-0">{{ stagiaire.firstName }} {{ stagiaire.lastName }}</div>
                                    <div class="text-xs text-muted-color">{{ stagiaire.email }}</div>
                                </div>
                            </div>
                            <div class="flex-1 w-full md:max-w-[200px]">
                                <div class="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-tighter">
                                    <span>Progression</span>
                                    <span>65%</span>
                                </div>
                                <div class="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5 overflow-hidden">
                                    <div class="bg-indigo-500 h-full rounded-full" style="width: 65%"></div>
                                </div>
                            </div>
                            <button class="p-button p-button-text p-button-sm p-button-rounded">
                                <i class="pi pi-arrow-right"></i>
                            </button>
                        </div>
                        
                        <div *ngIf="myStagiaires().length === 0" class="text-center py-8 text-muted-color">
                            <i class="pi pi-info-circle text-2xl mb-2"></i>
                            <p>Aucun stagiaire assigné pour le moment.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pending Documents -->
            <div class="col-span-12 xl:col-span-5">
                <div class="card border-none shadow-xl bg-surface-0 dark:bg-surface-900">
                    <div class="font-bold text-xl mb-6">Livrables à Valider</div>
                    <div class="flex flex-col gap-4">
                        <div *ngFor="let doc of pendingDocs()" class="p-4 border rounded-2xl hover:border-primary transition-all cursor-pointer group">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                    <i class="pi pi-file-pdf text-xl!"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="font-bold text-sm">{{ doc.type }}</div>
                                    <div class="text-xs text-muted-color">{{ doc.firstName }} {{ doc.lastName }}</div>
                                </div>
                                <div class="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded uppercase">
                                    À réviser
                                </div>
                            </div>
                        </div>

                        <div *ngIf="pendingDocs().length === 0" class="text-center py-10">
                            <div class="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="pi pi-check text-green-500 text-2xl!"></i>
                            </div>
                            <div class="font-bold">Tout est à jour !</div>
                            <p class="text-sm text-muted-color">Aucun document en attente de validation.</p>
                        </div>
                    </div>
                    <button *ngIf="pendingDocs().length > 0" class="p-button p-button-text w-full mt-6 font-bold">Voir tout le flux</button>
                </div>
            </div>
        </div>
    `
})
export class EncadrantDashboard implements OnInit {
    private userService = inject(UserService);
    private stageService = inject(StageService);
    private docService = inject(DocumentStageService);

    myStagiaires = signal<User[]>([]);
    pendingDocs = computed(() => {
        return this.docService.getDocuments()().filter(doc => !doc.validationEncadrant);
    });

    activeInternCount = signal(0);

    async ngOnInit() {
        this.docService.fetchDocumentsEncadrant();
        this.loadData();
    }

    async loadData() {
        try {
            const currentUser = this.userService.currentUser();
            if (!currentUser) return;

            // 1. Get my interns
            const allStagiaires = await this.userService.getStagiaires();
            const filteredStagiaires = allStagiaires.filter(s => s.encadrantId === currentUser.id);
            this.myStagiaires.set(filteredStagiaires);
            this.activeInternCount.set(filteredStagiaires.length); // Simulation simplified
        } catch (err) {
            console.error('Error loading encadrant dashboard data', err);
        }
    }
}

