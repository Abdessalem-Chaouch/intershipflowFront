import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AffectationService, StagiaireDetailsDTO } from '@/app/services/affectation.service';
import { LayoutService } from '@/app/layout/service/layout.service';
import { Router } from '@angular/router';
import { AttestationService, Attestation } from '@/app/services/attestation.service';
import { StageService, EtatStage } from '@/app/services/stage.service';

export interface GroupedStagiaire {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    photoUrl?: string;
    cin?: string;
    phone?: string;
    address?: string;
    etat: string;
    titreOffre: string;
    numeroStage: number;
    dateDebut: string;
    dateFin: string;
    documentsValides: boolean;
    stages: {
        stageId?: number;
        candidatureId: number;
        offreStageId: number;
        titreOffre: string;
        numeroStage: number;
        etat: string;
        dateDebut: string;
        dateFin: string;
        documentsValides: boolean;
    }[];
}

@Component({
    selector: 'app-mes-stagiaires',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TagModule,
        AvatarModule,
        TooltipModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        ToastModule,
        ConfirmDialogModule
    ],
    template: `
        <div class="p-6 min-h-screen transition-colors duration-500" [ngClass]="layoutService.isDarkTheme() ? 'bg-[#0f172a]' : 'bg-slate-50/50'">
            <!-- Header Section -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 p-8 rounded-3xl transition-all duration-500"
                [ngClass]="layoutService.isDarkTheme() ? 'bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/5 shadow-2xl' : 'bg-white border border-slate-100 shadow-sm'">
                
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <span class="w-2.5 h-8 bg-blue-600 rounded-full shadow-sm"></span>
                        <h1 class="text-3xl font-black tracking-tight m-0" [ngClass]="layoutService.isDarkTheme() ? 'text-white' : 'text-slate-900'">
                            Mes Stagiaires
                        </h1>
                    </div>
                    <p class="text-sm font-medium m-0" [ngClass]="layoutService.isDarkTheme() ? 'text-slate-400' : 'text-slate-500'">
                        Suivez l'avancement et gérez les documents de vos stagiaires affectés.
                    </p>
                </div>

                <div class="flex flex-col sm:flex-row items-center gap-4">
                    <!-- Stats Badges -->
                    <div class="flex items-center gap-3 bg-blue-500/5 px-4 py-2 rounded-2xl border border-blue-500/10">
                        <div class="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-500/20">
                            {{ stagiaires().length }}
                        </div>
                        <span class="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Total Affectés</span>
                    </div>

                    <p-iconfield class="w-full sm:w-72">
                        <p-inputicon [styleClass]="layoutService.isDarkTheme() ? 'pi pi-search text-blue-400' : 'pi pi-search text-slate-400'" />
                        <input pInputText type="text" (input)="onSearch($event)" placeholder="Rechercher un stagiaire..." 
                            [ngClass]="layoutService.isDarkTheme() ? 'bg-white/5 border-white/10 text-white focus:ring-blue-500/20' : 'bg-slate-50 border-slate-100 focus:ring-blue-500/10'"
                            class="w-full rounded-2xl px-12 py-3.5 border transition-all text-sm font-medium shadow-sm" />
                    </p-iconfield>
                </div>
            </div>

            <!-- Trainee Grid -->
            <div *ngIf="loading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div *ngFor="let i of [1,2,3,4,5,6]" class="h-64 rounded-3xl animate-pulse"
                    [ngClass]="layoutService.isDarkTheme() ? 'bg-white/5' : 'bg-white shadow-sm'"></div>
            </div>

            <div *ngIf="!loading() && filteredStagiaires().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadein">
                <div *ngFor="let stagiaire of filteredStagiaires()" 
                    class="group relative flex flex-col overflow-hidden rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                    [ngClass]="layoutService.isDarkTheme() ? 'bg-[#1e293b] border-white/5 shadow-blue-500/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'">
                    
                    <!-- Top Section: Background & Badge -->
                    <div class="h-24 absolute top-0 left-0 right-0 opacity-10 bg-gradient-to-r"
                        [ngClass]="getStatusGradient(stagiaire.stages[getCurrentIndex(stagiaire.id)].etat)"></div>
                    
                    <div class="p-8 pt-10 flex-1 relative z-10">
                        <div class="flex items-start justify-between mb-6">
                            <div class="relative">
                                <!-- Image Avatar -->
                                <p-avatar *ngIf="stagiaire.photoUrl"
                                    [image]="stagiaire.photoUrl" 
                                    shape="circle" size="xlarge" 
                                    [styleClass]="layoutService.isDarkTheme() ? 'shadow-xl border-4 border-slate-800 ring-4 ring-white/5 object-cover' : 'shadow-xl border-4 border-white ring-4 ring-slate-50 object-cover'" />
                                
                                <!-- Initials Avatar (Fallback) -->
                                <p-avatar *ngIf="!stagiaire.photoUrl"
                                    [label]="(stagiaire.firstName.charAt(0) + stagiaire.lastName.charAt(0)).toUpperCase()"
                                    shape="circle" size="xlarge" 
                                    [styleClass]="layoutService.isDarkTheme() ? 'shadow-xl border-4 border-slate-800 ring-4 ring-white/5 font-black text-blue-400 bg-slate-800' : 'shadow-xl border-4 border-white ring-4 ring-slate-50 font-black text-[#063970] bg-slate-50'" />
                                
                                <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 shadow-sm flex items-center justify-center text-[10px]"
                                    [ngClass]="[getStatusColor(stagiaire.stages[getCurrentIndex(stagiaire.id)].etat), layoutService.isDarkTheme() ? 'border-[#1e293b]' : 'border-white']">
                                    <i [class]="getStatusIcon(stagiaire.stages[getCurrentIndex(stagiaire.id)].etat)"></i>
                                </div>
                            </div>
                            <p-tag [value]="stagiaire.stages[getCurrentIndex(stagiaire.id)].etat" [severity]="getSeverity(stagiaire.stages[getCurrentIndex(stagiaire.id)].etat)" 
                                styleClass="text-[9px] font-black uppercase px-3 py-1.5 rounded-xl shadow-sm" />
                        </div>



                        <div class="flex flex-col mb-6">
                            <div class="flex items-center justify-between gap-3 mb-1">
                                <h3 class="text-xl font-black m-0 leading-tight" [ngClass]="layoutService.isDarkTheme() ? 'text-white' : 'text-slate-800'">
                                    {{ stagiaire.firstName }} {{ stagiaire.lastName }}
                                </h3>
                                <p-button icon="pi pi-envelope" [rounded]="true" [text]="true"
                                    pTooltip="Envoyer un email"
                                    (onClick)="sendEmail(stagiaire)"
                                    [styleClass]="layoutService.isDarkTheme() ? 'w-8 h-8 p-0 text-blue-400 hover:bg-blue-400/10 border-none' : 'w-8 h-8 p-0 text-[#063970] hover:bg-blue-50 border-none'" />
                            </div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-[10px] font-bold text-blue-500">&#64;{{ stagiaire.username }}</span>
                                <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span class="text-[10px] font-medium text-slate-400 truncate">{{ stagiaire.email }}</span>
                            </div>
                            <div class="flex items-center gap-x-3 gap-y-1.5 text-[10px] font-medium transition-colors overflow-hidden" [ngClass]="layoutService.isDarkTheme() ? 'text-slate-400' : 'text-slate-500'">
                                <div class="flex items-center gap-1 shrink-0" *ngIf="stagiaire.cin" pTooltip="CIN" tooltipPosition="top">
                                    <i class="pi pi-id-card text-[9px] opacity-70"></i>
                                    <span>{{ stagiaire.cin }}</span>
                                </div>
                                <div class="flex items-center gap-1 shrink-0" *ngIf="stagiaire.phone" pTooltip="Téléphone" tooltipPosition="top">
                                    <i class="pi pi-phone text-[9px] opacity-70"></i>
                                    <span>{{ stagiaire.phone }}</span>
                                </div>
                                <div class="flex items-center gap-1 min-w-0" *ngIf="stagiaire.address" pTooltip="Adresse" tooltipPosition="top">
                                    <i class="pi pi-map-marker text-[9px] opacity-70 shrink-0"></i>
                                    <span class="truncate">{{ stagiaire.address }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Internship Carousel Info -->
                        <div class="p-5 rounded-3xl mb-6 border transition-all duration-300 relative"
                            [ngClass]="layoutService.isDarkTheme() ? 'bg-white/5 border-white/5' : 'bg-slate-50/50 border-slate-100'">
                            
                            <!-- Carousel Navigation header -->
                            <div class="flex items-center justify-between mb-4 pb-3 border-b"
                                 [class.border-white/5]="layoutService.isDarkTheme()"
                                 [class.border-slate-200/50]="!layoutService.isDarkTheme()">
                                <button (click)="prevStage(stagiaire.id)"
                                        [disabled]="getCurrentIndex(stagiaire.id) === 0"
                                        class="w-7 h-7 rounded-full flex items-center justify-center border transition-all disabled:opacity-30"
                                        [ngClass]="layoutService.isDarkTheme() ? 'border-white/10 hover:bg-white/5 text-blue-400' : 'border-slate-200 hover:bg-slate-100 text-[#063970]'">
                                    <i class="pi pi-chevron-left text-[10px]"></i>
                                </button>
                                
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Stage {{ getCurrentIndex(stagiaire.id) + 1 }} / {{ stagiaire.stages.length }}
                                </span>
                                
                                <button (click)="nextStage(stagiaire.id, stagiaire.stages.length)"
                                        [disabled]="getCurrentIndex(stagiaire.id) === stagiaire.stages.length - 1"
                                        class="w-7 h-7 rounded-full flex items-center justify-center border transition-all disabled:opacity-30"
                                        [ngClass]="layoutService.isDarkTheme() ? 'border-white/10 hover:bg-white/5 text-blue-400' : 'border-slate-200 hover:bg-slate-100 text-[#063970]'">
                                    <i class="pi pi-chevron-right text-[10px]"></i>
                                </button>
                            </div>

                            <!-- Active Stage Details -->
                            <div *ngIf="stagiaire.stages[getCurrentIndex(stagiaire.id)] as stage" class="space-y-4 animate-fadein">
                                <div class="flex items-start gap-3">
                                    <div class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600 text-xs shrink-0"
                                        [class.bg-slate-800]="layoutService.isDarkTheme()">
                                        <i class="pi pi-bookmark"></i>
                                    </div>
                                    <div class="flex flex-col truncate min-w-0">
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Offre</span>
                                        <span class="text-xs font-black truncate" [ngClass]="layoutService.isDarkTheme() ? 'text-blue-300' : 'text-[#063970]'">
                                            {{ stage.titreOffre }}
                                        </span>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-4 border-t pt-3" [class.border-white/5]="layoutService.isDarkTheme()" [class.border-slate-100]="!layoutService.isDarkTheme()">
                                    <div class="flex flex-col">
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Durée</span>
                                        <span class="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                            <i class="pi pi-calendar text-[10px] opacity-50"></i>
                                            {{ stage.dateDebut | date:'dd MMM' }} - {{ stage.dateFin | date:'dd MMM yyyy' }}
                                        </span>
                                    </div>
                                    <div class="flex flex-col items-end">
                                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">N° Stage</span>
                                        <span class="text-[10px] font-black text-slate-900 dark:text-white bg-slate-200/50 dark:bg-white/10 px-2 py-0.5 rounded-lg">
                                            STG-{{ stage.numeroStage }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Documents Status for active stage -->
                                <div class="flex flex-col gap-3 pt-3 border-t" [class.border-white/5]="layoutService.isDarkTheme()" [class.border-slate-100]="!layoutService.isDarkTheme()">
                                    <div class="flex items-center justify-between">
                                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dossier Documents</span>
                                        <div class="flex items-center gap-1.5" [pTooltip]="stage.documentsValides ? 'Documents vérifiés et valides' : 'Documents en attente ou invalides'">
                                            <i class="pi" [ngClass]="stage.documentsValides ? 'pi-check-circle text-emerald-500' : 'pi-clock text-amber-500'"></i>
                                            <span class="text-[10px] font-bold" [ngClass]="stage.documentsValides ? 'text-emerald-500' : 'text-amber-500'">
                                                {{ stage.documentsValides ? 'VALIDE' : 'EN ATTENTE' }}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center justify-between">
                                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attestation Stage</span>
                                        <div class="flex items-center gap-1.5">
                                            <i class="pi" [ngClass]="getAttestationForStagiaire(stagiaire.id) ? 'pi-verified text-blue-500' : 'pi-times-circle text-slate-300'"></i>
                                            <span class="text-[10px] font-bold" [ngClass]="getAttestationForStagiaire(stagiaire.id) ? 'text-blue-500' : 'text-slate-400'">
                                                {{ getAttestationForStagiaire(stagiaire.id) ? 'GÉNÉRÉE' : 'NON GÉNÉRÉE' }}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Actions Block -->
                                <div *ngIf="stage.etat !== 'VALIDE' && stage.etat !== 'NON_VALIDE' && stage.etat !== 'ANNULE'" 
                                     class="flex justify-end pt-3 border-t" [class.border-white/5]="layoutService.isDarkTheme()" [class.border-slate-100]="!layoutService.isDarkTheme()">
                                    <p-button label="Annuler le stage" icon="pi pi-ban" severity="danger" [text]="true" size="small"
                                              (onClick)="confirmCancellation(stage)"
                                              styleClass="p-0 text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-widest border-none hover:bg-transparent" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loading() && filteredStagiaires().length === 0" 
                class="flex flex-col items-center justify-center p-20 text-center animate-fadein">
                <div class="w-32 h-32 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-200 dark:text-slate-700 mb-8">
                    <i class="pi pi-users text-6xl"></i>
                </div>
                <h3 class="text-2xl font-black text-slate-800 dark:text-white mb-2">Aucun stagiaire trouvé</h3>
                <p class="text-slate-400 font-medium max-w-xs mx-auto">
                    {{ searchQuery() ? 'Ajustez votre recherche pour trouver un membre spécifique.' : 'Vous n\'avez aucun stagiaire affecté pour le moment.' }}
                </p>
            </div>
            <p-confirmDialog />
            <p-toast />
        </div>
    `,
    styles: [`
        .animate-fadein {
            animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `],
    providers: [MessageService]
})
export class MesStagiairesComponent implements OnInit {
    stagiaires = signal<GroupedStagiaire[]>([]);
    attestations = signal<Attestation[]>([]);
    loading = signal(true);
    searchQuery = signal('');
    activeStageIndexes = signal<Record<string, number>>({});

