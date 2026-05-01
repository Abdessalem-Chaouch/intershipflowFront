import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { StageService, Stage, EtatStage } from '@/app/services/stage.service';
import { DocumentStageService, DocumentStage } from '@/app/services/document-stage.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AttestationService, Attestation } from '@/app/services/attestation.service';

@Component({
    selector: 'app-mes-stages',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, TooltipModule, DialogModule, ToastModule],
    providers: [MessageService],
    template: `
        <div class="p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm h-full min-h-[calc(88vh-5rem)]">
            <div class="mb-8">
                <h1 class="text-4xl font-black text-[#063970] dark:text-blue-400 tracking-tight mb-2">Mes Stages</h1>
                <p class="text-slate-500 dark:text-slate-400 font-medium">Consultez l'historique de vos stages et gérez vos documents.</p>
            </div>

            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                <p-table [value]="stages()" [rows]="10" [paginator]="true" responsiveLayout="scroll" styleClass="p-datatable-sm">
                    <ng-template pTemplate="header">
                        <tr>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50">N° Stage</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50">Offre</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50">Période</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50">État</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50" style="text-align: center;">Attestation</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50" style="text-align: center;">Documents</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-stage>
                        <tr class="hover:bg-slate-50/30 dark:hover:bg-slate-700/30 transition-colors">
                            <td class="font-bold text-slate-700 dark:text-slate-300">#{{ stage.numeroStage }}</td>
                            <td>
                                <div class="flex flex-col">
                                    <span class="font-bold text-[#063970] dark:text-blue-400">{{ stage.titreOffre }}</span>
                                    <span class="text-xs text-slate-400">ID: {{ stage.offreStageId }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                                    <i class="pi pi-calendar"></i>
                                    <span>{{ stage.dateDebut | date:'dd MMM yyyy' }}</span>
                                    <i class="pi pi-arrow-right text-[10px]"></i>
                                    <span>{{ stage.dateFin | date:'dd MMM yyyy' }}</span>
                                </div>
                            </td>
                            <td>
                                <p-tag [value]="stage.etat" [severity]="getStageSeverity(stage.etat)" styleClass="text-[10px] font-black uppercase" />
                            </td>
                            <td style="text-align: center;">
                                <p-button *ngIf="getAttestation(stage.id)" 
                                          icon="pi pi-verified" 
                                          label="Attestation" 
                                          [rounded]="true" 
                                          severity="success" 
                                          size="small" 
                                          [text]="true"
                                          (click)="downloadAttestation(stage)" 
                                          pTooltip="Télécharger votre attestation" />
                                <span *ngIf="!getAttestation(stage.id)" class="text-[10px] text-slate-300 italic">En attente</span>
                            </td>
                            <td style="text-align: center;">
                                <p-button icon="pi pi-file" label="Voir Documents" [text]="true" [rounded]="true" size="small" (click)="viewDocuments(stage)" />
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="5" class="text-center py-10 text-slate-400 italic">Vous n'avez pas encore de stages enregistrés.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Documents Dialog -->
        <p-dialog [visible]="showDocsDialog()" (onHide)="showDocsDialog.set(false)" [header]="'Documents - ' + selectedStage?.titreOffre" [modal]="true" [style]="{width: '700px'}" styleClass="modern-dialog">
            <div class="flex flex-col gap-4 py-4">
                <div *ngIf="loadingDocs()" class="flex justify-center py-10">
                    <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
                </div>
                
                <div *ngIf="!loadingDocs() && stageDocuments().length === 0" class="text-center py-10 text-slate-400">
                    <i class="pi pi-folder-open text-5xl mb-3 opacity-20 block"></i>
                    <p>Aucun document déposé pour ce stage.</p>
                </div>
                
                <div *ngIf="!loadingDocs() && stageDocuments().length > 0" class="grid grid-cols-1 gap-3">
                    <div *ngFor="let doc of stageDocuments()" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:shadow-md transition-all">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-red-500 shadow-sm">
                                <i class="pi pi-file-pdf text-2xl"></i>
                            </div>
                            <div>
                                <h6 class="m-0 font-bold text-slate-800 dark:text-slate-100">{{ doc.fileName || doc.type }}</h6>
                                <div class="flex items-center gap-2 mt-1">
                                    <p-tag [value]="doc.type" severity="info" styleClass="text-[8px] font-black" />
                                    <span class="text-[10px] text-slate-400 font-bold uppercase" *ngIf="doc.noteEncadrant">Note: {{ doc.noteEncadrant }}/20</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <p-tag [value]="doc.validationEncadrant ? 'Validé' : 'En attente'" 
                                   [severity]="doc.validationEncadrant ? 'success' : 'warn'" 
                                   styleClass="text-[9px] font-black" />
                            <p-button icon="pi pi-download" [text]="true" [rounded]="true" (click)="downloadDoc(doc)" pTooltip="Télécharger" />
                        </div>
                    </div>
                </div>
            </div>
        </p-dialog>

        <p-toast />
    `
})
export class MesStagesComponent implements OnInit {
    private stageService = inject(StageService);
    private documentService = inject(DocumentStageService);
    private attestationService = inject(AttestationService);
    private messageService = inject(MessageService);

    stages = signal<Stage[]>([]);
    attestations = signal<Attestation[]>([]);
    selectedStage: Stage | null = null;
    stageDocuments = signal<DocumentStage[]>([]);
    showDocsDialog = signal<boolean>(false);
    loadingDocs = signal<boolean>(false);

    ngOnInit() {
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
            case EtatStage.ACCEPTE: return 'secondary';
            default: return 'info';
        }
    }
}
