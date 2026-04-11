import { Component, OnInit, inject } from '@angular/core';
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

                            <div class="flex items-center gap-2" *ngIf="!doc.validationEncadrant">
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

                            <div *ngIf="doc.validationEncadrant" class="text-[11px] font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wider py-1">
                                Les modifications sont bloquées (Validé)
                            </div>
                        </div>
                    </div>

                    <!-- STATE 2: EMPTY (Dropzone) -->
                    <div *ngIf="!getDoc(type)" class="mt-auto flex-1 flex flex-col">
                        <div class="relative w-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 group/dropzone flex flex-col items-center flex-1 justify-center min-h-[140px] p-6 text-center cursor-pointer overflow-hidden">
                            
                            <input type="file" (change)="onUploadNewFile($event, type)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept=".pdf,.doc,.docx,.ppt,.pptx" />
                            
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
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    documents: any;

    ngOnInit() {
        this.documents = this.documentService.getDocuments();
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
            event.target.value = ''; // Reset input
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de l'envoi du fichier." });
        }
    }

    async onReplaceFile(event: any, doc: DocumentStage) {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];

        try {
            await this.documentService.updateDocument(doc.id, doc.type, doc.noteEncadrant ?? undefined, doc.validationEncadrant ?? undefined, file);
            this.messageService.add({ severity: 'success', summary: 'Fichier remplacé', detail: 'Le document a été mis à jour.' });
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
                } catch (err) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer ce document.' });
                }
            }
        });
    }
}
