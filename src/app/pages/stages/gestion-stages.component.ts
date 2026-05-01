import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { StageService, Stage, EtatStage } from '@/app/services/stage.service';
import { DocumentStageService, DocumentStage } from '@/app/services/document-stage.service';
import { UserService, User } from '@/app/services/user.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AttestationService, Attestation } from '@/app/services/attestation.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
    selector: 'app-gestion-stages',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, TagModule, 
        TooltipModule, DialogModule, InputTextModule, DatePickerModule,
        ToastModule, ConfirmDialogModule, IconFieldModule, InputIconModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm h-full min-h-[calc(88vh-5rem)]">
            <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-4xl font-black text-[#063970] dark:text-blue-400 tracking-tight mb-2">Gestion des Stages</h1>
                    <p class="text-slate-500 dark:text-slate-400 font-medium text-lg">Suivez et gérez tous les stages en cours et terminés.</p>
                </div>
                <div class="flex gap-2">
                    <p-button label="Actualiser" icon="pi pi-refresh" [outlined]="true" [rounded]="true" (click)="loadStages()" />
                </div>
            </div>

            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                <p-table #dt [value]="mappedStages()" [rows]="10" [paginator]="true" responsiveLayout="scroll" styleClass="p-datatable-sm" [rowHover]="true"
                         [globalFilterFields]="['firstName', 'lastName', 'username', 'titreOffre', 'numeroStage']">
                    <ng-template pTemplate="caption">
                        <div class="flex justify-between items-center px-4 py-2">
                            <span class="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">Flux des Stages</span>
                            <p-iconField iconPosition="left">
                                <p-inputIcon styleClass="pi pi-search" />
                                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Rechercher un stagiaire..." class="w-72 rounded-2xl border-slate-200 dark:bg-slate-900" />
                            </p-iconField>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="header">
                        <tr class="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                            <th class="py-5 px-6 font-black text-[#063970] dark:text-blue-300 text-[11px] uppercase tracking-wider">Stagiaire</th>
                            <th class="py-5 px-6 font-black text-[#063970] dark:text-blue-300 text-[11px] uppercase tracking-wider">Offre de Stage</th>
                            <th class="py-5 px-6 font-black text-[#063970] dark:text-blue-300 text-[11px] uppercase tracking-wider">Période</th>
                            <th class="py-5 px-6 font-black text-[#063970] dark:text-blue-300 text-[11px] uppercase tracking-wider text-center">État Stage</th>
                            <th class="py-5 px-6 font-black text-[#063970] dark:text-blue-300 text-[11px] uppercase tracking-wider text-center">Statut Docs</th>
                            <th class="py-5 px-6 font-black text-[#063970] dark:text-blue-300 text-[11px] uppercase tracking-wider text-center">Consultation</th>
                            <th class="py-5 px-6 font-black text-[#063970] dark:text-blue-300 text-[11px] uppercase tracking-wider text-center">Attestation</th>
                            <th class="py-5 px-6 font-black text-[#063970] dark:text-blue-300 text-[11px] uppercase tracking-wider text-center">Décision</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-stage>
                        <tr class="hover:bg-slate-50/30 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-100 dark:border-slate-700">
                            <td class="py-4 px-6">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-[#063970]/10 text-[#063970] dark:text-blue-400 flex items-center justify-center font-black text-sm shadow-sm">
                                        {{ (stage.firstName || '?').charAt(0) }}{{ (stage.lastName || '?').charAt(0) }}
                                    </div>
                                    <div class="flex flex-col">
                                        <div class="font-bold text-slate-800 dark:text-slate-100 text-sm">
                                            <ng-container *ngIf="stage.firstName; else noName">
                                                {{ stage.firstName }} {{ stage.lastName }}
                                            </ng-container>
                                            <ng-template #noName>
                                                <span class="text-slate-400 italic">Nom non renseigné</span>
                                            </ng-template>
                                        </div>
                                        <div class="text-xs text-slate-400 font-medium">
                                            {{ stage.username || '' }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex flex-col">
                                    <span class="font-bold text-[#063970] dark:text-blue-300 text-sm leading-tight">{{ stage.titreOffre }}</span>
                                    <span class="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">N° {{ stage.numeroStage }}</span>
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center gap-3 group">
                                    <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" 
                                              styleClass="p-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" 
                                              (click)="openDateDialog(stage)" pTooltip="Modifier les dates" />
                                    <div class="flex flex-col">
                                        <div class="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                            <span>{{ stage.dateDebut | date:'dd MMM yyyy' }}</span>
                                            <i class="pi pi-arrow-right text-[8px] text-slate-300"></i>
                                            <span>{{ stage.dateFin | date:'dd MMM yyyy' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-6 text-center">
                                <p-tag [value]="stage.etat === 'ATT_VALIDATION_ENCADRANT' ? 'En attente' : stage.etat" 
                                       [severity]="getStageSeverity(stage.etat)" 
                                       styleClass="text-[9px] font-black uppercase px-3 py-1.5 rounded-xl shadow-sm" />
                            </td>
                            <td class="py-4 px-6 text-center">
                                <div *ngIf="stage.documentsValides" class="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-800/30">
                                    <i class="pi pi-check-circle text-[10px]"></i>
                                    <span class="text-[9px] font-black uppercase">Vérifiés</span>
                                </div>
                                <div *ngIf="!stage.documentsValides" class="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
                                    <i class="pi pi-clock text-[10px]"></i>
                                    <span class="text-[9px] font-black uppercase">En attente</span>
                                </div>
                            </td>
                            <td class="py-4 px-6 text-center">
                                <p-button icon="pi pi-folder-open" [rounded]="true" [text]="true" (click)="viewDocuments(stage)" 
                                          styleClass="hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[#063970] dark:text-blue-400" pTooltip="Détails documents" />
                            </td>
                            <td class="py-4 px-6 text-center">
                                <p-button *ngIf="getAttestation(stage.id)" 
                                          icon="pi pi-verified" 
                                          [rounded]="true" 
                                          [text]="true" 
                                          severity="success"
                                          (click)="downloadAttestation(stage)" 
                                          pTooltip="Télécharger l'attestation" />
                                <span *ngIf="!getAttestation(stage.id)" class="text-xs text-slate-300 italic">-</span>
                            </td>
                            <td class="py-4 px-6 text-center">
                                <div class="flex items-center justify-center gap-2">
                                    <ng-container *ngIf="stage.etat === 'ATT_VALIDATION_ENCADRANT'">
                                        <p-button icon="pi pi-check" label="Valider" [rounded]="true" severity="success" size="small"
                                                  styleClass="font-black px-4 py-2 text-[10px] uppercase shadow-md transition-all hover:scale-105"
                                                  (click)="confirmValidation(stage)" />
                                        
                                        <p-button icon="pi pi-times" label="Invalider" [rounded]="true" severity="danger" size="small" [outlined]="true"
                                                  styleClass="font-black px-4 py-2 text-[10px] uppercase border-2 transition-all hover:bg-red-50"
                                                  (click)="confirmInvalidation(stage)" />
                                    </ng-container>
                                    
                                    <span *ngIf="stage.etat === 'VALIDE'" class="flex items-center gap-2 text-[9px] text-green-600 dark:text-green-400 font-black uppercase bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-800/30">
                                        <i class="pi pi-verified"></i> Clôturé
                                    </span>

                                    <span *ngIf="stage.etat !== 'ATT_VALIDATION_ENCADRANT' && stage.etat !== 'VALIDE'" class="text-[10px] text-slate-400 font-bold italic">
                                        Aucune action
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="text-center py-20 text-slate-400">
                                <i class="pi pi-inbox text-5xl mb-4 block opacity-20"></i>
                                <p class="text-lg font-medium">Aucun stage trouvé dans la base.</p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Date Modification Dialog -->
        <p-dialog [visible]="showDateDialog()" (onHide)="showDateDialog.set(false)" header="Modifier les dates du stage" [modal]="true" [style]="{width: '400px'}">
            <div class="flex flex-col gap-4 py-4">
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Date de début</label>
                    <p-datepicker [(ngModel)]="newDateDebut" [showIcon]="true" appendTo="body" styleClass="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Date de fin</label>
                    <p-datepicker [(ngModel)]="newDateFin" [showIcon]="true" appendTo="body" styleClass="w-full" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Annuler" [text]="true" (click)="showDateDialog.set(false)" />
                <p-button label="Enregistrer" icon="pi pi-check" (click)="saveDates()" />
            </ng-template>
        </p-dialog>

        <!-- Documents View Dialog (Read-onlyish) -->
        <p-dialog [visible]="showDocsDialog()" (onHide)="showDocsDialog.set(false)" [header]="'Documents - ' + selectedStage?.utilisateurId" [modal]="true" [style]="{width: '700px'}" styleClass="modern-dialog">
            <div class="flex flex-col gap-4 py-4">
                <div *ngIf="loadingDocs()" class="flex justify-center py-10">
                    <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
                </div>
                
                <div *ngIf="!loadingDocs() && stageDocuments().length === 0" class="text-center py-10 text-slate-400">
                    <p>Aucun document déposé.</p>
                </div>
                <div *ngIf="!loadingDocs() && stageDocuments().length > 0" class="grid grid-cols-1 gap-3">
                    <div *ngFor="let doc of stageDocuments()" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <i class="pi pi-file-pdf text-2xl text-red-500"></i>
                            <div>
                                <h6 class="m-0 font-bold text-slate-800 dark:text-slate-100">{{ doc.fileName || doc.type }}</h6>
                                <p-tag [value]="doc.type" severity="info" styleClass="text-[8px] font-black" />
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <p-tag [value]="doc.validationEncadrant ? 'Validé' : 'Non Validé'" 
                                   [severity]="doc.validationEncadrant ? 'success' : 'warn'" />
                            <p-button icon="pi pi-download" [text]="true" (click)="downloadDoc(doc)" />
                        </div>
                    </div>
                </div>
            </div>
        </p-dialog>

        <p-confirmDialog />
        <p-toast />
    `
})
export class GestionStagesComponent implements OnInit {
    private stageService = inject(StageService);
    private documentService = inject(DocumentStageService);
    private userService = inject(UserService);
    private attestationService = inject(AttestationService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    stages = signal<Stage[]>([]);
    attestations = signal<Attestation[]>([]);
    selectedStage: Stage | null = null;
    stageDocuments = signal<DocumentStage[]>([]);
    
    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
    
    showDateDialog = signal<boolean>(false);
    showDocsDialog = signal<boolean>(false);
    loadingDocs = signal<boolean>(false);

    newDateDebut: Date | null = null;
    newDateFin: Date | null = null;

    mappedStages = computed(() => {
        return this.stages();
    });

    async ngOnInit() {
        await this.loadAttestations();
        await this.loadStages();
    }

    async loadAttestations() {
        try {
            const data = await this.attestationService.getAll();
            this.attestations.set(data);
        } catch (err) {
            console.error('Error loading attestations', err);
        }
    }

    async loadStages() {
        try {
            const user = this.userService.currentUser();
            let data: Stage[];
            
            if (user?.role === 'Encadrant') {
                data = await this.stageService.getStagesEncadrant();
            } else {
                data = await this.stageService.getAllStages();
            }
            
            this.stages.set(data);
        } catch (err) {
            console.error('Error loading stages', err);
        }
    }

    getAttestation(stageId: number) {
        return this.attestations().find(a => a.stageId === stageId);
    }

    downloadAttestation(stage: Stage) {
        const att = this.getAttestation(stage.id);
        if (att && att.filePath) {
            this.attestationService.downloadFile(att.filePath, `attestation_${stage.utilisateurId}.pdf`);
        }
    }

    getStageSeverity(etat: EtatStage) {
        switch (etat) {
            case EtatStage.EN_COURS: return 'info';
            case EtatStage.ATT_VALIDATION_ENCADRANT: return 'warn';
            case EtatStage.VALIDE: return 'success';
            case EtatStage.NON_VALIDE: return 'danger';
            case EtatStage.ACCEPTE: return 'secondary';
            default: return 'info';
        }
    }

    openDateDialog(stage: Stage) {
        this.selectedStage = stage;
        this.newDateDebut = stage.dateDebut ? new Date(stage.dateDebut) : null;
        this.newDateFin = stage.dateFin ? new Date(stage.dateFin) : null;
        this.showDateDialog.set(true);
    }

    async saveDates() {
        if (!this.selectedStage || !this.newDateDebut || !this.newDateFin) return;
        try {
            const debutStr = this.newDateDebut.toISOString().split('T')[0];
            const finStr = this.newDateFin.toISOString().split('T')[0];
            await this.stageService.modifierDates(this.selectedStage.id, debutStr, finStr);
            this.messageService.add({ severity: 'success', summary: 'Dates modifiées', detail: 'Les dates du stage ont été mises à jour.' });
            this.showDateDialog.set(false);
            this.loadStages();
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de modifier les dates.' });
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

    downloadDoc(doc: DocumentStage) {
        if (doc.alfrescoNodeId && doc.fileName) {
            this.documentService.downloadFile(doc.alfrescoNodeId, doc.fileName);
        }
    }

    confirmValidation(stage: Stage) {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir valider le stage de ${stage.utilisateurId} ? Cela générera l'attestation.`,
            header: 'Validation du stage',
            icon: 'pi pi-check-circle',
            accept: async () => {
                try {
                    await this.stageService.validerStage(stage.id);
                    this.messageService.add({ severity: 'success', summary: 'Stage Validé', detail: 'Le stage a été validé avec succès.' });
                    this.loadStages();
                } catch (err) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la validation.' });
                }
            }
        });
    }

    confirmInvalidation(stage: Stage) {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir invalider le stage de ${stage.utilisateurId} ? L'attestation sera supprimée.`,
            header: 'Invalidation du stage',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await this.stageService.invaliderStage(stage.id);
                    this.messageService.add({ severity: 'success', summary: 'Stage Invalidé', detail: 'Le stage est désormais non valide.' });
                    this.loadStages();
                } catch (err) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'invalidation." });
                }
            }
        });
    }
}
