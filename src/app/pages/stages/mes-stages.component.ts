import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { StageService, Stage, EtatStage } from '@/app/services/stage.service';
import { DocumentStageService, DocumentStage } from '@/app/services/document-stage.service';
import { UserService } from '@/app/services/user.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AttestationService, Attestation } from '@/app/services/attestation.service';

@Component({
    selector: 'app-mes-stages',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, TooltipModule, DialogModule, ToastModule, AvatarModule],
    providers: [MessageService],
    template: `
        <div class="animate-fadein p-4 lg:p-8">
            <!-- Header Section -->
            <div class="mb-8 px-4">
                <div class="flex items-center gap-3 mb-3">
                    <span class="bg-blue-50 dark:bg-blue-900/20 text-[#063970] dark:text-blue-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100 dark:border-blue-800/30">Espace Étudiant</span>
                </div>
                <h1 class="text-4xl lg:text-6xl font-black mb-2 tracking-tight text-[#063970] dark:text-white">Mes <span class="text-blue-500">Stages</span></h1>
                <p class="text-slate-600 dark:text-blue-100/60 text-lg max-w-2xl leading-relaxed font-semibold italic">
                    Retrouvez ici l'historique complet de vos expériences professionnelles et gérez vos documents.
                </p>
            </div>

            <!-- Content Card -->
            <div class="card border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-surface-900 p-0 overflow-hidden">
                <div class="p-8 border-b border-surface-100 dark:border-surface-800 flex justify-between items-center bg-surface-50/50 dark:bg-surface-900/50">
                    <div>
                        <h2 class="text-xl font-black text-surface-900 dark:text-surface-0 flex items-center gap-3">
                            <i class="pi pi-list text-primary text-xl"></i>
                            Historique des Stages
                        </h2>
                        <p class="text-muted-color text-xs font-bold uppercase tracking-widest mt-1">Liste de vos affectations passées et présentes</p>
                    </div>
                </div>

                <p-table [value]="stages()" [rows]="8" [paginator]="true" responsiveLayout="scroll" 
                         styleClass="p-datatable-modern custom-table" 
                         [showCurrentPageReport]="true"
                         currentPageReportTemplate="{first} - {last} sur {totalRecords}">
                    <ng-template pTemplate="header">
                        <tr>
                            <th class="px-8 py-5 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-muted-color">Réf.</th>
                            <th class="px-8 py-5 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-muted-color">Détails du Stage</th>
                            <th class="px-8 py-5 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-muted-color">Encadrant</th>
                            <th class="px-8 py-5 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-muted-color">Statut</th>
                            <th class="px-8 py-5 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-muted-color text-center">Attestation</th>
                            <th class="px-8 py-5 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-muted-color text-right">Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-stage>
                        <tr class="group hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all duration-300 border-b border-surface-50 dark:border-surface-800">
                            <td class="px-8 py-6">
                                <span class="px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-lg font-black text-xs text-surface-900 dark:text-surface-0 shadow-sm border border-surface-200 dark:border-surface-700">
                                    #{{ stage.numeroStage }}
                                </span>
                            </td>
                            <td class="px-8 py-6">
                                <div class="flex flex-col gap-1">
                                    <span class="font-black text-surface-900 dark:text-surface-0 text-sm tracking-tight group-hover:text-primary transition-colors">
                                        {{ stage.titreOffre }}
                                    </span>
                                    <div class="flex items-center gap-2 text-[10px] font-bold text-muted-color">
                                        <i class="pi pi-calendar-minus"></i>
                                        <span>{{ stage.dateDebut | date:'dd MMM yyyy' }}</span>
                                        <i class="pi pi-arrow-right scale-75 opacity-50"></i>
                                        <span>{{ stage.dateFin | date:'dd MMM yyyy' }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="px-8 py-6">
                                <div class="flex items-center gap-3">
                                    <p-avatar [label]="($any(stage).encadrantFirstName || stage.encadrantNom || 'E').charAt(0).toUpperCase()" 
                                              shape="circle" 
                                              styleClass="bg-blue-100 text-blue-600 font-bold ring-2 ring-white shadow-sm" />
                                    <div class="flex flex-col">
                                        <span class="text-xs font-black text-surface-900 dark:text-surface-0">
                                            {{ ($any(stage).encadrantFirstName || $any(stage).encadrantLastName) ? (($any(stage).encadrantFirstName || '') + ' ' + ($any(stage).encadrantLastName || '')).trim() : (stage.encadrantNom || getSupervisorName(stage.encadrantId, stage)) }}
                                        </span>
                                        <span class="text-[9px] font-bold text-blue-400 uppercase tracking-widest" *ngIf="stage.encadrantId || $any(stage).encadrantFirstName">Assigné</span>
                                        <span class="text-[9px] font-bold text-amber-500 uppercase tracking-widest" *ngIf="!stage.encadrantId && !$any(stage).encadrantFirstName">Non assigné</span>
                                    </div>
                                </div>
                            </td>
                            <td class="px-8 py-6">
                                <p-tag [value]="stage.etat" [severity]="getStageSeverity(stage.etat)" 
                                       styleClass="text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-sm" />
                            </td>
                            <td class="px-8 py-6 text-center">
                                <p-button *ngIf="getAttestation(stage.id)" 
                                          icon="pi pi-verified" 
                                          label="Attestation" 
                                          [rounded]="true" 
                                          severity="success" 
                                          size="small" 
                                          [text]="true"
                                          styleClass="font-black text-[10px] hover:bg-emerald-50"
                                          (click)="downloadAttestation(stage)" 
                                          pTooltip="Télécharger votre attestation" />
                                <span *ngIf="!getAttestation(stage.id)" class="text-[9px] font-bold text-muted-color/40 uppercase italic tracking-widest">En attente</span>
                            </td>
                            <td class="px-8 py-6 text-left">
                                <div class="flex justify-start">
                                    <button (click)="viewDocuments(stage)" 
                                            class="p-2 px-4 bg-primary/10 hover:bg-primary cursor-pointer text-primary hover:text-white rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                        <i class="pi pi-file"></i>
                                        Documents
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="text-center py-20">
                                <div class="flex flex-col items-center gap-4 opacity-30">
                                    <i class="pi pi-folder-open text-7xl"></i>
                                    <p class="text-xl font-black uppercase tracking-[0.3em]">Aucun stage trouvé</p>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Documents Dialog -->
        <p-dialog [visible]="showDocsDialog()" (onHide)="showDocsDialog.set(false)" 
                  [modal]="true" [style]="{width: '650px'}" 
                  styleClass="modern-dialog" [draggable]="false" [resizable]="false">
            <ng-template pTemplate="header">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary shadow-inner">
                        <i class="pi pi-folder-open text-xl"></i>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-lg font-black text-surface-900 dark:text-surface-0 leading-none mb-1">Portefeuille de Documents</span>
                        <span class="text-[10px] font-bold text-muted-color uppercase tracking-widest">{{ selectedStage?.titreOffre }}</span>
                    </div>
                </div>
            </ng-template>

            <div class="py-6 px-2">
                <div *ngIf="loadingDocs()" class="flex flex-col items-center justify-center py-20 gap-4">
                    <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
                    <span class="text-xs font-bold text-muted-color uppercase tracking-widest animate-pulse">Chargement sécurisé...</span>
                </div>
                
                <div *ngIf="!loadingDocs() && stageDocuments().length === 0" class="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                    <i class="pi pi-inbox text-7xl"></i>
                    <p class="text-lg font-black uppercase tracking-widest text-center">Aucun document déposé</p>
                </div>
                
                <div *ngIf="!loadingDocs() && stageDocuments().length > 0" class="grid grid-cols-1 gap-4">
                    <div *ngFor="let doc of stageDocuments()" 
                         class="p-5 bg-surface-50 dark:bg-surface-800 rounded-3xl border border-surface-100 dark:border-surface-700 flex items-center justify-between group hover:shadow-xl hover:translate-y-[-2px] hover:border-primary/30 transition-all duration-300">
                        <div class="flex items-center gap-5">
                            <div class="w-14 h-14 rounded-2xl bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-700 flex items-center justify-center text-red-500 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-file-pdf text-3xl"></i>
                            </div>
                            <div class="flex flex-col gap-1">
                                <h6 class="m-0 font-black text-surface-900 dark:text-surface-0 tracking-tight group-hover:text-primary transition-colors">{{ doc.fileName || doc.type }}</h6>
                                <div class="flex items-center gap-3">
                                    <p-tag [value]="doc.type" severity="info" styleClass="text-[8px] font-black uppercase px-2" />
                                    <div class="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full" *ngIf="doc.noteEncadrant">
                                        <i class="pi pi-star-fill scale-75"></i>
                                        <span>Note: {{ doc.noteEncadrant }}/20</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <p-tag [value]="doc.validationEncadrant ? 'Validé' : 'En attente'" 
                                   [severity]="doc.validationEncadrant ? 'success' : 'warn'" 
                                   styleClass="text-[9px] font-black uppercase shadow-sm" />
                            <button (click)="downloadDoc(doc)" 
                                    class="w-10 h-10 rounded-full bg-white dark:bg-surface-900 shadow-sm border border-surface-100 dark:border-surface-700 flex items-center justify-center text-surface-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                                <i class="pi pi-download"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </p-dialog>

        <p-toast />
    `,
    styles: [`
        :host ::ng-deep {
            .custom-table {
                .p-paginator {
                    background: transparent;
                    border: none;
                    padding: 2rem;
                    
                    .p-paginator-pages .p-paginator-page {
                        border-radius: 12px;
                        font-weight: 900;
                        font-size: 0.8rem;
                        min-width: 2.5rem;
                        height: 2.5rem;
                        
                        &.p-highlight {
                            background: var(--primary-color);
                            color: white;
                        }
                    }
                }
            }
        }
        
        .animate-fadein {
            animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `]
})
export class MesStagesComponent implements OnInit {
    private stageService = inject(StageService);
    private documentService = inject(DocumentStageService);
    private attestationService = inject(AttestationService);
    private userService = inject(UserService);
    private messageService = inject(MessageService);

