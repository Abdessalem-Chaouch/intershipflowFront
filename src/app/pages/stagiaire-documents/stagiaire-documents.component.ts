import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DocumentStageService, DocumentStage, TypeDocument } from '@/app/services/document-stage.service';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { StageService, Stage, EtatStage } from '@/app/services/stage.service';

@Component({
    selector: 'app-stagiaire-documents',
    standalone: true,
    imports: [
        CommonModule, FileUploadModule, CardModule, ButtonModule,
        ToastModule, ConfirmDialogModule, TooltipModule, TagModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm h-full min-h-[calc(88vh-5rem)] transition-colors duration-300">
            <div class="mb-8 max-w-4xl">
                <h1 class="text-4xl md:text-5xl font-black text-[#063970] dark:text-blue-400 tracking-tight leading-tight mb-4">
                    Mes Documents de Stage
                </h1>
                <p class="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Déposez vos documents officiels (Convention, Rapport, Présentation) par simple glisser-déposer.
                    Vous pouvez modifier vos documents tant qu'ils n'ont pas été définitivement validés par votre encadrant.
                </p>
            </div>

            <!-- Warning Banner -->
            <div *ngIf="!isStageEnCours()" class="mb-8 p-6 rounded-3xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-800/30 flex items-center gap-5 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-700">
                <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-sm">
                    <i class="pi pi-lock text-2xl"></i>
                </div>
                <div>
                    <h4 class="text-amber-800 dark:text-amber-300 font-black m-0 text-lg uppercase tracking-tight">Dépôt verrouillé</h4>
                    <p class="text-amber-700/80 dark:text-amber-400/80 text-sm m-0 font-medium leading-relaxed">
                        Le dépôt de documents sera disponible dès que votre stage passera à l'état <span class="font-bold text-amber-600 dark:text-amber-400 uppercase">En Cours</span> ou <span class="font-bold text-amber-600 dark:text-amber-400 uppercase">En attente de validation</span>.
                        <span *ngIf="monStage()?.etat === 'ACCEPTE'" class="block mt-1">État actuel : <span class="font-bold">Accepté</span> (En attente de démarrage).</span>
                        <span *ngIf="!monStage()" class="block mt-1">Aucun stage actif n'a été détecté pour votre compte.</span>
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                <!-- CONVENTION CARD -->
                <ng-container *ngTemplateOutlet="documentCard; context: { $implicit: 'CONVENTION', title: 'Convention de Stage', icon: 'pi-file-pdf', desc: 'Signée par toutes les parties' }"></ng-container>

                <!-- RAPPORT CARD -->
                <ng-container *ngTemplateOutlet="documentCard; context: { $implicit: 'RAPPORT', title: 'Rapport de Fin d\\'Études', icon: 'pi-book', desc: 'Mémoire ou rapport final' }"> </ng-container>

                <!-- PRESENTATION CARD -->
                <ng-container *ngTemplateOutlet="documentCard; context: { $implicit: 'PRESENTATION', title: 'Présentation ', icon: 'pi-objects-column', desc: 'Support de soutenance (PPT, PDF)' }"> </ng-container>
            </div>
        </div>

        <ng-template #documentCard let-type let-title="title" let-icon="icon" let-desc="desc">
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-blue-900/10 transition-all duration-300 flex flex-col group relative h-full">
                <!-- Header -->
                <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 shrink-0 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center text-[#063970] dark:text-blue-400">
                            <i class="pi {{ icon }} text-xl"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800 dark:text-slate-100 m-0">{{ title }}</h3>
                        </div>
                    </div>
                    <!-- Status Badge -->
                    <div *ngIf="getDoc(type) as doc">
                        <p-tag *ngIf="doc.noteEncadrant != null && doc.noteEncadrant! < 10" 
                               value="Non validé" severity="danger" [rounded]="true" 
                               styleClass="text-[10px] font-black uppercase" />
                        
                        <p-tag *ngIf="doc.validationEncadrant" 
                               value="Validé" severity="success" [rounded]="true" 
                               styleClass="text-[10px] font-black uppercase" />
                               
                        <p-tag *ngIf="!doc.validationEncadrant && (doc.noteEncadrant == null || doc.noteEncadrant! >= 10)" 
                               value="Soumis" severity="info" [rounded]="true" 
                               styleClass="text-[10px] font-black uppercase" />
                    </div>
                </div>

                <!-- Body -->
                <div class="p-6 flex-1 flex flex-col">
                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ desc }}</p>

                    <!-- STATE 1: ALREADY UPLOADED -->
                    <div *ngIf="getDoc(type) as doc" class="mt-auto flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col">
                        <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 relative flex-1 flex flex-col justify-between">
                            <!-- Verification Icon -->
                            <div class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm" *ngIf="!doc.validationEncadrant">
                                <i class="pi pi-check text-xs font-bold"></i>
                            </div>
                            <div class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm" *ngIf="doc.validationEncadrant">
                                <i class="pi pi-verified text-xs font-bold"></i>
                            </div>

                            <div class="flex items-center gap-3 mb-4">
                                <i class="pi pi-file-pdf text-2xl text-red-500 shrink-0"></i>
                                <div class="flex-1 overflow-hidden">
                                    <div class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{{ doc.fileName || 'Document enregistré' }}</div>
                                    <div class="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate uppercase tracking-widest">{{ doc.type }}</div>
                                </div>
                            </div>
                            
                            <!-- Note Section -->
                            <div class="mb-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between" *ngIf="doc.noteEncadrant !== null">
                                <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Note :</span>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-xl font-black" [ngClass]="(doc.noteEncadrant != null && doc.noteEncadrant! < 10) ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'">{{ doc.noteEncadrant }}</span>
                                    <span class="text-xs font-bold text-slate-400 dark:text-slate-500">/20</span>
                                </div>
                            </div>

                            <!-- Remarque Section -->
                            <div class="mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50" *ngIf="doc.remarqueEncadrant">
                                <span class="text-[9px] font-black text-[#063970] dark:text-blue-400 uppercase tracking-widest block mb-1">Feedback de l'encadrant :</span>
                                <p class="text-[11px] text-slate-600 dark:text-slate-400 m-0 leading-tight italic font-medium italic">
                                    "{{ doc.remarqueEncadrant }}"
                                </p>
                            </div>


                            <div class="flex items-center gap-2" *ngIf="!doc.validationEncadrant && isStageEnCours()">
                                <!-- Bouton Remplacer (utilise fileUpload en mode invisible) -->
                                <div class="flex-1 overflow-hidden relative">
                                    <input type="file" (change)="onReplaceFile($event, doc)" class="absolute inset-0 opacity-0 cursor-pointer z-10 w-full" accept=".pdf,.docx,.ppt,.pptx" />
                                    <button class="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors flex items-center justify-center gap-2">
                                        <i class="pi pi-sync"></i> Remplacer
                                    </button>
                                </div>
                                <button (click)="deleteDoc(doc)" class="py-2 px-3 rounded-lg text-xs cursor-pointer font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30 flex items-center justify-center">
                                    <i class="pi pi-trash"></i>
                                </button>
                            </div>

                            <div *ngIf="doc.validationEncadrant" class="text-[11px] font-bold text-green-600 dark:text-green-400 text-center uppercase tracking-wider py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <i class="pi pi-verified mr-1"></i> Document Validé
                            </div>

                            <div *ngIf="!doc.validationEncadrant && !isStageEnCours()" class="text-[11px] font-bold text-amber-500 dark:text-amber-400 text-center uppercase tracking-wider py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <i class="pi pi-lock mr-1"></i> Dépôt verrouillé
                            </div>
                        </div>
                    </div>

                    <!-- STATE 2: EMPTY (Dropzone) -->
                    <div *ngIf="!getDoc(type)" class="mt-auto flex-1 flex flex-col">
                        <div [ngClass]="{'opacity-40 grayscale pointer-events-none select-none': !isStageEnCours()}"
                             class="relative w-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 group/dropzone flex flex-col items-center flex-1 justify-center min-h-[140px] p-6 text-center cursor-pointer overflow-hidden">
                            
                            <input type="file" *ngIf="isStageEnCours()" (change)="onUploadNewFile($event, type)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept=".pdf,.doc,.docx,.ppt,.pptx" />
                            
                            <div class="w-12 h-12 shrink-0 rounded-full bg-slate-50 dark:bg-slate-800 group-hover/dropzone:bg-white dark:group-hover/dropzone:bg-slate-700 group-hover/dropzone:shadow-sm flex items-center justify-center mb-3 transition-all duration-300 text-slate-400 dark:text-slate-500 group-hover/dropzone:text-blue-500 dark:group-hover/dropzone:text-blue-400 group-hover/dropzone:-translate-y-1">
                                <i class="pi pi-cloud-upload text-xl"></i>
                            </div>
                            <div class="text-sm font-bold text-slate-700 dark:text-slate-200 m-0 group-hover/dropzone:text-blue-700 dark:group-hover/dropzone:text-blue-400 transition-colors">Glissez votre fichier ici</div>
                            <div class="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">ou cliquez pour parcourir</div>
                        </div>
                    </div>
                </div>
            </div>
        </ng-template>

        <p-confirmDialog [style]="{width: '450px'}" 
                         acceptLabel="Oui" rejectLabel="Non" 
                         acceptButtonStyleClass="p-button-danger" 
                         rejectButtonStyleClass="p-button-text"></p-confirmDialog>
    `
})
export class StagiaireDocumentsComponent implements OnInit {
    private documentService = inject(DocumentStageService);
    private stageService = inject(StageService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    documents = signal<DocumentStage[]>([]);
    monStage = this.stageService.activeStage;
    isStageEnCours = computed(() => {
        const etat = this.monStage()?.etat;
        return etat === EtatStage.EN_COURS || etat === EtatStage.ATT_VALIDATION_ENCADRANT;
    });

    ngOnInit() {
        this.initializeData();
    }

    async initializeData() {
        await this.loadStage();
        await this.loadMesDocuments();
        await this.checkAndUpdateStageState();
    }

    async loadStage() {
        try {
            const stage = await this.stageService.getStageActif();
            this.monStage.set(stage);
        } catch (err) {
            console.error('Error loading active stage', err);
        }
    }

    async loadMesDocuments() {
        try {
            const docs = await this.documentService.getMesDocuments();
            this.documents.set(docs);
        } catch (err) {
            console.error('Error loading documents', err);
        }
    }

    async checkAndUpdateStageState() {
        const stage = this.monStage();
        if (!stage) {
            console.log('checkAndUpdateStageState: No active stage found');
            return;
        }

        const hasConvention = this.getDoc('CONVENTION') !== undefined;
        const hasRapport = this.getDoc('RAPPORT') !== undefined;
        const hasPresentation = this.getDoc('PRESENTATION') !== undefined;
        const requiredDocsUploaded = [hasConvention, hasRapport, hasPresentation].filter(Boolean).length;

        console.log('checkAndUpdateStageState: requiredDocsUploaded =', requiredDocsUploaded, 'stage.etat =', stage.etat);

        if (requiredDocsUploaded === 3 && stage.etat === EtatStage.EN_COURS) {
            try {
                console.log('checkAndUpdateStageState: Attempting to update stage state to ATT_VALIDATION_ENCADRANT');
                const updatedStage = await this.stageService.updateEtatStage(stage.id, EtatStage.ATT_VALIDATION_ENCADRANT);
                this.monStage.set(updatedStage);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Statut mis à jour',
                    detail: 'Votre stage est maintenant en attente de validation par l\'encadrant.'
                });
            } catch (err: any) {
                console.error('Error updating stage state to ATT_VALIDATION_ENCADRANT', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur de mise à jour',
                    detail: 'Impossible de changer l\'état du stage à ATT_VALIDATION_ENCADRANT: ' + (err.message || err)
                });
            }
        } else if (requiredDocsUploaded < 3 && stage.etat === EtatStage.ATT_VALIDATION_ENCADRANT) {
            try {
                console.log('checkAndUpdateStageState: Attempting to update stage state to EN_COURS');
                const updatedStage = await this.stageService.updateEtatStage(stage.id, EtatStage.EN_COURS);
                this.monStage.set(updatedStage);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Statut mis à jour',
                    detail: 'Votre stage est repassé en cours suite à la suppression d\'un document.'
                });
            } catch (err: any) {
                console.error('Error updating stage state to EN_COURS', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur de mise à jour',
                    detail: 'Impossible de changer l\'état du stage à EN_COURS: ' + (err.message || err)
                });
            }
        }
    }

    getDoc(type: TypeDocument): DocumentStage | undefined {
        return this.documents()?.find((d: DocumentStage) => d.type === type);
    }

    async onUploadNewFile(event: any, type: TypeDocument) {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];

        try {
            await this.documentService.createDocument(type, file);
            this.messageService.add({ severity: 'success', summary: 'Fichier ajouté', detail: 'Le document a été envoyé avec succès.' });
            await this.loadMesDocuments(); // Refresh local list
            await this.checkAndUpdateStageState(); // Check and update stage state
            event.target.value = ''; // Reset input
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de l'envoi du fichier." });
        }
    }

    async onReplaceFile(event: any, doc: DocumentStage) {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];

        try {
            await this.documentService.updateDocument(doc.id, doc.type, doc.noteEncadrant ?? undefined, doc.validationEncadrant ?? undefined, undefined, file);
            this.messageService.add({ severity: 'success', summary: 'Fichier remplacé', detail: 'Le document a été mis à jour.' });
            this.loadMesDocuments(); // Refresh local list
            event.target.value = ''; // Reset input
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la mise à jour.' });
        }
    }

    deleteDoc(doc: DocumentStage) {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer définitivement ce document ?',
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await this.documentService.deleteDocument(doc.id);
                    this.messageService.add({ severity: 'success', summary: 'Document supprimé', detail: 'Le document a été retiré.' });
                    await this.loadMesDocuments(); // Refresh local list
                    await this.checkAndUpdateStageState(); // Check and update stage state
                } catch (err) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer ce document.' });
                }
            }
        });
    }

    download(doc: DocumentStage) {
        if (doc.alfrescoNodeId && doc.fileName) {
            this.documentService.downloadFile(doc.alfrescoNodeId, doc.fileName);
        }
    }
}