    filteredStagiaires = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        if (!query) return this.stagiaires();
        return this.stagiaires().filter(s => 
            s.firstName.toLowerCase().includes(query) || 
            s.lastName.toLowerCase().includes(query) || 
            s.username.toLowerCase().includes(query) ||
            s.titreOffre.toLowerCase().includes(query)
        );
    });

    constructor(
        private affectationService: AffectationService,
        private attestationService: AttestationService,
        public layoutService: LayoutService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private stageService: StageService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadStagiaires();
    }

    onSearch(event: any) {
        this.searchQuery.set(event.target.value);
    }

    getCurrentIndex(stagiaireId: string): number {
        return this.activeStageIndexes()[stagiaireId] ?? 0;
    }

    prevStage(stagiaireId: string) {
        this.activeStageIndexes.update(indexes => {
            const current = indexes[stagiaireId] ?? 0;
            if (current > 0) {
                return { ...indexes, [stagiaireId]: current - 1 };
            }
            return indexes;
        });
    }

    nextStage(stagiaireId: string, max: number) {
        this.activeStageIndexes.update(indexes => {
            const current = indexes[stagiaireId] ?? 0;
            if (current < max - 1) {
                return { ...indexes, [stagiaireId]: current + 1 };
            }
            return indexes;
        });
    }

    async loadStagiaires() {
        this.loading.set(true);
        try {
            const [data, atts] = await Promise.all([
                this.affectationService.getMyStagiaires(),
                this.attestationService.getAttestationsByEncadrant()
            ]);
            
            // Format photoUrl for each stagiaire
            const formattedData = data.map(s => {
                if (s.photoUrl && !s.photoUrl.startsWith('http')) {
                    s.photoUrl = `http://localhost:8081/profile/photo/${s.photoUrl}`;
                }
                return s;
            });
            
            // Group stagiaires by user ID (id)
            const groupedMap: Record<string, GroupedStagiaire> = {};
            
            for (const s of formattedData) {
                const userId = s.id;
                if (!groupedMap[userId]) {
                    groupedMap[userId] = {
                        id: s.id,
                        firstName: s.firstName,
                        lastName: s.lastName,
                        username: s.username,
                        email: s.email,
                        photoUrl: s.photoUrl,
                        cin: s.cin,
                        phone: s.phone,
                        address: s.address,
                        etat: s.etat,
                        titreOffre: s.titreOffre,
                        numeroStage: s.numeroStage,
                        dateDebut: s.dateDebut,
                        dateFin: s.dateFin,
                        documentsValides: s.documentsValides,
                        stages: []
                    };
                }
                
                groupedMap[userId].stages.push({
                    stageId: s.stageId,
                    candidatureId: s.candidatureId,
                    offreStageId: s.offreStageId,
                    titreOffre: s.titreOffre,
                    numeroStage: s.numeroStage,
                    etat: s.etat,
                    dateDebut: s.dateDebut,
                    dateFin: s.dateFin,
                    documentsValides: s.documentsValides
                });
            }

            const groupedList = Object.values(groupedMap).map(g => {
                g.stages.sort((a, b) => b.numeroStage - a.numeroStage);
                if (g.stages.length > 0) {
                    const latest = g.stages[0];
                    g.etat = latest.etat;
                    g.titreOffre = latest.titreOffre;
                    g.numeroStage = latest.numeroStage;
                    g.dateDebut = latest.dateDebut;
                    g.dateFin = latest.dateFin;
                    g.documentsValides = latest.documentsValides;
                }
                return g;
            });
            
            this.stagiaires.set(groupedList);
            this.attestations.set(atts);
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les données.' });
        } finally {
            this.loading.set(false);
        }
    }

    getAttestationForStagiaire(userId: string): Attestation | undefined {
        return this.attestations().find(a => a.utilisateurId === userId);
    }

    getSeverity(etat: string) {
        switch (etat) {
            case 'EN_COURS': return 'info';
            case 'VALIDE': return 'success';
            case 'NON_VALIDE':
            case 'REFUSE': return 'danger';
            case 'ANNULE': return 'danger';
            case 'ACCEPTE': return 'secondary';
            default: return 'warn';
        }
    }

    getStatusColor(etat: string) {
        switch (etat) {
            case 'EN_COURS': return 'bg-blue-500 text-white';
            case 'VALIDE': return 'bg-emerald-500 text-white';
            case 'REFUSE': return 'bg-red-500 text-white';
            case 'ANNULE': return 'bg-red-500 text-white';
            default: return 'bg-amber-500 text-white';
        }
    }

    getStatusIcon(etat: string) {
        switch (etat) {
            case 'EN_COURS': return 'pi pi-bolt';
            case 'VALIDE': return 'pi pi-check';
            case 'REFUSE': return 'pi pi-times';
            case 'ANNULE': return 'pi pi-ban';
            default: return 'pi pi-clock';
        }
    }

    getStatusGradient(etat: string) {
        switch (etat) {
            case 'EN_COURS': return 'from-blue-600 to-blue-400';
            case 'VALIDE': return 'from-emerald-600 to-emerald-400';
            case 'REFUSE': return 'from-red-600 to-red-400';
            case 'ANNULE': return 'from-red-700 to-red-500';
            default: return 'from-amber-600 to-amber-400';
        }
    }

    confirmCancellation(stage: any) {
        this.confirmationService.confirm({
            message: `Confirmez-vous l'annulation du stage ? Cette action est irréversible.`,
            header: 'Annulation du stage',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: "Confirmer",
            rejectLabel: 'Fermer',
            acceptButtonStyleClass: 'p-button-danger',
            accept: async () => {
                try {
                    await this.stageService.updateEtatStage(stage.stageId, EtatStage.ANNULE);
                    this.messageService.add({ severity: 'success', summary: 'Stage Annulé', detail: 'Le stage a été annulé avec succès.' });
                    await this.loadStagiaires();
                } catch (err) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'annulation du stage." });
                }
            }
        });
    }

    sendEmail(stagiaire: GroupedStagiaire) {
        const subject = encodeURIComponent(`Suivi de stage - ${stagiaire.titreOffre}`);
        const body = encodeURIComponent(`Bonjour ${stagiaire.firstName},\n\n`);
        window.location.href = `mailto:${stagiaire.email}?subject=${subject}&body=${body}`;
    }

    goToDocuments(stagiaire: GroupedStagiaire) {
        this.router.navigate(['/encadrant-documents'], { queryParams: { stagiaireId: stagiaire.id } });
    }
}
