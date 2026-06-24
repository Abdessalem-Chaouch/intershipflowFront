import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { AttestationService, Attestation } from '@/app/services/attestation.service';
import { UserService, User } from '@/app/services/user.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
    selector: 'app-gestion-attestations',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, TooltipModule, ToastModule, TagModule],
    providers: [MessageService],
    animations: [
        trigger('listAnimation', [
            transition('* <=> *', [
                query(':enter', [
                    style({ opacity: 0, transform: 'translateY(20px)' }),
                    stagger('50ms', animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
                ], { optional: true })
            ])
        ])
    ],
    template: `
        <div class="p-4 md:p-8 bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen">
            <!-- Header Section -->
            <div class="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div class="space-y-2">
                    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Gestion des <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Attestations</span>
                    </h1>
                    <p class="text-slate-500 dark:text-slate-400 font-medium text-lg flex items-center gap-2">
                        <i class="pi pi-verified text-blue-500"></i>
                        Supervision et archivage des attestations de stage.
                    </p>
                </div>
                
                <div class="flex flex-col sm:flex-row items-center gap-4">
                    <div class="relative group w-full sm:w-auto">
                        <input pInputText type="text" [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)"
                               placeholder="Rechercher un stagiaire ou une offre..." 
                               class="w-full sm:w-80 pl-11 pr-4 py-3 rounded-2xl border-none bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" />
                    </div>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div class="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-5 group hover:shadow-md transition-all">
                    <div class="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <i class="pi pi-file-pdf text-2xl"></i>
                    </div>
                    <div>
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Attestations</p>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white">{{ stats().total }}</h3>
                    </div>
                </div>
                
                <div class="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-5 group hover:shadow-md transition-all">
                    <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <i class="pi pi-users text-2xl"></i>
                    </div>
                    <div>
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Stagiaires Certifiés</p>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white">{{ stats().uniqueUsers }}</h3>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-5 group hover:shadow-md transition-all">
                    <div class="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <i class="pi pi-calendar-plus text-2xl"></i>
                    </div>
                    <div>
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Ce Mois</p>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white">{{ stats().thisMonth }}</h3>
                    </div>
                </div>
            </div>

            <!-- Main Table Card -->
            <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden" [@listAnimation]="filteredAttestations().length">
                <p-table [value]="filteredAttestations()" 
                         [rows]="10" 
                         [paginator]="true" 
                         responsiveLayout="scroll" 
                         styleClass="p-datatable-custom"
                         [showCurrentPageReport]="true"
                         currentPageReportTemplate="{first} - {last} sur {totalRecords}"
                         [rowsPerPageOptions]="[10, 25, 50]">
                    
                    <ng-template pTemplate="header">
                        <tr>
                            <th class="bg-slate-50/50 dark:bg-slate-800/80 py-5 px-8 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest border-b border-slate-100 dark:border-slate-700/50">Stagiaire</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/80 py-5 px-8 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest border-b border-slate-100 dark:border-slate-700/50">Détails du Stage</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/80 py-5 px-8 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest border-b border-slate-100 dark:border-slate-700/50">Période</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/80 py-5 px-8 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest border-b border-slate-100 dark:border-slate-700/50">Délivrée le</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/80 py-5 px-8 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest border-b border-slate-100 dark:border-slate-700/50 text-center">Action</th>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="body" let-attestation>
                        <tr class="hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all group">
                            <td class="py-5 px-8">
                                <div class="flex items-center gap-4">
                                    <div class="relative">
                                        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">
                                            {{ (attestation.user?.firstName?.charAt(0) ?? '') }}{{ (attestation.user?.lastName?.charAt(0) ?? '') }}
                                        </div>
                                        <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm" pTooltip="Dossier complet"></div>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {{ attestation.user?.firstName }} {{ attestation.user?.lastName }}
                                        </span>
                                        <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">#{{ attestation.username }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="py-5 px-8">
                                <div class="flex flex-col gap-1">
                                    <span class="text-slate-700 dark:text-slate-200 font-semibold leading-tight">{{ attestation.nomOffre }}</span>
                                    <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">ID STAGE: {{ attestation.stageId }}</span>
                                </div>
                            </td>
                            <td class="py-5 px-8">
                                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-bold">
                                    <i class="pi pi-calendar text-[10px]"></i>
                                    {{ attestation.dateDebut | date:'dd MMM yyyy' }} - {{ attestation.dateFin | date:'dd MMM yyyy' }}
                                </div>
                            </td>
                            <td class="py-5 px-8">
                                <div class="flex flex-col">
                                    <span class="text-slate-600 dark:text-slate-300 font-medium text-sm">{{ attestation.dateGeneration | date:'dd/MM/yyyy' }}</span>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase">{{ attestation.dateGeneration | date:'HH:mm' }}</span>
                                </div>
                            </td>
                            <td class="py-5 px-8 text-center">
                                <button (click)="download(attestation)" 
                                        class="inline-flex items-center justify-center cursor-pointer w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all transform active:scale-90 shadow-sm"
                                        pTooltip="Télécharger le PDF"
                                        tooltipPosition="left">
                                    <i class="pi pi-download"></i>
                                </button>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="5" class="py-32">
                                <div class="flex flex-col items-center justify-center text-center space-y-4">
                                    <div class="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-2">
                                        <i class="pi pi-search text-4xl text-slate-300 dark:text-slate-700"></i>
                                    </div>
                                    <h3 class="text-xl font-bold text-slate-900 dark:text-white">Aucun résultat trouvé</h3>
                                    <p class="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Nous n'avons trouvé aucune attestation correspondant à votre recherche.</p>
                                    <button (click)="searchTerm.set(''); loadAttestations()" 
                                            class="mt-2 px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity">
                                        Effacer les filtres
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <style>
            :host ::ng-deep {
                .p-datatable-custom {
                    .p-paginator {
                        background: transparent;
                        border: none;
                        padding: 1.5rem;
                        
                        .p-paginator-pages .p-paginator-page {
                            &.p-highlight {
                                background: #3b82f6;
                                color: white;
                                border-radius: 12px;
                            }
                            &:not(.p-highlight):hover {
                                background: #eff6ff;
                                color: #3b82f6;
                                border-radius: 12px;
                            }
                        }
                    }
                }
                
                .dark .p-datatable-custom {
                    .p-paginator {
                        .p-paginator-pages .p-paginator-page {
                            &.p-highlight {
                                background: #3b82f6;
                                color: white;
                            }
                            &:not(.p-highlight):hover {
                                background: rgba(59, 130, 246, 0.1);
                                color: #60a5fa;
                            }
                        }
                        .p-paginator-first, .p-paginator-prev, .p-paginator-next, .p-paginator-last {
                            color: #94a3b8;
                            &:hover {
                                background: rgba(255, 255, 255, 0.05);
                                color: white;
                            }
                        }
                    }
                }
            }
        </style>
        <p-toast />
    `
})
export class GestionAttestationsComponent implements OnInit {
    private attestationService = inject(AttestationService);
    private userService = inject(UserService);
    private messageService = inject(MessageService);
    
