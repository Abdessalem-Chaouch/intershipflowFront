import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AttestationService, Attestation } from '@/app/services/attestation.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-mes-attestations',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TooltipModule, ToastModule],
    providers: [MessageService],
    template: `
        <div class="p-4 md:p-8 min-h-[calc(100vh-6rem)] bg-slate-50/50 dark:bg-[#0f172a] transition-colors duration-300">
            
            <!-- Hero Header -->
            <div class="relative bg-gradient-to-br from-blue-50/80 via-white to-blue-50/50 dark:from-slate-800 dark:via-slate-900 dark:to-blue-950 border border-blue-100 dark:border-slate-800/80 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-xl shadow-blue-900/5 dark:shadow-blue-900/10 mb-10">
                <!-- Decorative Elements -->
                <div class="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 text-[#063970] dark:text-white">
                    <i class="pi pi-verified text-[20rem]"></i>
                </div>
                <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-400 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-20 dark:opacity-40"></div>
                <div class="absolute -top-32 -right-32 w-80 h-80 bg-emerald-300 dark:bg-emerald-400 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-20 dark:opacity-40"></div>

                <div class="relative z-10">
                    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 dark:bg-white/10 border border-blue-200/60 dark:border-white/20 text-blue-700 dark:text-white text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-md shadow-sm">
                        <i class="pi pi-sparkles text-yellow-500 dark:text-yellow-300"></i>
                        <span>Espace Documents Officiels</span>
                    </div>
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 class="text-4xl md:text-5xl font-black text-[#063970] dark:text-white tracking-tight mb-4">Mes Attestations</h1>
                            <p class="text-slate-600 dark:text-slate-300 text-lg max-w-2xl leading-relaxed">
                                Retrouvez et téléchargez vos attestations de stage. Ces documents certifient officiellement votre parcours et les compétences acquises.
                            </p>
                        </div>
                        <div class="flex-shrink-0 bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-blue-100 dark:border-white/20 rounded-3xl p-5 flex flex-col items-center justify-center min-w-[150px] shadow-sm dark:shadow-lg">
                            <span class="text-5xl font-black text-[#063970] dark:text-white">{{ attestations().length }}</span>
                            <span class="text-blue-600 dark:text-blue-200 text-xs font-bold uppercase tracking-widest mt-2">Générées</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Grid View -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                <ng-container *ngIf="attestations().length > 0; else emptyState">
                    <div *ngFor="let attestation of attestations()" 
                         class="group relative bg-white dark:bg-slate-800/80 rounded-[2rem] p-6 sm:p-8 border border-slate-200/60 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 dark:hover:shadow-black/40 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col h-full backdrop-blur-xl">
                        
                        <!-- Decorative Top Highlight -->
                        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-[#063970] to-blue-600 dark:from-blue-600 dark:via-blue-400 dark:to-indigo-500 opacity-90 group-hover:h-2 transition-all duration-300"></div>
                        
                        <!-- Card Header -->
                        <div class="flex items-start justify-between mb-8 relative z-10">
                            <div class="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:border-blue-100 dark:group-hover:border-blue-800 transition-all duration-500">
                                <i class="pi pi-id-card text-3xl text-slate-400 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400 transition-colors"></i>
                            </div>
                            
                            <div class="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200/50 dark:border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                                <i class="pi pi-check-circle"></i> Certifié
                            </div>
                        </div>

                        <!-- Card Body -->
                        <div class="mb-8 relative z-10 flex-1">
                            <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-5 line-clamp-2 group-hover:text-[#063970] dark:group-hover:text-blue-400 transition-colors leading-tight">
                                {{ attestation.nomOffre }}
                            </h3>
                            
                            <div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                                <div class="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                                    <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-blue-500 dark:text-blue-400 border border-slate-100 dark:border-slate-700">
                                        <i class="pi pi-calendar-clock text-lg"></i>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Période du stage</span>
                                        <span>{{ attestation.dateDebut | date:'dd MMM yyyy' }} <span class="text-slate-400 mx-1">→</span> {{ attestation.dateFin | date:'dd MMM yyyy' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Card Footer -->
                        <div class="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700 relative z-10 mt-auto">
                            <div class="flex flex-col">
                                <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Générée le</span>
                                <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ attestation.dateGeneration | date:'dd/MM/yyyy' }}</span>
                            </div>
                            
                            <p-button icon="pi pi-cloud-download" label="Obtenir" [rounded]="true" 
                                      styleClass="bg-slate-900 hover:bg-[#063970] dark:bg-white dark:text-slate-900 dark:hover:bg-blue-50 text-white font-bold border-none shadow-md shadow-slate-900/20 px-5 py-2.5 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5"
                                      (click)="download(attestation)"></p-button>
                        </div>
                    </div>
                </ng-container>

                <ng-template #emptyState>
                    <div class="col-span-full py-20 px-6 bg-white dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-slate-200 border-dashed dark:border-slate-700 shadow-sm">
                        <div class="max-w-md mx-auto text-center">
                            <div class="w-32 h-32 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-8 relative border border-slate-100 dark:border-slate-800">
                                <div class="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-full animate-ping opacity-20"></div>
                                <i class="pi pi-folder-open text-6xl text-slate-300 dark:text-slate-600"></i>
                            </div>
                            <h3 class="text-2xl font-black text-slate-800 dark:text-white mb-4">Aucune attestation pour le moment</h3>
                            <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
                                Vos attestations apparaîtront ici sous forme de cartes documentaires une fois que vos stages auront été marqués comme terminés et validés par l'administration.
                            </p>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
        <p-toast />
    `
})
export class MesAttestationsComponent implements OnInit {
    private attestationService = inject(AttestationService);
    attestations = signal<Attestation[]>([]);

    ngOnInit() {
        this.loadAttestations();
    }

    async loadAttestations() {
        try {
            const data = await this.attestationService.getMyAttestations();
            this.attestations.set(data);
        } catch (err) {
            console.error('Error loading attestations', err);
        }
    }

    download(attestation: Attestation) {
        if (attestation.filePath) {
            this.attestationService.downloadFile(attestation.filePath, `attestation_${attestation.nomOffre}.pdf`);
        }
    }
}
