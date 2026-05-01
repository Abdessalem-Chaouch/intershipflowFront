import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DocumentStageService, DocumentStage } from '@/app/services/document-stage.service';

@Component({
    selector: 'app-encadrant-documents',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule,
        TagModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule,
        InputNumberModule, DialogModule, ToggleSwitchModule, SelectModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="px-4 py-8 md:px-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm h-full min-h-[calc(88vh-6rem)] transition-colors duration-300">
            <div class="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div class="max-w-4xl">
                    <h1 class="text-4xl md:text-5xl font-black text-[#063970] dark:text-blue-400 tracking-tight leading-tight mb-2">
                        Dépôts des Stagiaires
                    </h1>
                    <p class="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Consultez les livrables, attribuez une note et validez officiellement les documents.
                    </p>
                </div>
            </div>

            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm mt-4">
                <p-table #dt [value]="mappedDocuments()" [rows]="10" [paginator]="true"
                    [globalFilterFields]="['nomStagiaire', 'type', 'alfrescoNodeId']"
                    [tableStyle]="{'min-width':'70rem'}" [rowHover]="true" dataKey="id"
                    [showCurrentPageReport]="true" [rowsPerPageOptions]="[10,20,30]"
                    styleClass="p-datatable-sm dark-table">
                    
                    <ng-template #caption>
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                            <h5 class="m-0 font-bold text-slate-800 dark:text-slate-100 text-lg hidden md:block">Liste des Livrables</h5>
                            <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <p-select [options]="typeOptions" [(ngModel)]="selectedTypeFilter" 
                                          optionLabel="label" optionValue="value" 
                                          [showClear]="true" placeholder="Tous les types" 
                                          (onChange)="dt.filter($event.value, 'type', 'equals')" 
                                          class="w-full sm:w-48" appendTo="body" />
                                <p-iconField iconPosition="left" class="w-full sm:w-auto">
                                    <p-inputIcon styleClass="pi pi-search" />
                                    <input pInputText type="text" (input)="onGlobalFilter(dt,$event)" placeholder="Chercher par nom ou ID..." class="w-full sm:w-72 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" />
                                </p-iconField>
                            </div>
                        </div>
                    </ng-template>

                    <ng-template #header>
                        <tr class="dark:bg-slate-800">
                            <th pSortableColumn="nomStagiaire" class="font-bold text-slate-700 dark:text-slate-300 dark:bg-slate-800 border-b dark:border-slate-700">Stagiaire <p-sortIcon field="nomStagiaire" /></th>
                            <th pSortableColumn="type" class="font-bold text-slate-700 dark:text-slate-300 dark:bg-slate-800 border-b dark:border-slate-700">Type <p-sortIcon field="type" /></th>
                            <th pSortableColumn="fileName" class="font-bold text-slate-700 dark:text-slate-300 dark:bg-slate-800 border-b dark:border-slate-700">Fichier <p-sortIcon field="fileName" /></th>
                            <th pSortableColumn="noteEncadrant" class="font-bold text-slate-700 dark:text-slate-300 dark:bg-slate-800 border-b dark:border-slate-700">Note <p-sortIcon field="noteEncadrant" /></th>
                            <th pSortableColumn="validationEncadrant" class="font-bold text-slate-700 dark:text-slate-300 dark:bg-slate-800 border-b dark:border-slate-700">Statut <p-sortIcon field="validationEncadrant" /></th>
                            <th style="min-width:12rem; text-align: center;" class="font-bold text-slate-700 dark:text-slate-300 dark:bg-slate-800 border-b dark:border-slate-700">Évaluation</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-doc>
                        <tr class="dark:bg-slate-800/50 hover:dark:bg-slate-700/30 transition-colors">
                            <td class="font-bold text-slate-800 dark:text-slate-200 border-b dark:border-slate-700">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                        <img *ngIf="doc.photoUrl" [src]="doc.photoUrl" class="w-full h-full object-cover" [alt]="doc.nomStagiaire" />
                                        <div *ngIf="!doc.photoUrl" class="w-full h-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-xs uppercase">
                                            {{ doc.nomStagiaire.charAt(0) }}
                                        </div>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-slate-800 dark:text-slate-100">{{ doc.nomStagiaire }}</span>
                                        <span *ngIf="doc.titreOffre" class="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{{ doc.titreOffre }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="border-b dark:border-slate-700">
                                <p-tag [value]="doc.type" 
                                    [severity]="doc.type === 'RAPPORT' ? 'info' : (doc.type === 'PRESENTATION' ? 'warn' : 'danger')" 
                                    styleClass="text-xs font-black uppercase px-2 py-1" />
                            </td>
                            <td class="font-mono text-sm text-[#063970] dark:text-blue-400 font-semibold border-b dark:border-slate-700">
                                <div class="flex items-center gap-2 overflow-hidden">
                                    <i class="pi text-xl shrink-0" [ngClass]="doc.type === 'PRESENTATION' ? 'pi-file text-orange-500' : (doc.type === 'RAPPORT' ? 'pi-file-word text-blue-500' : 'pi-file-pdf text-red-500')"></i>
                                    <span class="truncate max-w-[150px] cursor-pointer hover:text-[#063970] dark:hover:text-blue-300 transition-colors font-bold group-hover:underline decoration-blue-400" 
                                          [pTooltip]="'Télécharger: ' + (doc.fileName || 'ce document')" 
                                          (click)="download(doc)">
                                        {{ doc.fileName || 'Sans nom' }}
                                    </span>
                                </div>
                            </td>
                            <td class="border-b dark:border-slate-700">
                                <div class="flex items-center gap-2" *ngIf="doc.noteEncadrant != null; else noNote">
                                    <span class="font-black text-lg text-[#063970] dark:text-blue-400">{{ doc.noteEncadrant }}</span>
                                    <span class="text-xs text-slate-400 font-bold uppercase mt-1">/ 20</span>
                                </div>
                                <ng-template #noNote><span class="text-slate-400 dark:text-slate-500 text-sm italic font-medium">Non noté</span></ng-template>
                            </td>
                            <td class="border-b dark:border-slate-700">
                                <div class="flex items-center gap-2">
                                    <p-toggleswitch 
                                        [ngModel]="doc.validationEncadrant" 
                                        (onChange)="toggleValidation(doc)"
                                        [disabled]="doc.noteEncadrant != null && doc.noteEncadrant! < 10"
                                        [pTooltip]="(doc.noteEncadrant != null && doc.noteEncadrant! < 10) ? 'Note insuffisante (<10)' : ''" />
                                    <span class="text-xs font-black uppercase tracking-wider transition-colors" [ngClass]="doc.validationEncadrant ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'">
                                        {{ doc.validationEncadrant ? 'Validé' : (doc.noteEncadrant != null && doc.noteEncadrant! < 10 ? 'Refusé (Note < 10)' : 'A Valider') }}
                                    </span>
                                </div>
                            </td>
                            <td class="text-center border-b dark:border-slate-700">
                                <div class="flex items-center justify-center gap-2">
                                    <p-button icon="pi pi-clipboard" pTooltip="Évaluer / Noter" tooltipPosition="top" [rounded]="true" [text]="true" size="small" [style]="{'color':'#063970'}" class="dark:text-blue-400" (click)="openGradeDialog(doc)" />
                                    <p-button icon="pi pi-cloud-download" pTooltip="Télécharger" tooltipPosition="top" [rounded]="true" [text]="true" size="small" severity="secondary" class="dark:text-slate-400" (click)="download(doc)" [disabled]="!doc.alfrescoNodeId" />
                                </div>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="6" class="text-center py-16 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                                <i class="pi pi-inbox text-5xl mb-4 text-slate-300 dark:text-slate-600 block"></i>
                                Aucun document soumis par les stagiaires pour le moment.
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Dialog: Noter le document -->
        <p-dialog [(visible)]="displayGradeDialog" [style]="{'width':'450px'}" header="Évaluer le document" [modal]="true"
                  styleClass="modern-dialog">
            <ng-template #content>
                <div class="flex flex-col gap-6 py-4 dark:bg-slate-800 dark:text-slate-100">
                    <div class="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <i class="pi pi-star-fill text-xl"></i>
                        </div>
                        <div class="overflow-hidden">
                            <div class="font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{{ selectedDoc?.fileName || selectedDoc?.type }}</div>
                            <div class="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5">{{ selectedDoc?.type }}</div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Note (optionnel)</label>
                        <p-inputnumber [(ngModel)]="currentNote" [min]="0" [max]="20" [showButtons]="true" 
                                       buttonLayout="horizontal" inputId="horizontal" spinnerMode="horizontal" 
                                       [step]="0.25"
                                       decrementButtonClass="p-button-secondary dark:bg-slate-700" 
                                       incrementButtonClass="p-button-secondary dark:bg-slate-700" 
                                       incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" 
                                       styleClass="w-full" inputStyleClass="text-center font-black text-xl dark:bg-slate-900 dark:text-slate-100 border-none rounded-xl h-12 shadow-inner" />
                        <div *ngIf="currentNote !== null && currentNote < 10" class="text-[10px] text-red-500 font-bold italic ml-1 mt-1">
                            <i class="pi pi-info-circle text-[10px]"></i> Une note < 10 empêche la validation du document.
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Remarque / Feedback</label>
                        <textarea pInputTextarea [(ngModel)]="currentRemarque" rows="4" 
                                  placeholder="Écrivez vos observations ici..."
                                  class="w-full rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-4 text-sm focus:ring-2 focus:ring-blue-500/20"></textarea>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <div class="flex items-center justify-between w-full p-2">
                    <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="displayGradeDialog=false" severity="secondary" />
                    <p-button label="Enregistrer l'évaluation" icon="pi pi-check" 
                             styleClass="bg-[#063970] border-none rounded-xl px-6 py-3 font-bold shadow-lg" 
                             (click)="saveGrade()" />
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class EncadrantDocumentsComponent implements OnInit {
    private documentService = inject(DocumentStageService);
    private messageService = inject(MessageService);

    documents = inject(DocumentStageService).getDocuments();

    displayGradeDialog = false;
    selectedDoc: DocumentStage | null = null;
    currentNote: number | null = null;
    currentRemarque: string = '';

    typeOptions = [
        { label: 'RAPPORT', value: 'RAPPORT' },
        { label: 'CONVENTION', value: 'CONVENTION' },
        { label: 'PRESENTATION', value: 'PRESENTATION' }
    ];
    selectedTypeFilter: string | null = null;

    ngOnInit() {
        this.documentService.fetchDocumentsEncadrant();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    async toggleValidation(doc: DocumentStage) {
        try {
            if (doc.validationEncadrant) {
                await this.documentService.invaliderDocument(doc.id);
            } else {
                await this.documentService.validerDocument(doc.id);
            }
            this.messageService.add({ severity: 'success', summary: 'Validation', detail: 'Le statut du document a été mis à jour.' });
            this.documentService.fetchDocumentsEncadrant(); // Refresh list
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec lors de la modification de la validation." });
        }
    }

    openGradeDialog(doc: DocumentStage) {
        this.selectedDoc = doc;
        this.currentNote = doc.noteEncadrant ?? null;
        this.currentRemarque = doc.remarqueEncadrant || '';
        this.displayGradeDialog = true;
    }

    async saveGrade() {
        if (!this.selectedDoc) return;
        try {
            // If note is changed, update note
            if (this.currentNote !== null) {
                await this.documentService.updateNote(this.selectedDoc.id, this.currentNote);
            }
            
            // If remark is changed or added, update remark
            await this.documentService.addRemarque(this.selectedDoc.id, this.currentRemarque);
            
            this.messageService.add({ 
                severity: 'success', 
                summary: 'Évaluation enregistrée', 
                detail: 'La note et/ou la remarque ont été mises à jour.' 
            });
            this.displayGradeDialog = false;
            this.documentService.fetchDocumentsEncadrant(); // Refresh list
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'enregistrement." });
        }
    }

    download(doc: DocumentStage) {
        if (doc.alfrescoNodeId && doc.fileName) {
            this.documentService.downloadFile(doc.alfrescoNodeId, doc.fileName);
        }
    }

    mappedDocuments = computed(() => {
        const docs = this.documents() || [];
        return docs.map((d: DocumentStage) => ({
            ...d,
            nomStagiaire: `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.username || 'Stagiaire'
        }));
    });
}