    attestations = signal<Attestation[]>([]);
    users = signal<User[]>([]);
    searchTerm = signal('');
    loading = signal(false);

    stats = computed(() => {
        const list = this.attestations();
        const now = new Date();
        const thisMonth = list.filter(a => {
            const d = new Date(a.dateGeneration);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        const uniqueUsers = new Set(list.map(a => a.utilisateurId)).size;

        return {
            total: list.length,
            thisMonth,
            uniqueUsers
        };
    });

    mappedAttestations = computed(() => {
        const attestationsList = this.attestations();
        const usersList = this.users();
        return attestationsList.map(att => ({
            ...att,
            user: usersList.find(u => u.id === att.utilisateurId || u.username === att.username)
        }));
    });

    filteredAttestations = computed(() => {
        const term = this.searchTerm().toLowerCase();
        return this.mappedAttestations().filter(a => 
            a.username?.toLowerCase().includes(term) || 
            a.nomOffre?.toLowerCase().includes(term) ||
            a.user?.firstName?.toLowerCase().includes(term) ||
            a.user?.lastName?.toLowerCase().includes(term)
        ).sort((a, b) => new Date(b.dateGeneration).getTime() - new Date(a.dateGeneration).getTime());
    });

    ngOnInit() {
        this.loadAttestations();
        this.loadUsers();
    }

    async loadUsers() {
        try {
            const data = await this.userService.getUsers();
            this.users.set(data);
        } catch (err) {
            console.error('Error loading users', err);
        }
    }

    async loadAttestations() {
        this.loading.set(true);
        try {
            const data = await this.attestationService.getAll();
            this.attestations.set(data);
        } catch (err) {
            console.error('Error loading attestations', err);
        } finally {
            setTimeout(() => this.loading.set(false), 500);
        }
    }

    download(attestation: Attestation) {
        if (attestation.filePath) {
            this.attestationService.downloadFile(attestation.filePath, `attestation_${attestation.username}.pdf`);
            this.messageService.add({ 
                severity: 'success', 
                summary: 'Téléchargement', 
                detail: 'Votre attestation est en cours de téléchargement',
                life: 3000 
            });
        } else {
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Erreur', 
                detail: 'Le fichier n\'est pas disponible',
                life: 3000 
            });
        }
    }
}
