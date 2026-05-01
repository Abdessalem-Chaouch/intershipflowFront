import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { StageService, Stage } from '../../../services/stage.service';
import { DocumentStageService, DocumentStage } from '../../../services/document-stage.service';

@Component({
    standalone: true,
    selector: 'app-stagiaire-dashboard',
    imports: [CommonModule],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <div class="col-span-12 lg:col-span-8">
                <!-- Welcome Banner -->
                <div class="card relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white border-none min-h-[200px] flex flex-col justify-center px-10 shadow-2xl rounded-3xl">
                    <div class="relative z-10">
                        <span class="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Tableau de bord Stagiaire</span>
                        <h2 class="text-4xl font-black mb-2">Ravi de vous revoir, {{ userService.currentUser()?.firstName }} !</h2>
                        <p class="text-blue-100 text-lg max-w-md" *ngIf="activeStage()">
                            Votre stage <strong>"{{ activeStage()?.titreOffre }}"</strong> est en cours. Continuez vos excellents efforts !
                        </p>
                        <p class="text-blue-100 text-lg" *ngIf="!activeStage()">
                            Vous n'avez pas de stage actif pour le moment. Consultez les offres !
                        </p>
                    </div>
                    <div class="absolute right-[-20px] top-[-20px] opacity-10">
                        <i class="pi pi-briefcase text-[250px]"></i>
                    </div>
                </div>

                <!-- Fast Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div class="card mb-0 bg-white dark:bg-surface-900 shadow-xl border-none p-6 rounded-2xl hover:translate-y-[-5px] transition-transform">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                <i class="pi pi-calendar"></i>
                            </div>
                            <span class="text-muted-color font-bold text-sm uppercase tracking-wider">Jours restants</span>
                        </div>
                        <div class="text-3xl font-black text-surface-900 dark:text-surface-0">{{ daysRemaining() }} Jours</div>
                        <div class="mt-4 h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                            <div class="h-full bg-blue-500 rounded-full transition-all duration-1000" [style.width]="progression() + '%'"></div>
                        </div>
                    </div>

                    <div class="card mb-0 bg-white dark:bg-surface-900 shadow-xl border-none p-6 rounded-2xl hover:translate-y-[-5px] transition-transform">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                <i class="pi pi-file-check"></i>
                            </div>
                            <span class="text-muted-color font-bold text-sm uppercase tracking-wider">Docs Validés</span>
                        </div>
                        <div class="text-3xl font-black text-surface-900 dark:text-surface-0">{{ validatedDocCount() }} / {{ myDocs().length }}</div>
                        <div class="mt-4 flex gap-1">
                            <div *ngFor="let doc of myDocs()" 
                                 class="h-1.5 flex-1 rounded-full" 
                                 [ngClass]="doc.validationEncadrant ? 'bg-emerald-500' : 'bg-surface-200 dark:bg-surface-700'">
                            </div>
                        </div>
                    </div>

                    <div class="card mb-0 bg-white dark:bg-surface-900 shadow-xl border-none p-6 rounded-2xl hover:translate-y-[-5px] transition-transform">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                                <i class="pi pi-star"></i>
                            </div>
                            <span class="text-muted-color font-bold text-sm uppercase tracking-wider">Moyenne</span>
                        </div>
                        <div class="text-3xl font-black text-surface-900 dark:text-surface-0">{{ averageGrade() }}/20</div>
                        <div class="mt-1 text-[10px] text-muted-color font-bold italic uppercase tracking-widest">Évaluation Encadrant</div>
                    </div>
                </div>

                <!-- Roadmap -->
                <div class="card mt-8 border-none shadow-xl rounded-2xl">
                    <div class="flex justify-between items-center mb-8">
                        <h3 class="text-xl font-bold">Ma Roadmap de Stage</h3>
                        <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">Phase de développement</span>
                    </div>
                    <div class="flex flex-col gap-8 relative ml-4 border-l-2 border-dashed border-surface-200 dark:border-surface-700">
                        <div class="flex gap-6 relative items-start">
                            <div class="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-white dark:ring-surface-900">
                                <i class="pi pi-check text-[8px]"></i>
                            </div>
                            <div class="flex-1 bg-surface-50 dark:bg-surface-900/30 p-4 rounded-xl">
                                <div class="font-bold text-surface-900 dark:text-surface-0">Installation & Setup</div>
                                <div class="text-xs text-muted-color">Complété avec succès</div>
                            </div>
                        </div>
                        <div class="flex gap-6 relative items-start">
                            <div class="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white ring-4 ring-white dark:ring-surface-900 animate-pulse">
                                <i class="pi pi-sync text-[8px]"></i>
                            </div>
                            <div class="flex-1 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                <div class="font-bold text-blue-600 dark:text-blue-400">Développement de l'application</div>
                                <div class="text-xs text-blue-400">En cours... Prochaine revue le 30 Avril</div>
                            </div>
                        </div>
                        <div class="flex gap-6 relative items-start opacity-40">
                            <div class="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-surface-300 dark:bg-surface-600 flex items-center justify-center text-white ring-4 ring-white dark:ring-surface-900">
                                <i class="pi pi-lock text-[8px]"></i>
                            </div>
                            <div class="flex-1 p-4">
                                <div class="font-bold">Soutenance & Rapport Final</div>
                                <div class="text-xs text-muted-color">À débloquer en Juin</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4">
                <!-- Encadrant Card -->
                <div class="card border-none shadow-xl rounded-2xl bg-gradient-to-br from-surface-0 to-surface-50 dark:from-surface-900 dark:to-surface-950 p-0 overflow-hidden">
                    <div class="h-24 bg-primary"></div>
                    <div class="px-6 pb-8 flex flex-col items-center -mt-12">
                        <div class="w-24 h-24 rounded-full border-4 border-white dark:border-surface-900 bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4 shadow-xl">
                            <i class="pi pi-user text-4xl text-primary"></i>
                        </div>
                        <div class="font-black text-xl mb-1 text-center">Encadrant SIGA</div>
                        <div class="text-xs text-muted-color mb-6 uppercase font-bold tracking-widest">Expert Technique</div>
                        
                        <div class="w-full flex flex-col gap-2">
                            <button class="p-button p-button-sm rounded-xl w-full">
                                <i class="pi pi-envelope mr-2 text-xs"></i> Envoyer un message
                            </button>
                            <button class="p-button p-button-sm p-button-outlined rounded-xl w-full">
                                <i class="pi pi-calendar mr-2 text-xs"></i> Prendre RDV
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Recent Docs -->
                <div class="card mt-8 border-none shadow-xl rounded-2xl">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="font-bold text-lg">Mes Documents</h3>
                        <i class="pi pi-file-pdf text-muted-color"></i>
                    </div>
                    <div class="flex flex-col gap-4">
                        <div *ngFor="let doc of myDocs()" class="flex items-center gap-4 p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer border border-transparent hover:border-primary/20">
                            <div class="w-10 h-10 rounded-lg bg-white dark:bg-surface-800 flex items-center justify-center text-primary shadow-sm">
                                <i class="pi pi-file"></i>
                            </div>
                            <div class="flex-1 truncate">
                                <div class="font-bold text-sm truncate">{{ doc.type }}</div>
                                <div class="text-[10px] uppercase font-black" [ngClass]="doc.validationEncadrant ? 'text-emerald-500' : 'text-orange-500'">
                                    {{ doc.validationEncadrant ? 'Validé' : 'En attente' }}
                                </div>
                            </div>
                            <i class="pi pi-chevron-right text-[10px] text-muted-color"></i>
                        </div>

                        <div *ngIf="myDocs().length === 0" class="text-center py-6 text-muted-color italic text-sm">
                            Aucun document déposé.
                        </div>
                    </div>
                    <button class="p-button p-button-text p-button-sm w-full mt-4 font-bold">Gérer mes fichiers</button>
                </div>
            </div>
        </div>
    `
})
export class StagiaireDashboard implements OnInit {
    userService = inject(UserService);
    private stageService = inject(StageService);
    private docService = inject(DocumentStageService);

    activeStage = signal<Stage | null>(null);
    myDocs = signal<DocumentStage[]>([]);
    daysRemaining = signal(0);
    progression = signal(0);
    validatedDocCount = signal(0);
    averageGrade = signal(0);

    async ngOnInit() {
        this.loadData();
    }

    async loadData() {
        try {
            // 1. Get active stage
            const stage = await this.stageService.getStageActif();
            this.activeStage.set(stage);

            if (stage) {
                // Calculate days remaining
                const end = new Date(stage.dateFin);
                const start = new Date(stage.dateDebut);
                const today = new Date();
                
                const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                this.daysRemaining.set(diff > 0 ? diff : 0);
                
                const elapsed = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                const prog = Math.round((elapsed / totalDays) * 100);
                this.progression.set(prog > 100 ? 100 : (prog < 0 ? 0 : prog));
            }

            // 2. Get my documents
            const docs = await this.docService.getMesDocuments();
            this.myDocs.set(docs);
            this.validatedDocCount.set(docs.filter(d => d.validationEncadrant).length);
            
            const gradedDocs = docs.filter(d => d.noteEncadrant !== undefined);
            if (gradedDocs.length > 0) {
                const avg = gradedDocs.reduce((acc, doc) => acc + (doc.noteEncadrant || 0), 0) / gradedDocs.length;
                this.averageGrade.set(Math.round(avg * 10) / 10);
            }

        } catch (err) {
            console.error('Error loading stagiaire dashboard data', err);
        }
    }
}