    stages = signal<Stage[]>([]);
    attestations = signal<Attestation[]>([]);
    selectedStage: Stage | null = null;
    stageDocuments = signal<DocumentStage[]>([]);
    showDocsDialog = signal<boolean>(false);
    loadingDocs = signal<boolean>(false);

    allUsers = computed(() => this.userService.allUsers());

    ngOnInit() {
        this.userService.fetchAllUsers();
        this.loadStages();
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

    async loadStages() {
        try {
            const data = await this.stageService.getMesStages();
            this.stages.set(data);
        } catch (err) {
            console.error('Error loading stages', err);
        }
    }

    async viewDocuments(stage: Stage) {
        this.selectedStage = stage;
        this.showDocsDialog.set(true);
        this.loadingDocs.set(true);
        try {
            const docs = await this.documentService.getDocumentsByStage(stage.id);
            this.stageDocuments.set(docs);
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les documents.' });
        } finally {
            this.loadingDocs.set(false);
        }
    }

    getSupervisorName(id: string | undefined, stage?: any): string {
        if (stage?.encadrantFirstName || stage?.encadrantLastName) {
            return `${stage.encadrantFirstName ?? ''} ${stage.encadrantLastName ?? ''}`.trim();
        }
        if (!id) return 'N/A';
        const users = this.allUsers();
        const superv = users.find(u => 
            u.id?.toString().toLowerCase() === id.toString().toLowerCase() ||
            u.username?.toLowerCase() === id.toLowerCase()
        );
        if (superv) {
            const name = `${superv.firstName || ''} ${superv.lastName || ''}`.trim();
            return name || superv.username || 'N/A';
        }
        return 'N/A';
    }

    getAttestation(stageId: number) {
        return this.attestations().find(a => a.stageId === stageId);
    }

    downloadAttestation(stage: Stage) {
        const att = this.getAttestation(stage.id);
        if (att && att.filePath) {
            this.attestationService.downloadFile(att.filePath, `attestation_${stage.titreOffre}.pdf`);
        }
    }

    downloadDoc(doc: DocumentStage) {
        if (doc.alfrescoNodeId && doc.fileName) {
            this.documentService.downloadFile(doc.alfrescoNodeId, doc.fileName);
        }
    }

    getStageSeverity(etat: EtatStage) {
        switch (etat) {
            case EtatStage.EN_COURS: return 'info';
            case EtatStage.ATT_VALIDATION_ENCADRANT: return 'warn';
            case EtatStage.VALIDE: return 'success';
            case EtatStage.NON_VALIDE: return 'danger';
            case EtatStage.ANNULE: return 'danger';
            case EtatStage.ACCEPTE: return 'secondary';
            default: return 'info';
        }
    }
}
