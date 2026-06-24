import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
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
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DocumentStageService, DocumentStage } from '@/app/services/document-stage.service';
import { UserService } from '@/app/services/user.service';

interface InternshipGroup {
    idStage?: number;
    titreOffre: string;
    numeroStage?: number;
    documents: DocumentStage[];
}

interface TraineeGroup {
    userId: string;
    fullName: string;
    photoUrl?: string;
    internships: InternshipGroup[];
}

@Component({
    selector: 'app-encadrant-documents',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule,
        TagModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule,
        InputNumberModule, DialogModule, ToggleSwitchModule, SelectModule,
        TabsModule, BadgeModule, TextareaModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
            <!-- Header Section -->
            <div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="max-w-3xl">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
                        <i class="pi pi-folder-open text-[10px]"></i>
                        Gestion des Livrables
                    </div>
                    <h1 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
                        Espace <span class="text-blue-600 dark:text-blue-400">Encadrement</span>
                    </h1>
                    <p class="text-slate-500 dark:text-slate-400 text-lg font-medium">
                        Suivez la progression de vos stagiaires, évaluez leurs documents et validez leurs étapes clés.
                    </p>
                </div>
                
                <div class="flex flex-col sm:flex-row items-center gap-4">
                    <p-select [options]="typeOptions" [ngModel]="selectedType()" 
                              (ngModelChange)="selectedType.set($event)"
                              optionLabel="label" optionValue="value" 
                              placeholder="Type de document" 
                              class="w-full sm:w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm" />
                    
                    <p-iconField iconPosition="left" class="w-full sm:w-auto">
                        <p-inputIcon styleClass="pi pi-search" />
                        <input pInputText type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" placeholder="Rechercher un stagiaire..." 
                               class="w-full sm:w-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm px-5 py-3" />
                    </p-iconField>
                </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="groupedDocuments().length === 0" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                <div class="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <i class="pi pi-users text-4xl text-slate-300 dark:text-slate-600"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Aucun stagiaire trouvé</h3>
                <p class="text-slate-500 dark:text-slate-400">Vous n'avez pas encore de stagiaires affectés ou de documents soumis.</p>
            </div>

            <!-- Trainees List -->
            <div class="grid grid-cols-1 gap-8">
                <div *ngFor="let group of filteredGroups()" class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                    <!-- Trainee Header Card -->
                    <div class="p-6 md:p-8 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div class="flex items-center gap-5">
                                <div class="relative">
                                    <div class="w-20 h-20 rounded-[2rem] overflow-hidden shadow-inner border-2 border-white dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                        <img *ngIf="group.photoUrl" [src]="group.photoUrl" class="w-full h-full object-cover" [alt]="group.fullName" />
                                        <div *ngIf="!group.photoUrl" class="w-full h-full flex items-center justify-center text-3xl font-black text-blue-500 bg-blue-50 dark:bg-blue-900/30">
                                            {{ group.fullName.charAt(0) }}
                                        </div>
                                    </div>
                                    <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
                                </div>
                                <div>
                                    <h2 class="text-2xl font-black text-slate-900 dark:text-white leading-tight">{{ group.fullName }}</h2>
                                    <div class="flex flex-wrap items-center gap-3 mt-2">
                                        <span class="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                            {{ group.internships.length }} Stage(s)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex flex-col items-end gap-2">
                                <div class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Progression Globale</div>
                                <div class="flex items-center gap-3 w-48">
                                    <div class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div class="h-full bg-blue-500 transition-all duration-1000" [style.width.%]="getGlobalProgress(group)"></div>
                                    </div>
                                    <span class="text-sm font-black text-slate-700 dark:text-slate-300">{{ getGlobalProgress(group) }}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Internships Content -->
                    <div class="p-4 md:p-8">
                        <p-tabs [value]="activeTabs()[group.userId] ?? 0" (valueChange)="updateActiveTab(group.userId, $event)">
                            <p-tablist>
                                <p-tab *ngFor="let stage of group.internships; let i = index" [value]="i" class="mr-2">
                                    <div class="flex items-center gap-2 py-1">
                                        <i class="pi pi-briefcase text-sm"></i>
                                        <span class="font-bold text-sm">{{ stage.titreOffre }}</span>
                                        <p-badge [value]="stage.documents.length.toString()" severity="info" size="small" />
                                    </div>
                                </p-tab>
                            </p-tablist>
                            
                            <p-tabpanels>
                                <p-tabpanel *ngFor="let stage of group.internships; let i = index" [value]="i">
                                    <div class="py-6">
                                        <!-- Stage Info Bar -->
                                        <div class="mb-6 flex flex-wrap items-center justify-between gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
                                            <div class="flex items-center gap-4">
                                                <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                    <i class="pi pi-info-circle"></i>
                                                </div>
                                                <div>
                                                    <div class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Détails du stage</div>
                                                    <div class="font-bold text-slate-800 dark:text-slate-200">{{ stage.titreOffre }} (N° {{ stage.numeroStage }})</div>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-3">
                                                <div class="text-right">
                                                    <div class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Documents Validés</div>
                                                    <div class="font-bold text-slate-800 dark:text-slate-200 text-right">{{ getValidatedCount(stage) }} / {{ stage.documents.length }}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Documents Table -->
                                        <div class="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-3xl">
                                            <p-table [value]="stage.documents" styleClass="p-datatable-sm no-border-table">
                                                <ng-template #header>
                                                    <tr>
                                                        <th class="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">Type</th>
                                                        <th class="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">Fichier</th>
                                                        <th class="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">Note</th>
                                                        <th class="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">Statut</th>
                                                        <th class="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest py-4 text-center">Actions</th>
                                                    </tr>
                                                </ng-template>
                                                <ng-template #body let-doc>
                                                    <tr class="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-200">
                                                        <td class="py-4 border-b border-slate-50 dark:border-slate-800/50">
                                                            <p-tag [value]="doc.type" 
                                                                   [severity]="doc.type === 'RAPPORT' ? 'info' : (doc.type === 'PRESENTATION' ? 'warn' : 'danger')" 
                                                                   styleClass="text-[9px] font-black uppercase px-2 py-1 rounded-lg" />
                                                        </td>
                                                        <td class="py-4 border-b border-slate-50 dark:border-slate-800/50">
                                                            <div class="flex items-center gap-3">
                                                                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" [ngClass]="doc.type === 'PRESENTATION' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : (doc.type === 'RAPPORT' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400')">
                                                                    <i class="pi text-sm" [ngClass]="doc.type === 'PRESENTATION' ? 'pi-file' : (doc.type === 'RAPPORT' ? 'pi-file-word' : 'pi-file-pdf')"></i>
                                                                </div>
                                                                <span class="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px] cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" (click)="download(doc)">
                                                                    {{ doc.fileName || 'Sans nom' }}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td class="py-4 border-b border-slate-50 dark:border-slate-800/50">
                                                            <div class="flex flex-col gap-1" *ngIf="doc.noteEncadrant != null; else noNote">
                                                                <div class="flex items-center gap-2">
                                                                    <div class="w-12 h-12 rounded-full flex items-center justify-center border-2 border-blue-500/20 bg-blue-50 dark:bg-blue-900/20 shadow-inner">
                                                                        <span class="font-black text-blue-600 dark:text-blue-400">{{ doc.noteEncadrant }}</span>
                                                                    </div>
                                                                    <span class="text-[11px] text-slate-400 font-bold uppercase">/ 20</span>
                                                                </div>
                                                            </div>
                                                            <ng-template #noNote>
                                                                <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/50 w-fit">
                                                                    <div class="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                                                    <span class="text-[10px] text-slate-500 font-bold">Non noté</span>
                                                                </div>
                                                            </ng-template>
                                                        </td>
                                                        <td class="py-4 border-b border-slate-50 dark:border-slate-800/50">
                                                            <div class="flex items-center gap-2">
                                                                <p-toggleswitch 
                                                                    [ngModel]="doc.validationEncadrant" 
                                                                    (onChange)="toggleValidation(doc)"
                                                                    [disabled]="doc.noteEncadrant == null || doc.noteEncadrant < 10"
                                                                    [pTooltip]="doc.noteEncadrant == null ? 'Veuillez attribuer une note avant de valider' : (doc.noteEncadrant < 10 ? 'Note insuffisante (<10)' : '')"
                                                                    styleClass="scale-75" />
                                                                <span class="text-[10px] font-black uppercase tracking-tight" [ngClass]="doc.validationEncadrant ? 'text-green-500' : (doc.noteEncadrant != null && doc.noteEncadrant < 10 ? 'text-red-500' : 'text-slate-400')">
                                                                    {{ doc.validationEncadrant ? 'Validé' : (doc.noteEncadrant == null ? 'Note requise' : (doc.noteEncadrant < 10 ? 'Refusé' : 'En attente')) }}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td class="py-4 border-b border-slate-50 dark:border-slate-800/50 text-center">
                                                            <div class="flex items-center justify-center gap-1 transition-opacity">
                                                                <p-button icon="pi pi-pen-to-square" [rounded]="true" [text]="true" size="small" pTooltip="Évaluer / Noter" (click)="openGradeDialog(doc)" />
                                                                <p-button icon="pi pi-download" [rounded]="true" [text]="true" size="small" severity="secondary" pTooltip="Télécharger" (click)="download(doc)" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </ng-template>
                                                <ng-template #emptymessage>
                                                    <tr>
                                                        <td colspan="5" class="py-8 text-center text-slate-400 italic">
                                                            Aucun document de ce type pour ce stage.
                                                        </td>
                                                    </tr>
                                                </ng-template>
                                            </p-table>
                                        </div>
                                    </div>
                                </p-tabpanel>
                            </p-tabpanels>
                        </p-tabs>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dialog: Noter le document -->
        <p-dialog [(visible)]="displayGradeDialog" [style]="{'width':'500px'}" [modal]="true"
                  [showHeader]="false" styleClass="modern-dialog-clean p-0 overflow-hidden rounded-[2rem] shadow-xl border-none">
            <div class="relative overflow-hidden bg-white dark:bg-slate-900">
                <!-- Dialog Header: Clean & Soft -->
                <div class="p-8 pb-4">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <i class="pi pi-pencil"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-slate-800 dark:text-white leading-tight">Évaluer le document</h3>
                                <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{{ selectedDoc?.type }}</p>
                            </div>
                        </div>
                        <button (click)="displayGradeDialog=false" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                            <i class="pi pi-times text-xs"></i>
                        </button>
                    </div>

                    <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                            <i class="pi pi-file-pdf text-xl text-red-500"></i>
                        </div>
                        <div class="overflow-hidden">
                            <div class="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Nom du fichier</div>
                            <div class="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">{{ selectedDoc?.fileName || 'Livrable sans nom' }}</div>
                        </div>
                    </div>
                </div>

                <!-- Dialog Body -->
                <div class="px-8 py-6">
                    <div class="grid grid-cols-1 gap-8">
                        <!-- Score Input -->
                        <div class="flex flex-col items-center py-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50 dark:border-blue-900/10">
                            <label class="text-[10px] text-blue-500 dark:text-blue-400 font-black uppercase tracking-[0.2em] mb-4">Attribuer une note</label>
                            
                            <div class="flex items-center gap-4 relative">
                                <p-inputnumber [(ngModel)]="currentNote" [min]="0" [max]="20" [step]="0.25"
                                               [showButtons]="true" buttonLayout="horizontal" 
                                               inputStyleClass="w-24 text-center font-black text-4xl bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white" />
                                <div class="text-xl font-black text-slate-300 dark:text-slate-600">/20</div>
                            </div>
                        </div>
                        
                        <!-- Alert Message -->
                        <div *ngIf="currentNote !== null" class="transition-all duration-300">
                            <div *ngIf="currentNote < 10" class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/20 text-xs font-medium">
                                <i class="pi pi-exclamation-triangle text-lg"></i>
                                <span>Une note < 10 empêchera la validation du document.</span>
                            </div>
                            <div *ngIf="currentNote > 20" class="flex items-center gap-2 p-2 mt-2 text-red-500 text-[10px] font-bold uppercase">
                                <i class="pi pi-times-circle"></i>
                                <span>Maximum 20 points</span>
                            </div>
                        </div>

                        <!-- Feedback Section -->
                        <div class="flex flex-col gap-3">
                            <label class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1">Commentaires (Optionnel)</label>
                            <textarea pTextarea [(ngModel)]="currentRemarque" rows="4" 
                                      placeholder="Votre feedback pour le stagiaire..."
                                      class="w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all resize-none shadow-sm"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Dialog Footer -->
                <div class="p-8 pt-4 flex items-center justify-end gap-3">
                    <p-button label="Annuler" (click)="displayGradeDialog=false" [text]="true" severity="secondary" styleClass="font-bold text-slate-500" />
                    <p-button label="Enregistrer" (click)="saveGrade()" icon="pi pi-check" 
                             [disabled]="currentNote != null && currentNote > 20"
                             styleClass="bg-blue-600 border-none rounded-xl px-8 py-3 font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50" />
                </div>
            </div>
        </p-dialog>

        <p-toast />

        <style>
            :host ::ng-deep .p-tabs {
                background: transparent;
            }
            :host ::ng-deep .p-tablist-tab-list {
                background: transparent;
                border-bottom: 2px solid rgba(226, 232, 240, 0.5);
                gap: 1rem;
            }
            :host ::ng-deep .p-tab {
                border-bottom: 2px solid transparent !important;
                margin-bottom: -2px;
                padding: 1rem 0.5rem !important;
                color: #64748b;
                transition: all 0.3s ease;
            }
            :host ::ng-deep .p-tab-active {
                color: #2563eb !important;
                border-bottom-color: #2563eb !important;
                background: transparent !important;
            }
            :host ::ng-deep .p-tabpanel {
                padding: 0 !important;
                background: transparent !important;
            }
            :host ::ng-deep .no-border-table .p-datatable-thead > tr > th {
                border: none;
            }
            :host ::ng-deep .no-border-table .p-datatable-tbody > tr > td {
                border-bottom-color: rgba(226, 232, 240, 0.3);
            }
            .dark :host ::ng-deep .no-border-table .p-datatable-tbody > tr > td {
                border-bottom-color: rgba(30, 41, 59, 0.5);
            }
            :host ::ng-deep .p-toggleswitch-slider {
                background: #e2e8f0;
            }
            .dark :host ::ng-deep .p-toggleswitch-slider {
                background: #1e293b;
            }
            :host ::ng-deep .p-toggleswitch-checked .p-toggleswitch-slider {
                background: #22c55e;
            }
        </style>
    `
})
export class EncadrantDocumentsComponent implements OnInit {
    private documentService = inject(DocumentStageService);
    private userService = inject(UserService);
    private messageService = inject(MessageService);
    private route = inject(ActivatedRoute);

    documents = inject(DocumentStageService).getDocuments();
    stagiaireFilterId = signal<string | null>(null);
    searchQuery = signal<string>('');
    selectedType = signal<string | null>(null);
    activeTabs = signal<Record<string, number | undefined>>({});

    typeOptions = [
        { label: 'Tous les types', value: null },
        { label: 'Rapport', value: 'RAPPORT' },
        { label: 'Convention', value: 'CONVENTION' },
        { label: 'Présentation', value: 'PRESENTATION' }
    ];

    displayGradeDialog = false;
    selectedDoc: DocumentStage | null = null;
    currentNote: number | null = null;
    currentRemarque: string = '';

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['stagiaireId']) {
                this.stagiaireFilterId.set(params['stagiaireId']);
            }
        });
        this.loadData();
    }

    async loadData() {
        const user = this.userService.currentUser();
        if (user?.role === 'Admin' || user?.role === 'RH') {
            await this.documentService.fetchDocuments();
        } else {
            await this.documentService.fetchDocumentsEncadrant();
        }
    }

    onGlobalFilter(table: any, event: Event) {
        // Handled by signal filtering now
    }

    async toggleValidation(doc: DocumentStage) {
        try {
            if (doc.validationEncadrant) {
                await this.documentService.invaliderDocument(doc.id);
            } else {
                await this.documentService.validerDocument(doc.id);
            }
            this.messageService.add({ severity: 'success', summary: 'Validation', detail: 'Le statut du document a été mis à jour.' });
            await this.loadData(); // Refresh list
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
        
        // Final check for 20 limit
        if (this.currentNote !== null && this.currentNote > 20) {
            this.currentNote = 20;
        }

        try {
            const updates = [];

            // Only update if values actually changed
            if (this.currentNote !== null && this.currentNote !== this.selectedDoc.noteEncadrant) {
                updates.push(this.documentService.updateNote(this.selectedDoc.id, this.currentNote));
            }

            if (this.currentRemarque !== (this.selectedDoc.remarqueEncadrant || '')) {
                updates.push(this.documentService.addRemarque(this.selectedDoc.id, this.currentRemarque));
            }

            if (updates.length > 0) {
                await Promise.all(updates);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Évaluation enregistrée',
                    detail: 'Les modifications ont été prises en compte.'
                });
            }

            this.displayGradeDialog = false;
            await this.loadData();
        } catch (err) {
            console.error('Error saving grade:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "Échec de l'enregistrement. Veuillez réessayer."
            });
        }
    }

    updateActiveTab(userId: string, index: any) {
        if (index !== undefined && index !== null) {
            this.activeTabs.update(tabs => ({ ...tabs, [userId]: Number(index) }));
        }
    }

    download(doc: DocumentStage) {
        if (doc.alfrescoNodeId && doc.fileName) {
            this.documentService.downloadFile(doc.alfrescoNodeId, doc.fileName);
        }
    }

    groupedDocuments = computed(() => {
        const docs = this.documents() || [];
        const filterId = this.stagiaireFilterId();
        const typeFilter = this.selectedType();

        // Filter by trainee and type
        let filteredDocs = filterId ? docs.filter(d => d.userId === filterId) : docs;
        if (typeFilter) {
            filteredDocs = filteredDocs.filter(d => d.type === typeFilter);
        }

        const groups: Record<string, TraineeGroup> = {};

        filteredDocs.forEach(d => {
            const userId = d.userId || 'unknown';
            if (!groups[userId]) {
                groups[userId] = {
                    userId,
                    fullName: `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.username || 'Stagiaire',
                    photoUrl: d.photoUrl,
                    internships: []
                };
            }

            let internship = groups[userId].internships.find(i =>
                (i.idStage && i.idStage === d.idStage) ||
                (i.numeroStage && i.numeroStage === d.numeroStage) ||
                (i.titreOffre === d.titreOffre)
            );

            if (!internship) {
                internship = {
                    idStage: d.idStage,
                    titreOffre: d.titreOffre || 'Stage Sans Titre',
                    numeroStage: d.numeroStage,
                    documents: []
                };
                groups[userId].internships.push(internship);
            }

            internship.documents.push(d);
        });

        return Object.values(groups);
    });

    filteredGroups = computed(() => {
        const groups = this.groupedDocuments();
        const query = this.searchQuery().toLowerCase().trim();

        if (!query) return groups;

        return groups.filter(g =>
            g.fullName.toLowerCase().includes(query) ||
            g.userId.toLowerCase().includes(query) ||
            g.internships.some(i => i.titreOffre.toLowerCase().includes(query))
        ).map(g => {
            // If query matches internship title, we might want to filter internships?
            // For now, if trainee matches, show all their (type-filtered) internships.
            return g;
        });
    });

    getValidatedCount(stage: InternshipGroup): number {
        return stage.documents.filter(d => d.validationEncadrant).length;
    }

    getGlobalProgress(group: TraineeGroup): number {
        const total = group.internships.reduce((acc, i) => acc + i.documents.length, 0);
        if (total === 0) return 0;
        const validated = group.internships.reduce((acc, i) => acc + this.getValidatedCount(i), 0);
        return Math.round((validated / total) * 100);
    }
}
