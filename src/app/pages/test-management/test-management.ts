import { Component, OnInit, signal, ViewChild, Signal } from '@angular/core';
import { ConfirmationService, MessageService, FilterService } from 'primeng/api';
import { TestCandidatePreviewComponent } from './test-candidate-preview.component';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DividerModule } from 'primeng/divider';
import { TestService, TechnicalTest } from '@/app/services/test.service';
import { InternshipService, InternshipOffer } from '@/app/services/internship.service';
import { ExerciceService, Exercice } from '@/app/services/exercice.service';
import { QuestionService, Question } from '@/app/services/question.service';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { TestAttemptService, TestAttemptResponse } from '@/app/services/test-attempt.service';

interface QuestionPrep {
    tempId: string;
    mode: 'new' | 'existing';
    existingQuestionId?: string;
    enonce?: string;
    typeQuestion?: 'QCU' | 'QCM' | 'TRUE_FALSE' | 'QUESTION_REPONSE';
    propositions?: { text: string; isCorrect: boolean }[];
    selectedTrueFalse?: string;
    reponseLibre?: string;
}

interface ExercicePrep {
    tempId: string;
    mode: 'new' | 'existing';
    titre?: string;
    existingExerciceId?: string;
    questions: QuestionPrep[];
    expanded?: boolean;
    removedQuestionIds?: string[]; // Track detached questions
}

@Component({
    selector: 'app-test-management',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, RippleModule,
        IconFieldModule, InputIconModule, MultiSelectModule,
        ToastModule, ToolbarModule, InputTextModule, DialogModule, SelectModule,
        TextareaModule, InputNumberModule, ConfirmDialogModule,
        TagModule, CheckboxModule, RadioButtonModule, DividerModule, TooltipModule,
        TestCandidatePreviewComponent
    ],
    template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nouveau" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button label="Supprimer" icon="pi pi-trash" severity="secondary" [outlined]="true" (onClick)="deleteSelectedTests()" [disabled]="!selectedTests || !selectedTests.length" />
            </ng-template>
            <ng-template #end>
                <p-button label="Exporter" icon="pi pi-upload" severity="secondary" (onClick)="dt.exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table #dt [value]="tests()" [rows]="10" [paginator]="true"
            [globalFilterFields]="['titre','description','offerIds']"
            [tableStyle]="{'min-width':'75rem'}" [(selection)]="selectedTests"
            [rowHover]="true" dataKey="id"
            currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} tests"
            [showCurrentPageReport]="true" [rowsPerPageOptions]="[10,20,30]">
            <ng-template #caption>
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h5 class="m-0 text-2xl font-bold">Gestion des Tests Techniques</h5>
                    <div class="flex flex-col md:flex-row gap-2">
                        <p-multiSelect [options]="offers()" optionLabel="title" optionValue="id" [showClear]="true" placeholder="Filtrer par offre" (onChange)="onOfferFilter(dt,$event)" class="w-full md:w-64" display="chip" />
                        <p-iconField>
                            <p-inputIcon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt,$event)" placeholder="Rechercher..." />
                        </p-iconField>
                    </div>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width:3rem"><p-tableHeaderCheckbox /></th>
                    <th pSortableColumn="titre">Titre <p-sortIcon field="titre" /></th>
                    <th pSortableColumn="offerIds">Offres associées <p-sortIcon field="offerIds" /></th>
                    <th pSortableColumn="dureeMinutes">Durée (min) <p-sortIcon field="dureeMinutes" /></th>
                    <th style="min-width:8rem">Exercices</th>
                    <th style="min-width:10rem">Tentatives de test</th>
                    <th style="min-width:10rem">Actions</th>
                </tr>
            </ng-template>
            <ng-template #body let-test>
                <tr>
                    <td><p-tableCheckbox [value]="test" /></td>
                    <td class="font-semibold">{{ test.titre }}</td>
                    <td>
                        <div class="flex flex-wrap gap-1">
                            <p-tag *ngFor="let id of test.offerIds || []" [value]="getOneOfferName(id)" severity="secondary" styleClass="text-[10px] font-bold" />
                            <span *ngIf="!(test.offerIds?.length)" class="text-xs text-slate-300 italic">Aucune</span>
                        </div>
                    </td>
                    <td>{{ test.dureeMinutes }} min</td>
                    <td>
                        <div class="flex items-center gap-2">
                            
                            <p-button icon="pi pi-plus" pTooltip="Ajouter un exercice" tooltipPosition="top" [rounded]="true" [text]="true" size="small" [style]="{'color':'#C0C0C0'}" (click)="openQuickAddExercice(test)" />
                            <button 
                            pButton
                            type="button"
                            class="p-button p-button-outlined p-button-secondary flex items-center gap-2"
                            (click)="viewExercices(test)"
                            pTooltip="Consulter les exercices associés"
                            size="small"
                            tooltipPosition="top">

                            <i class="fa-regular fa-rectangle-list"></i>
                            <span>{{ test.exerciceCount || 0 }}</span>
                            <span>exercices</span>

                            </button>
                        </div>
                    </td>
                    <td>
                        <p-button icon="pi pi-users" label="Tentatives" pTooltip="Consulter les tentatives" tooltipPosition="top" size="small" [outlined]="true" severity="secondary" (click)="viewAttempts(test)" />
                    </td>
                    <td>
                        <div class="flex items-center gap-2">
                            <p-button  icon="pi pi-eye" pTooltip="Aperçu candidat" tooltipPosition="top" [text]="true" size="small" [style]="{'color':'#063970'}" (click)="openPreview(test)" />
                            <p-button  icon="pi pi-pencil" pTooltip="Modifier" tooltipPosition="top" [text]="true" size="small" (click)="editTest(test)" />
                            <p-button icon="pi pi-trash" pTooltip="Supprimer" tooltipPosition="top" [rounded]="true" [text]="true" size="small" severity="danger" (click)="deleteTest(test)" />
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>



        <!-- ══════════════════════════════════════════ -->
        <!-- WIZARD: Nouveau Test (2 étapes)           -->
        <!-- ══════════════════════════════════════════ -->
        <p-dialog [(visible)]="testWizardDialog"
            [style]="{'width':'860px','max-width':'95vw'}"
            [header]="test.id ? 'Modifier le test' : 'Créer un nouveau test'"
            [modal]="true" [draggable]="false" class="p-fluid">
            <ng-template #content>
                <!-- Step indicator -->
                <div class="flex items-center justify-center mb-6 pt-1">
                    <div class="flex items-center gap-2">
                        <div class="flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm"
                            [style]="wizardStep===1?'background:#063970;color:white':wizardStep>1?'background:#22c55e;color:white':'background:#e5e7eb;color:#9ca3af'">
                            <i *ngIf="wizardStep>1" class="pi pi-check text-xs"></i>
                            <span *ngIf="wizardStep<=1">1</span>
                        </div>
                        <span class="font-semibold text-sm" [class.text-blue-900]="wizardStep===1" [class.text-green-600]="wizardStep>1" [class.text-gray-400]="wizardStep<1">Informations du test</span>
                    </div>
                    <div class="h-px w-16 mx-4" [style]="wizardStep>1?'background:#22c55e':'background:#e5e7eb'"></div>
                    <div class="flex items-center gap-2">
                        <div class="flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm"
                            [style]="wizardStep===2?'background:#063970;color:white':'background:#e5e7eb;color:#9ca3af'">2</div>
                        <span class="font-semibold text-sm" [class.text-blue-900]="wizardStep===2" [class.text-gray-400]="wizardStep!==2">Exercices &amp; Questions</span>
                    </div>
                </div>

                <!-- ÉTAPE 1 -->
                <div *ngIf="wizardStep===1" class="flex flex-col gap-4">
                    <div>
                        <label class="block font-bold mb-2">Titre du test</label>
                        <input type="text" pInputText [(ngModel)]="test.titre" autofocus placeholder="Ex : Test Angular Fondamentaux" class="w-full" />
                        <small class="text-red-500" *ngIf="submitted&&!test.titre">Le titre est requis.</small>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Description</label>
                        <textarea pTextarea [(ngModel)]="test.description" rows="3" placeholder="Description du contenu du test" class="w-full"></textarea>
                        <small class="text-red-500" *ngIf="submitted&&!test.description">La description est requise.</small>
                    </div>
                    <div class="flex gap-4">
                        <div class="flex-1">
                            <label class="block font-bold mb-2">Durée (minutes)</label>
                            <p-inputnumber [(ngModel)]="test.dureeMinutes" [min]="5" [max]="240" [showButtons]="true" placeholder="60" class="w-full" />
                        </div>
                        <div class="flex-1">
                            <label class="block font-bold mb-2">Offres de stage</label>
                            <p-multiselect [(ngModel)]="test.offerIds" [options]="offers()" optionLabel="title" optionValue="id" placeholder="Choisir une ou plusieurs offres" appendTo="body" display="chip" class="w-full" />
                            <small class="text-blue-500 italic mt-1 block" *ngIf="!(test.offerIds?.length)">Sélectionnez les offres auxquelles ce test sera rattaché.</small>
                        </div>
                    </div>
                </div>

                <!-- ÉTAPE 2 -->
                <div *ngIf="wizardStep===2" class="flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <h6 class="m-0 font-bold text-gray-800">
                            <i class="pi pi-list-check mr-2" style="color:#063970"></i>
                            Exercices du test
                            <span class="ml-2 text-sm font-normal text-gray-500">({{ exercicesPrep.length }})</span>
                        </h6>
                        <p-button label="Ajouter un exercice" icon="pi pi-plus" size="small"
                            [style]="{'background-color':'#063970','border-color':'#063970'}"
                            (click)="openAddExerciceDialog()" />
                    </div>

                    <!-- Empty state -->
                    <div *ngIf="exercicesPrep.length===0"
                        class="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400">
                        <i class="pi pi-inbox text-4xl mb-3"></i>
                        <p class="text-sm font-medium m-0">Aucun exercice ajouté pour l'instant.</p>
                        <p class="text-xs m-0 mt-1">Cliquez sur "Ajouter un exercice" pour commencer.</p>
                    </div>

                    <!-- List -->
                    <div *ngFor="let ex of exercicesPrep; let exIdx=index"
                        class="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <!-- Header row -->
                        <div class="flex items-center gap-3 p-4 cursor-pointer select-none"
                            style="background:linear-gradient(to right,#f8faff,#fff)"
                            (click)="ex.expanded=!ex.expanded">
                            <div class="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold shrink-0"
                                style="background:#063970">{{ exIdx+1 }}</div>
                            <div class="flex-1 min-w-0">
                                <div class="font-semibold text-gray-800 truncate">{{ getExLabel(ex) }}</div>
                                <div class="text-xs text-gray-500 mt-0.5">
                                    {{ ex.questions.length }} question(s)
                                </div>
                            </div>
                            <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small"
                                pTooltip="Modifier" tooltipPosition="left"
                                (click)="$event.stopPropagation(); openEditExerciceDialog(exIdx)" />
                            <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" size="small"
                                pTooltip="Supprimer" tooltipPosition="left"
                                (click)="$event.stopPropagation(); removeExercice(exIdx)" />
                            <i [class]="ex.expanded?'pi pi-chevron-down text-gray-400':'pi pi-chevron-right text-gray-400'"></i>
                        </div>

                        <!-- Questions panel -->
                        <div *ngIf="ex.expanded" class="border-t border-gray-100 p-4 bg-gray-50">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-sm font-semibold text-gray-700">
                                    <i class="pi pi-question-circle mr-1 text-BLUE-500"></i>Questions
                                </span>
                                <p-button label="Ajouter une question" icon="pi pi-plus" [text]="true" size="small"
                                    [style]="{'color':'#063970'}" (click)="openAddQuestionDialog(exIdx)" />
                            </div>
                            <div *ngIf="ex.questions.length===0"
                                class="text-center py-3 text-gray-400 text-sm italic">
                                Aucune question. Cliquez sur "Ajouter une question".
                            </div>
                            <div *ngFor="let q of ex.questions; let qIdx=index"
                                class="flex items-start gap-3 p-3 mb-2 bg-white rounded-lg border border-gray-100">
                                <span class="text-xs font-mono text-gray-400 mt-1 w-4">{{ qIdx+1 }}.</span>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap mb-1">
                                        <p-tag [value]="getQType(q)" severity="secondary" />
                                    </div>
                                    <div class="text-sm text-gray-800 font-medium">{{ getQLabel(q) }}</div>
                                    <!-- Propositions -->
                                    <div *ngIf="getQPropositions(q).length > 0" class="mt-1 text-xs text-gray-500 italic">
                                        <span *ngFor="let p of getQPropositions(q); let last = last">
                                            {{ p }}<span *ngIf="!last"> · </span>
                                        </span>
                                    </div>
                                    <!-- Réponse Correcte -->
                                    <div *ngIf="getQCorrectAnswer(q)" class="flex items-start gap-1 mt-1">
                                        <i class="pi pi-check-circle text-green-600 text-[10px] mt-1 shrink-0"></i>
                                        <span class="text-xs text-green-700 font-semibold">{{ getQCorrectAnswer(q) }}</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-1">
                                    <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small"
                                        (click)="openEditQuestionDialog(exIdx, qIdx)" />
                                    <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" size="small"
                                        (click)="removeQuestion(exIdx, qIdx)" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="hideWizardDialog()" />
                <p-button *ngIf="wizardStep===2" label="Précédent" icon="pi pi-arrow-left"
                    severity="secondary" (click)="wizardStep=1" />
                <!-- Étape 1 : enregistrer vide OU passer à l'étape 2 -->
                <p-button *ngIf="wizardStep===1" label="Enregistrer" icon="pi pi-check" severity="secondary"
                    pTooltip="Créer le test sans exercice" tooltipPosition="top"
                    (click)="saveWizard()" />
                <p-button *ngIf="wizardStep===1" label="Suivant : Exercices" icon="pi pi-arrow-right" iconPos="right"
                    [style]="{'background-color':'#063970','border-color':'#063970'}"
                    (click)="nextStep()" />
                <!-- Étape 2 : enregistrer tout -->
                <p-button *ngIf="wizardStep===2" label="Enregistrer" icon="pi pi-check"
                    [style]="{'background-color':'#063970','border-color':'#063970'}"
                    (click)="saveWizard()" />
            </ng-template>
        </p-dialog>

        <!-- ══════════════════════════════════════════ -->
        <!-- SUB-DIALOG: Ajouter un Exercice          -->
        <!-- ══════════════════════════════════════════ -->
        <p-dialog [(visible)]="addExerciceDialog" [style]="{'width':'540px'}"
            [header]="isEditingEx ? 'Modifier l’exercice' : 'Ajouter un exercice'" [modal]="true" class="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-5 pt-2">
                    <div *ngIf="!isEditingEx">
                        <label class="block font-bold mb-3">Mode d'ajout</label>
                        <div class="flex gap-3">
                            <div class="flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all"
                                [style]="exMode==='new'?'border-color:#063970;background:#f0f7ff':'border-color:#e5e7eb'"
                                (click)="exMode='new'">
                                <div class="flex items-center gap-3">
                                    <p-radiobutton name="exMode" value="new" [(ngModel)]="exMode" />
                                    <div>
                                        <div class="font-semibold text-gray-800">Nouvel exercice</div>
                                        <div class="text-xs text-gray-500">Créer un exercice inédit</div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all"
                                [style]="exMode==='existing'?'border-color:#063970;background:#f0f7ff':'border-color:#e5e7eb'"
                                (click)="exMode='existing'">
                                <div class="flex items-center gap-3">
                                    <p-radiobutton name="exMode" value="existing" [(ngModel)]="exMode" />
                                    <div>
                                        <div class="font-semibold text-gray-800">Exercice existant</div>
                                        <div class="text-xs text-gray-500">Réutiliser un exercice</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div *ngIf="exMode==='new' || isEditingEx">
                        <label class="block font-bold mb-2">{{ isEditingEx ? "Nom de l'exercice" : "Titre de l'exercice" }}</label>
                        <input type="text" pInputText [(ngModel)]="exTitre" placeholder="Ex : Composants Angular" [fluid]="true" />
                        <small class="text-red-500" *ngIf="submittedEx&&!exTitre.trim()">Le titre est requis.</small>
                    </div>
                    <div *ngIf="exMode==='existing' && !isEditingEx">
                        <label class="block font-bold mb-2">Choisir un exercice existant</label>
                        <p-select [(ngModel)]="exExistingId" [options]="getAvailableExercices()" optionLabel="titre" optionValue="id"
                            placeholder="Sélectionner un exercice" [fluid]="true" appendTo="body" [filter]="true" filterBy="titre" />
                        <small class="text-red-500" *ngIf="submittedEx&&!exExistingId">Veuillez sélectionner un exercice.</small>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="addExerciceDialog=false" />
                <p-button [label]="isEditingEx ? 'Modifier l’exercice' : 'Ajouter à ce test'" icon="pi pi-check"
                    [style]="{'background-color':'#063970','border-color':'#063970'}"
                    (click)="confirmAddExercice()" />
            </ng-template>
        </p-dialog>

        <!-- ══════════════════════════════════════════ -->
        <!-- SUB-DIALOG: Ajouter une Question         -->
        <!-- ══════════════════════════════════════════ -->
        <p-dialog [(visible)]="addQuestionDialog" [style]="{'width':'640px'}"
            [header]="isEditingQ ? 'Modifier la question' : 'Ajouter une question'" [modal]="true" class="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-5 pt-2">
                    <div *ngIf="!isEditingQ">
                        <label class="block font-bold mb-3">Mode d'ajout</label>
                        <div class="flex gap-3">
                            <div class="flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all"
                                [style]="qMode==='new'?'border-color:#063970;background:#f0f7ff':'border-color:#e5e7eb'"
                                (click)="qMode='new'">
                                <div class="flex items-center gap-3">
                                    <p-radiobutton name="qMode" value="new" [(ngModel)]="qMode" />
                                    <div>
                                        <div class="font-semibold text-gray-800">Nouvelle question</div>
                                        <div class="text-xs text-gray-500">Créer une question inédite</div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all"
                                [style]="qMode==='existing'?'border-color:#063970;background:#f0f7ff':'border-color:#e5e7eb'"
                                (click)="qMode='existing'">
                                <div class="flex items-center gap-3">
                                    <p-radiobutton name="qMode" value="existing" [(ngModel)]="qMode" />
                                    <div>
                                        <div class="font-semibold text-gray-800">Question existante</div>
                                        <div class="text-xs text-gray-500">Réutiliser une question</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Formulaire (Nouveau ou Modification) -->
                    <div *ngIf="qMode==='new' || isEditingQ" class="flex flex-col gap-4">
                        <div>
                            <label class="block font-bold mb-2">Énoncé</label>
                            <input type="text" pInputText [(ngModel)]="qEnonce" placeholder="Poser la question..." [fluid]="true" />
                            <small class="text-red-500" *ngIf="submittedQ&&!qEnonce.trim()">L'énoncé est requis.</small>
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Type de question</label>
                            <p-select [(ngModel)]="qType" [options]="typeQuestions" optionLabel="label" optionValue="value"
                                placeholder="Choisir le type" [fluid]="true" appendTo="body" />
                            <small class="text-red-500" *ngIf="submittedQ&&!qType">Le type est requis.</small>
                        </div>
                        <!-- QCU / QCM -->
                        <div *ngIf="qType==='QCM'||qType==='QCU'">
                            <div class="flex justify-between items-center mb-2">
                                <label class="font-bold m-0">Propositions</label>
                                <p-button icon="pi pi-plus" label="Ajouter" [text]="true" size="small" (click)="addProp()" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <div *ngFor="let p of props; let i=index; trackBy:trackIdx" class="flex items-center gap-2">
                                    <p-radiobutton *ngIf="qType==='QCU'" [name]="'r'+i" [value]="true" [(ngModel)]="p.isCorrect" (onClick)="onRadio(i)" />
                                    <p-checkbox *ngIf="qType==='QCM'" [binary]="true" [(ngModel)]="p.isCorrect" />
                                    <input type="text" pInputText [(ngModel)]="p.text" placeholder="Option {{i+1}}" class="w-full" />
                                    <p-button icon="pi pi-trash" severity="danger" [text]="true" (click)="removeProp(i)" [disabled]="props.length<=2" />
                                </div>
                            </div>
                            <small class="text-gray-500">Cochez la ou les bonnes réponses.</small>
                        </div>
                        <!-- TRUE_FALSE -->
                        <div *ngIf="qType==='TRUE_FALSE'">
                            <label class="block font-bold mb-2">Réponse correcte</label>
                            <p-select [options]="trueFalseOpts" [(ngModel)]="qTrueFalse" optionLabel="label" optionValue="value"
                                placeholder="Choisir" appendTo="body" class="w-full" />
                        </div>
                        <!-- QUESTION_REPONSE -->
                        <div *ngIf="qType==='QUESTION_REPONSE'">
                            <label class="block font-bold mb-2">Réponse correcte attendue</label>
                            <textarea pTextarea [(ngModel)]="qReponseLibre" rows="3" placeholder="Tapez la réponse attendue..." class="w-full"></textarea>
                        </div>
                    </div>

                    <!-- Question existante (uniquement en mode ajout) -->
                    <div *ngIf="qMode==='existing' && !isEditingQ" class="w-full">
                        <label class="block font-bold text-slate-800 mb-2">Choisir une question existante</label>
                        <p-select [(ngModel)]="qExistingId" [options]="getAvailableQuestions()" optionLabel="enonce" optionValue="id"
                            placeholder="Sélectionner une question" class="w-full" appendTo="body" [filter]="true" filterBy="enonce">
                            <ng-template #item let-q>
                                <div class="flex items-center gap-2">
                                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">{{ q.typeQuestion }}</span>
                                    <span class="text-sm truncate">{{ q.enonce }}</span>
                                </div>
                            </ng-template>
                        </p-select>
                        <small class="text-red-500 font-bold mt-1 block" *ngIf="submittedQ&&!qExistingId">Veuillez sélectionner une question.</small>
                        
                        <!-- Premium Preview Area -->
                        <div *ngIf="qExistingId" class="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Aperçu de la question</div>
                            
                            <div class="flex items-start gap-2 mb-3">
                                <p-tag [value]="getQuestionById(qExistingId)?.typeQuestion||''" severity="info" styleClass="text-[9px] font-black px-2 py-0.5" />
                                <div class="text-sm font-bold text-slate-800">{{ getQuestionById(qExistingId)?.enonce }}</div>
                            </div>
                            
                            <!-- Propositions Preview -->
                            <div *ngIf="getQuestionById(qExistingId)?.propositions?.length" class="flex flex-col gap-2 mb-3 ml-1">
                                <div *ngFor="let p of getQuestionById(qExistingId)?.propositions" class="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                                    <i class="pi pi-circle text-[8px] text-slate-300"></i>
                                    <span class="text-xs text-slate-600 font-medium">{{ p }}</span>
                                </div>
                            </div>

                            <!-- Reponse Preview -->
                            <div *ngIf="getQuestionById(qExistingId)?.reponsesCorrectes?.length" class="flex items-center gap-2 text-green-600 ml-1">
                                <i class="pi pi-check-circle text-xs font-bold"></i>
                                <span class="text-xs font-black uppercase tracking-wider">Réponse :</span>
                                <span class="text-xs font-bold">{{ (getQuestionById(qExistingId)?.reponsesCorrectes || []).join(' · ') }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="addQuestionDialog=false" />
                <p-button [label]="isEditingQ ? 'Modifier ce question' : 'Ajouter à l’exercice'" icon="pi pi-check"
                    [style]="{'background-color':'#063970','border-color':'#063970'}"
                    (click)="confirmAddQuestion()" />
            </ng-template>
        </p-dialog>

        <!-- ══════════════════════════════════════════ -->
        <!-- Quick Add Exercice (depuis le tableau)   -->
        <!-- ══════════════════════════════════════════ -->
        <p-dialog [(visible)]="exerciceDialog" [style]="{'width':'540px'}"
            [header]="'Ajouter un exercice à: '+selectedTestForExercice?.titre" [modal]="true" class="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-5 pt-2">
                    <div>
                        <label class="block font-bold mb-3">Mode d'ajout</label>
                        <div class="flex gap-3">
                            <div class="flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all"
                                [style]="quickExMode==='new'?'border-color:#063970;background:#f0f7ff':'border-color:#e5e7eb'"
                                (click)="quickExMode='new'">
                                <div class="flex items-center gap-3">
                                    <p-radiobutton name="qkMode" value="new" [(ngModel)]="quickExMode" />
                                    <div>
                                        <div class="font-semibold text-gray-800">Nouvel exercice</div>
                                        <div class="text-xs text-gray-500">Créer un exercice inédit</div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all"
                                [style]="quickExMode==='existing'?'border-color:#063970;background:#f0f7ff':'border-color:#e5e7eb'"
                                (click)="quickExMode='existing'">
                                <div class="flex items-center gap-3">
                                    <p-radiobutton name="qkMode" value="existing" [(ngModel)]="quickExMode" />
                                    <div>
                                        <div class="font-semibold text-gray-800">Exercice existant</div>
                                        <div class="text-xs text-gray-500">Réutiliser un exercice</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div *ngIf="quickExMode==='new'">
                        <label class="block font-bold mb-2">Titre de l'exercice</label>
                        <input type="text" pInputText [(ngModel)]="newExercice.titre" placeholder="Titre de l'exercice" [fluid]="true" />
                    </div>
                    <div *ngIf="quickExMode==='existing'">
                        <label class="block font-bold mb-2">Choisir un exercice existant</label>
                        <p-select [(ngModel)]="quickExExistingId" [options]="getAvailableExercices()" optionLabel="titre" optionValue="id"
                            placeholder="Sélectionner un exercice" class="w-full" appendTo="body" [filter]="true" filterBy="titre"
                            (onChange)="onQuickExChange()" />
                    </div>

                    <!-- Section Questions pour l'ajout rapide -->
                    <p-divider align="left">
                        <div class="inline-flex items-center">
                            <i class="pi pi-question-circle mr-2"></i>
                            <b>Questions ({{ quickAddQuestions.length }})</b>
                        </div>
                    </p-divider>

                    <div class="flex flex-col gap-3">
                        <div *ngFor="let q of quickAddQuestions; let qIdx=index" 
                            class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span class="text-xs font-mono text-gray-400 mt-1 w-4">{{ qIdx+1 }}.</span>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 flex-wrap mb-1">
                                    <p-tag [value]="getQType(q)" severity="secondary" />
                                </div>
                                <div class="text-sm text-gray-800 font-medium">{{ getQLabel(q) }}</div>
                                
                                <!-- Propositions (Quick Add) -->
                                <div *ngIf="getQPropositions(q).length > 0" class="mt-1 text-xs text-gray-500 italic">
                                    <span *ngFor="let p of getQPropositions(q); let last = last">
                                        {{ p }}<span *ngIf="!last"> · </span>
                                    </span>
                                </div>

                                <!-- Réponse Correcte (Quick Add) -->
                                <div *ngIf="getQCorrectAnswer(q)" class="flex items-start gap-1 mt-1">
                                    <i class="pi pi-check-circle text-green-600 text-[10px] mt-1 shrink-0"></i>
                                    <span class="text-xs text-green-700 font-semibold">
                                        {{ q.typeQuestion === 'QUESTION_REPONSE' ? 'Réponse attendue : ' : '' }}{{ getQCorrectAnswer(q) }}
                                    </span>
                                </div>
                            </div>
                            <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" size="small"
                                (click)="removeQuickQuestion(qIdx)" />
                        </div>

                        <p-button label="Ajouter une question" icon="pi pi-plus" [text]="true" size="small"
                            [style]="{'color':'#063970'}" (click)="openAddQuickQuestionDialog()" />
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="exerciceDialog=false" />
                <p-button label="Ajouter l'exercice" icon="pi pi-check"
                    [style]="{'background-color':'#063970','border-color':'#063970'}"
                    (click)="saveQuickExercice()" />
            </ng-template>
        </p-dialog>

        <!-- Détails du test -->
        <p-dialog [(visible)]="detailsDialog" [style]="{'width':'500px'}" header="Détails du Test" [modal]="true">
            <div class="flex flex-col gap-4">
                <div><span class="block font-bold mb-1 text-gray-500 text-sm uppercase">Titre</span>
                    <div class="text-lg font-semibold">{{ test.titre }}</div></div>
                <div><span class="block font-bold mb-1 text-gray-500 text-sm uppercase">Offres associées</span>
                    <div class="flex flex-wrap gap-2">
                        <p-tag *ngFor="let id of test.offerIds || []" [value]="getOneOfferName(id)" severity="info" />
                        <span *ngIf="!(test.offerIds?.length)" class="italic text-slate-400">Aucune</span>
                    </div>
                </div>
                <div><span class="block font-bold mb-1 text-gray-500 text-sm uppercase">Durée</span>
                    <div>{{ test.dureeMinutes }} minutes</div></div>
                <div><span class="block font-bold mb-1 text-gray-500 text-sm uppercase">Description</span>
                    <div class="bg-gray-50 p-3 rounded border leading-relaxed">{{ test.description }}</div></div>
            </div>
            <ng-template #footer>
                <p-button label="Fermer" icon="pi pi-times" [text]="true" (click)="detailsDialog=false" />
            </ng-template>
        </p-dialog>

        <!-- Vue Exercices & Questions -->
        <p-dialog [(visible)]="viewExercicesDialog" [style]="{'width':'900px', 'max-width':'95vw'}"
            [header]="'Exercices & Questions – '+selectedTestForExercice?.titre" [modal]="true" [draggable]="false">
            
            <div class="flex flex-col gap-4 mt-2">
                <!-- Info Header -->
                <div class="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                    <div>
                        <h6 class="m-0 font-bold text-blue-900">Structure du Test</h6>
                        <p class="text-xs text-blue-600 m-0 mt-1">Gérez les exercices et questions associés à ce test en temps réel.</p>
                    </div>
                    <p-button label="Ajouter un exercice" icon="pi pi-plus" size="small"
                        [style]="{'background-color':'#063970','border-color':'#063970'}"
                        (click)="openQuickAddExercice(selectedTestForExercice!)" />
                </div>

                <!-- Empty State -->
                <div *ngIf="associatedExercices.length === 0" 
                    class="text-center py-12 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                    <i class="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
                    <div class="text-gray-500 font-medium">Aucun exercice associé.</div>
                </div>

                <!-- Exercise Cards -->
                <div *ngFor="let ex of associatedExercices; let exIdx=index" 
                    class="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                    
                    <!-- Exercise Header -->
                    <div class="flex items-center gap-3 p-4 cursor-pointer select-none"
                        [style.background]="ex._expanded ? 'linear-gradient(to right,#f0f7ff,#fff)' : 'linear-gradient(to right,#fafbfc,#fff)'"
                        (click)="ex._expanded = !ex._expanded">
                        <div class="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold shrink-0"
                            style="background:#063970">{{ exIdx + 1 }}</div>
                        <div class="flex-1 min-w-0">
                            <div class="font-bold text-gray-800">{{ ex.titre }}</div>
                            <div class="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-0.5">
                                {{ ex.questions?.length || 0 }} Questions
                            </div>
                        </div>
                        <div class="flex items-center gap-1">
                            <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small"
                                pTooltip="Modifier l’exercice" tooltipPosition="top"
                                (click)="$event.stopPropagation(); openEditExerciceDirect(ex)" />
                            <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" size="small"
                                pTooltip="Détacher du test" tooltipPosition="top"
                                (click)="$event.stopPropagation(); detachExerciceFromTest(ex)" />
                            <i [class]="ex._expanded ? 'pi pi-chevron-down ml-2 text-gray-400' : 'pi pi-chevron-right ml-2 text-gray-400'"></i>
                        </div>
                    </div>

                    <!-- Questions Panel -->
                    <div *ngIf="ex._expanded" class="border-t border-gray-100 p-4 bg-gray-50">
                        <div class="flex items-center justify-between mb-3 px-2">
                            <span class="text-xs font-black text-gray-400 uppercase tracking-widest">
                                <i class="pi pi-question-circle mr-1 text-blue-500"></i>Contenu de l'exercice
                            </span>
                            <p-button label="Nouvelle question" icon="pi pi-plus" [text]="true" size="small"
                                [style]="{'color':'#063970','font-size':'11px','font-weight':'bold'}" (click)="openAddDirectQuestionDialog(ex.id)" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <div *ngFor="let q of ex.questions; let qIdx=index" 
                                class="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 group hover:border-blue-200 transition-colors">
                                <span class="text-[10px] font-mono text-gray-400 mt-1.5 w-4">{{ qIdx + 1 }}.</span>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 mb-1">
                                        <p-tag [value]="q.typeQuestion" [severity]="q.typeQuestion==='QCU'?'info':'secondary'" styleClass="text-[9px] font-black" />
                                    </div>
                                    <div class="text-sm font-semibold text-gray-800">{{ q.enonce }}</div>
                                    
                                    <!-- Options View -->
                                    <div *ngIf="q.propositions?.length" class="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                                        <div *ngFor="let p of q.propositions" class="flex items-center gap-1.5">
                                            <i class="pi pi-circle-fill text-[6px] text-gray-300"></i>
                                            <span class="text-[11px] text-gray-500">{{ p }}</span>
                                        </div>
                                    </div>

                                    <!-- Correct Answer -->
                                    <div class="mt-1.5 flex items-center gap-1.5">
                                        <i class="pi pi-check-circle text-green-500 text-xs"></i>
                                        <span class="text-[11px] font-bold text-green-600">
                                            {{ (q.reponsesCorrectes || []).join(' · ') }}
                                        </span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small"
                                        (click)="openEditQuestionDirect(ex, q)" />
                                    <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" size="small"
                                        (click)="detachQuestionFromExercice(ex, q)" />
                                </div>
                            </div>

                            <div *ngIf="!ex.questions || ex.questions.length === 0" 
                                class="text-center py-4 text-gray-400 text-xs italic bg-white rounded-lg border border-dashed border-gray-200">
                                Aucune question dans cet exercice.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-4 flex justify-center">
                <p-button label="Ajouter un exercice" icon="pi pi-plus" [outlined]="true"
                    [style]="{'color':'#063970','border-color':'#063970'}"
                    (click)="openQuickAddExercice(selectedTestForExercice!)" />
            </div>

            <ng-template #footer>
                <p-button label="Fermer" icon="pi pi-times" [text]="true" (click)="viewExercicesDialog=false" />
            </ng-template>
        </p-dialog>

        <!-- ══════════════════════════════════════════ -->
        <!-- Composant Aperçu (Séparé pour performance) -->
        <!-- ══════════════════════════════════════════ -->
        <app-test-candidate-preview 
            [visible]="previewDialog" 
            [test]="selectedTestForExercice" 
            (onClosePreview)="previewDialog = false" />

        <!-- Vue Tentatives de test -->
        <p-dialog [(visible)]="viewAttemptsDialog" [style]="{'width':'900px', 'max-width':'95vw'}"
            [header]="'Tentatives pour le test – ' + (selectedTestForAttempts?.titre || '')" [modal]="true" [draggable]="false">
            
            <div class="flex flex-col gap-4 mt-2">
                <div *ngIf="currentTestAttempts.length === 0" 
                    class="text-center py-12 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                    <i class="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
                    <div class="text-gray-500 font-medium">Aucune tentative trouvée pour ce test.</div>
                </div>

                <div *ngFor="let attempt of currentTestAttempts; let i=index" 
                    class="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white mb-4">
                    <div class="flex items-center justify-between gap-3 p-4 select-none bg-gray-50 border-b border-gray-100">
                        <div class="flex items-center gap-3">
                            <div class="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold shrink-0 shadow-sm"
                                style="background:#063970">{{ i + 1 }}</div>
                            <div>
                                <div class="font-bold text-gray-800 text-sm">Candidat N° {{ attempt.candidatureId }}</div>
                                <div class="text-[10px] font-bold text-gray-400 tracking-wider mt-0.5">
                                    <i class="pi pi-calendar text-[9px] mr-1"></i>{{ attempt.datePassage | date:'longDate' }} à {{ attempt.datePassage | date:'shortTime' }}
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                            <div class="flex flex-col">
                                <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Score</span>
                                <span class="text-lg font-black leading-none mt-1" [ngClass]="attempt.passed ? 'text-green-600' : 'text-red-500'">
                                    {{ attempt.score }}%
                                </span>
                            </div>
                            <div class="h-8 w-px bg-gray-200"></div>
                            <p-tag [value]="attempt.passed ? 'Admis' : 'Non Admis'" [severity]="attempt.passed ? 'success' : 'danger'" styleClass="px-3 py-1 text-[10px] uppercase font-black tracking-widest shadow-sm" />
                        </div>
                    </div>
                    
                    <div class="p-5 bg-white" *ngIf="attempt.reponses && attempt.reponses.length > 0">
                        <h6 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <i class="pi pi-list text-gray-300"></i>Détails des questions
                        </h6>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div *ngFor="let rep of attempt.reponses; let rIdx=index" 
                                 class="p-4 border rounded-xl transition-all duration-200"
                                 [ngClass]="rep.correcte ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'">
                                <div class="flex items-start gap-2.5 mb-3">
                                    <div class="flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold mt-0.5 shrink-0"
                                         [ngClass]="rep.correcte ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                                        {{ rIdx + 1 }}
                                    </div>
                                    <div class="text-xs font-bold text-gray-800 leading-snug">{{ rep.questionText }}</div>
                                </div>
                                <div class="ml-7 flex flex-col gap-2">
                                    <div class="flex flex-col gap-1">
                                        <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Réponse du candidat</span>
                                        <div class="flex items-center gap-1.5">
                                            <i *ngIf="rep.correcte" class="pi pi-check-circle text-green-500 text-sm"></i>
                                            <i *ngIf="!rep.correcte" class="pi pi-times-circle text-red-500 text-sm"></i>
                                            <span class="text-xs font-semibold" [ngClass]="rep.correcte ? 'text-green-700' : (rep.reponsesDonnees && rep.reponsesDonnees.length) ? 'text-red-600' : 'text-gray-400 italic'">
                                                {{ rep.reponsesDonnees && rep.reponsesDonnees.length > 0 ? rep.reponsesDonnees.join(' · ') : 'Aucune réponse' }}
                                            </span>
                                        </div>
                                    </div>
                                    <div *ngIf="!rep.correcte" class="flex flex-col gap-1 mt-1 pt-2 border-t"
                                         [ngClass]="'border-red-100'">
                                        <span class="text-[9px] font-bold text-red-400 uppercase tracking-wider">Réponse attendue</span>
                                        <div class="flex items-center gap-1.5">
                                            <i class="pi pi-check text-green-500 text-[10px]"></i>
                                            <span class="text-xs font-bold text-green-600">
                                                {{ rep.bonnesReponses.join(' · ') || 'N/A' }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ng-template #footer>
                <p-button label="Fermer" icon="pi pi-times" [text]="true" size="small" [style]="{'color':'#063970'}" (click)="viewAttemptsDialog=false" />
            </ng-template>
        </p-dialog>

        <p-confirmDialog [style]="{'width':'450px'}" />
        <p-toast />
    `,
    providers: [MessageService, ConfirmationService]
})
export class TestManagement implements OnInit {
    // ─── Dialogs ───────────────────────────────────────
    testWizardDialog = false;
    detailsDialog = false;
    exerciceDialog = false;
    viewExercicesDialog = false;
    viewAttemptsDialog = false;
    previewDialog = false; // New preview state
    addExerciceDialog = false;
    addQuestionDialog = false;
    removedExerciceIds: string[] = []; // Track exercises removed during wizard update
    removedQuestionIds: { [exTempId: string]: string[] } = {}; // Track questions removed per exercise prep

    // ─── Data signals ──────────────────────────────────
    currentTestAttempts: TestAttemptResponse[] = [];
    selectedTestForAttempts: TechnicalTest | null = null;
    tests: Signal<TechnicalTest[]>;
    offers: Signal<InternshipOffer[]>;
    exercices: Signal<Exercice[]>;
    questions: Signal<Question[]>;

    // ─── Wizard state ──────────────────────────────────
    wizardStep = 1;
    test: Partial<TechnicalTest> = {};
    submitted = false;
    selectedTests!: TechnicalTest[] | null;

    exercicesPrep: ExercicePrep[] = [];

    // ─── Add Exercice sub-dialog ──────────────────────
    exMode: 'new' | 'existing' = 'new';
    exTitre = '';
    exExistingId: string | null = null;
    submittedEx = false;

    // ─── Add Question sub-dialog ──────────────────────
    qMode: 'new' | 'existing' = 'new';
    qEnonce = '';
    qType: string = 'QCU';
    qTrueFalse = 'Vrai';
    qReponseLibre = '';
    qExistingId: string | null = null;
    props: { text: string; isCorrect: boolean }[] = [];
    submittedQ = false;
    targetExIdx = -1;
    targetQIdx = -1; // To track if we're editing an existing question in prep
    isEditingQ = false;
    isEditingEx = false;

    typeQuestions = [
        { label: 'Choix unique (QCU)', value: 'QCU' },
        { label: 'Choix multiple (QCM)', value: 'QCM' },
        { label: 'Vrai/Faux', value: 'TRUE_FALSE' },
        { label: 'Question/Réponse', value: 'QUESTION_REPONSE' }
    ];
    trueFalseOpts = [{ label: 'Vrai', value: 'Vrai' }, { label: 'Faux', value: 'Faux' }];

    // ─── Quick add from table ─────────────────────────
    quickExMode: 'new' | 'existing' = 'new';
    quickExExistingId: string | null = null;
    selectedTestForExercice: TechnicalTest | null = null;
    newExercice: Partial<Exercice> = {};
    quickAddQuestions: QuestionPrep[] = [];
    isDirectViewAdd = false; // Flag to indicate adding from an existing view
    managedExerciseId: string | null = null; // To track existing exercise being added to
    associatedExercices: (Exercice & { questions?: Question[], _expanded?: boolean })[] = [];

    @ViewChild('dt') dt!: Table;

    constructor(
        private testService: TestService,
        private internshipService: InternshipService,
        private exerciceService: ExerciceService,
        private questionService: QuestionService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private filterService: FilterService,
        private testAttemptService: TestAttemptService
    ) {
        this.tests = this.testService.getTests();
        this.offers = this.internshipService.getOffers();
        this.exercices = this.exerciceService.getExercices();
        this.questions = this.questionService.getQuestions();
    }

    ngOnInit() {
        this.filterService.register('offerIntersect', (value: any[], filter: any[]): boolean => {
            if (filter === undefined || filter === null || filter.length === 0) {
                return true;
            }
            if (value === undefined || value === null || !Array.isArray(value)) {
                return false;
            }
            return value.some((v: any) => filter.includes(v));
        });
    }

    // ─── Helpers ───────────────────────────────────────
    async viewAttempts(test: TechnicalTest) {
        this.selectedTestForAttempts = test;
        this.currentTestAttempts = [];
        this.viewAttemptsDialog = true;
        try {
            this.currentTestAttempts = await this.testAttemptService.getByTest(test.id as any);
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les tentatives' });
        }
    }

    getOneOfferName(offerId: string): string {
        return this.offers().find(o => o.id === offerId)?.title ?? 'N/A';
    }
    
    getOfferName(offerIds: string[]): string {
        if (!offerIds?.length) return 'N/A';
        return offerIds.map(id => this.getOneOfferName(id)).join(', ');
    }
    
    getAvailableExercices(): Exercice[] {
        let currentTestId: string | undefined;
        let localExistingIds = new Set<string>();
        let localRemovedIds = new Set<string>();

        if (this.testWizardDialog) {
            currentTestId = this.test.id;
            this.exercicesPrep.forEach(ex => {
                if (ex.mode === 'existing' && ex.existingExerciceId) {
                    localExistingIds.add(ex.existingExerciceId);
                }
            });
            (this.removedExerciceIds || []).forEach(id => localRemovedIds.add(id));
        } else if (this.selectedTestForExercice) {
            currentTestId = this.selectedTestForExercice.id;
            const exs = this.exerciceService.getExercicesByTest(currentTestId);
            exs.forEach(e => localExistingIds.add(e.id));
        }

        return this.exercices().filter(ex => {
            if (localExistingIds.has(ex.id)) return false;
            if (currentTestId && ex.testIds && ex.testIds.includes(currentTestId)) {
                if (localRemovedIds.has(ex.id)) return true;
                return false;
            }
            return true;
        });
    }

    getAvailableQuestions(): Question[] {
        let currentExId: string | undefined;
        let localExistingIds = new Set<string>();
        let localRemovedIds = new Set<string>();

        if (this.targetExIdx >= 0 && this.exercicesPrep[this.targetExIdx]) {
            const ex = this.exercicesPrep[this.targetExIdx];
            currentExId = (ex.mode === 'existing') ? ex.existingExerciceId : undefined;
            ex.questions.forEach(q => {
                if (q.mode === 'existing' && q.existingQuestionId) localExistingIds.add(q.existingQuestionId);
            });
            (ex.removedQuestionIds || []).forEach(id => localRemovedIds.add(id));
        } else if (this.exerciceDialog) {
            if (this.quickExMode === 'existing' && this.quickExExistingId) {
                currentExId = this.quickExExistingId;
            }
            this.quickAddQuestions.forEach(q => {
                if (q.mode === 'existing' && q.existingQuestionId) localExistingIds.add(q.existingQuestionId);
            });
        } else if (this.managedExerciseId) {
            currentExId = this.managedExerciseId;
            const qs = this.questionService.getQuestionsByExercice(currentExId);
            qs.forEach(q => localExistingIds.add(q.id));
        }

        return this.questions().filter(q => {
            if (localExistingIds.has(q.id)) return false;
            if (currentExId && q.exerciceIds && q.exerciceIds.includes(currentExId)) {
                if (localRemovedIds.has(q.id)) return true;
                return false;
            }
            return true;
        });
    }
    
    getQuestionById(id: string): Question | undefined {
        return this.questions().find(q => q.id === id);
    }

    // Retourne la réponse correcte d'une question en préparation (pour l'affichage step 2)
    getQCorrectAnswer(q: QuestionPrep): string {
        if (q.mode === 'existing' && !q.enonce) {
            const eq = this.getQuestionById(q.existingQuestionId!);
            if (eq) return (eq.reponsesCorrectes || []).join(' · ');
        }

        const type = q.typeQuestion;
        if (type === 'QCU' || type === 'QCM') {
            const corrects = (q.propositions || []).filter(p => p.isCorrect).map(p => p.text).filter(t => t.trim());
            if (corrects.length) return corrects.join(' · ');
        } else if (type === 'TRUE_FALSE') {
            if (q.selectedTrueFalse) return q.selectedTrueFalse;
            return 'Vrai';
        } else if (type === 'QUESTION_REPONSE') {
            if (q.reponseLibre) return q.reponseLibre.substring(0, 80) + (q.reponseLibre.length > 80 ? '…' : '');
        }
        return '';
    }

    // Retourne les propositions d'une question en préparation (pour l'affichage step 2)
    getQPropositions(q: QuestionPrep): string[] {
        if (q.mode === 'existing' && !q.enonce) {
            const eq = this.getQuestionById(q.existingQuestionId!);
            return eq ? (eq.propositions || []) : [];
        }

        if (q.typeQuestion === 'TRUE_FALSE') return ['Vrai', 'Faux'];
        if (q.typeQuestion === 'QUESTION_REPONSE') return [];

        if (q.propositions && q.propositions.length > 0) {
            return q.propositions.map(p => p.text).filter(t => t.trim() !== '');
        }
        return [];
    }

    getExLabel(ex: ExercicePrep): string {
        if (ex.mode === 'new') return ex.titre || '(sans titre)';
        // Prioritize the title from prep if it was modified (for immediate feedback)
        if (ex.titre) return ex.titre;
        return this.exercices().find(e => e.id === ex.existingExerciceId)?.titre ?? 'Exercice inconnu';
    }

    getQLabel(q: QuestionPrep): string {
        if (q.mode === 'existing' && !q.enonce) {
            return this.getQuestionById(q.existingQuestionId!)?.enonce ?? 'Question inconnue';
        }
        if (q.enonce) return q.enonce;
        return '(sans énoncé)';
    }

    getQType(q: QuestionPrep): string {
        if (q.mode === 'existing' && !q.enonce) {
            return this.getQuestionById(q.existingQuestionId!)?.typeQuestion ?? '';
        }
        if (q.typeQuestion) return q.typeQuestion;
        return '';
    }
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
    onOfferFilter(table: Table, event: any) {
        table.filter(event.value, 'offerIds', 'offerIntersect');
    }
    
    // wizard-related logic simplified since multiselect binds directly to test.offerIds

    // ─── Open new wizard ───────────────────────────────
    openNew() {
        this.test = { dureeMinutes: 60, offerIds: [] };
        this.submitted = false;
        this.wizardStep = 1;
        this.exercicesPrep = [];
        this.testWizardDialog = true;
    }

    // ─── Edit : charge exercices et questions existants ──
    editTest(test: TechnicalTest) {
        this.test = { ...test };
        if (!this.test.offerIds) this.test.offerIds = [];
        this.submitted = false;
        this.wizardStep = 1;
        this.removedExerciceIds = []; // Reset on edit start
        this.removedQuestionIds = {};

        // Pré-charger les exercices existants du test
        const existingExercices = this.exerciceService.getExercicesByTest(test.id);
        this.exercicesPrep = existingExercices.map((ex: Exercice) => {
            const existingQs = this.questionService.getQuestionsByExercice(ex.id);
            return {
                tempId: ex.id,
                mode: 'existing' as const,
                existingExerciceId: ex.id,
                questions: existingQs.map(q => ({
                    tempId: q.id,
                    mode: 'existing' as const,
                    existingQuestionId: q.id
                })),
                expanded: false,
                removedQuestionIds: []
            };
        });

        this.testWizardDialog = true;
    }

    hideWizardDialog() {
        this.testWizardDialog = false;
        this.submitted = false;
    }

    // ─── Wizard navigation ─────────────────────────────
    nextStep() {
        this.submitted = true;
        // Offer is now optional
        if (this.test.titre?.trim() && this.test.description?.trim()) {
            this.submitted = false;
            this.wizardStep = 2;
        }
    }

    // ─── Save wizard (depuis étape 1 ou 2) ────────────
    async saveWizard() {
        this.submitted = true;
        // Offer is optional now, only title and description are required
        if (!this.test.titre?.trim() || !this.test.description?.trim()) {
            this.wizardStep = 1;
            return;
        }
        this.submitted = false;

        let testId: string;
        const totalExCount = this.exercicesPrep.length;

        try {
            if (this.test.id) {
                await this.testService.updateTest({ ...this.test, exerciceCount: totalExCount } as TechnicalTest);
                testId = this.test.id;
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Test mis à jour', life: 3000 });
            } else {
                const savedTest = await this.testService.addTest({
                    titre: this.test.titre!,
                    description: this.test.description!,
                    dureeMinutes: this.test.dureeMinutes ?? 60,
                    offerIds: this.test.offerIds ?? [],
                    exerciceCount: totalExCount
                });
                testId = savedTest.id;
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Test créé', life: 3000 });
            }

            // Persist exercises and their questions
            for (const ex of this.exercicesPrep) {
                let exerciceId: string;
                if (ex.mode === 'new') {
                    exerciceId = await this.exerciceService.addExercice({
                        titre: ex.titre!,
                        testIds: [testId],
                        questionCount: ex.questions.length
                    });
                } else {
                    const existingEx = this.exercices().find(e => e.id === ex.existingExerciceId);
                    if (existingEx) {
                        const currentTestIds = existingEx.testIds || (existingEx.testId ? [existingEx.testId] : []);
                        const updatedTestIds = currentTestIds.includes(testId) ? currentTestIds : [...currentTestIds, testId];
                        
                        // Also update title if changed in prep
                        const updatedTitle = ex.titre?.trim() || existingEx.titre;
                        if (updatedTitle !== existingEx.titre || !currentTestIds.includes(testId)) {
                            await this.exerciceService.updateExercice({ 
                                ...existingEx, 
                                titre: updatedTitle,
                                testIds: updatedTestIds 
                            });
                        }
                        exerciceId = existingEx.id;
                    } else continue;
                }
                for (const q of ex.questions) {
                    if (q.mode === 'new') {
                        const newQ: any = { enonce: q.enonce!, typeQuestion: q.typeQuestion!, exerciceId };
                        if (q.typeQuestion === 'QCU' || q.typeQuestion === 'QCM') {
                            newQ.propositions = (q.propositions || []).map(p => p.text);
                            newQ.reponsesCorrectes = (q.propositions || []).filter(p => p.isCorrect).map(p => p.text);
                        } else if (q.typeQuestion === 'TRUE_FALSE') {
                            newQ.propositions = ['Vrai', 'Faux'];
                            newQ.reponsesCorrectes = [q.selectedTrueFalse || 'Vrai'];
                        } else {
                            newQ.propositions = [];
                            newQ.reponsesCorrectes = [q.reponseLibre || ''];
                        }
                        await this.questionService.addQuestion(newQ);
                    } else {
                        const existingQ = this.getQuestionById(q.existingQuestionId!);
                        if (existingQ) {
                            const currentExIds = existingQ.exerciceIds || [];
                            const updatedExIds = currentExIds.includes(exerciceId) ? currentExIds : [...currentExIds, exerciceId];
                            
                            // Map prep data to question fields if it was edited
                            const updatedQ: any = { ...existingQ, exerciceIds: updatedExIds };
                            if (q.enonce) {
                                updatedQ.enonce = q.enonce;
                                if (q.typeQuestion) updatedQ.typeQuestion = q.typeQuestion;
                                
                                if (q.typeQuestion === 'QCU' || q.typeQuestion === 'QCM') {
                                    if (q.propositions) {
                                        updatedQ.propositions = q.propositions.map((p: any) => p.text);
                                        updatedQ.reponsesCorrectes = q.propositions.filter((p: any) => p.isCorrect).map((p: any) => p.text);
                                    }
                                } else if (q.typeQuestion === 'TRUE_FALSE') {
                                    updatedQ.propositions = ['Vrai', 'Faux'];
                                    if (q.selectedTrueFalse) updatedQ.reponsesCorrectes = [q.selectedTrueFalse];
                                } else if (q.typeQuestion === 'QUESTION_REPONSE') {
                                    updatedQ.propositions = [];
                                    if (q.reponseLibre) updatedQ.reponsesCorrectes = [q.reponseLibre];
                                }
                            }

                            await this.questionService.updateQuestion(updatedQ);
                        }
                    }
                }
            }

            // Handle detachments (those that were in the test but removed during wizard session)
            for (const removedId of this.removedExerciceIds) {
                const exToDetach = this.exercices().find(e => e.id === removedId);
                if (exToDetach && testId) {
                    const currentTestIds = exToDetach.testIds || (exToDetach.testId ? [exToDetach.testId] : []);
                    const updatedTestIds = currentTestIds.filter(id => id !== testId);
                    await this.exerciceService.updateExercice({ ...exToDetach, testIds: updatedTestIds });
                }
            }

            // Handle Question detachments
            for (const ex of this.exercicesPrep) {
                if (ex.removedQuestionIds?.length) {
                    const targetExId = (ex.mode === 'existing') ? ex.existingExerciceId : undefined;
                    if (targetExId) {
                        for (const qId of ex.removedQuestionIds) {
                            const q = this.getQuestionById(qId);
                            if (q) {
                                const currentExIds = q.exerciceIds || [];
                                const updatedExIds = currentExIds.filter(id => id !== targetExId);
                                await this.questionService.updateQuestion({ ...q, exerciceIds: updatedExIds });
                            }
                        }
                    }
                }
            }

            this.testService.fetchTests();
            this.exerciceService.fetchExercices();
            this.questionService.fetchQuestions();

            this.testWizardDialog = false;
            this.test = {};
            this.exercicesPrep = [];
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'enregistrement du test' });
        }
    }

    // ─── Sub-dialog: Add Exercise ──────────────────────
    openAddExerciceDialog() {
        this.isEditingEx = false;
        this.exMode = 'new';
        this.exTitre = '';
        this.exExistingId = null;
        this.submittedEx = false;
        this.addExerciceDialog = true;
    }

    openEditExerciceDialog(exIdx: number) {
        const ex = this.exercicesPrep[exIdx];
        this.isEditingEx = true;
        this.targetExIdx = exIdx;
        this.exMode = ex.mode;
        if (ex.mode === 'new') {
            this.exTitre = ex.titre || '';
        } else {
            const existing = this.exercices().find(e => e.id === ex.existingExerciceId);
            this.exTitre = existing?.titre || ex.titre || '';
        }
        this.exExistingId = ex.mode === 'existing' ? (ex.existingExerciceId || null) : null;
        this.submittedEx = false;
        this.addExerciceDialog = true;
    }

    async confirmAddExercice() {
        this.submittedEx = true;
        if (this.exMode === 'new' && !this.exTitre.trim()) return;
        if (this.exMode === 'existing' && !this.exExistingId) return;

        if (this.isEditingEx && this.targetExIdx >= 0) {
            const ex = this.exercicesPrep[this.targetExIdx];
            ex.mode = this.exMode;
            if (this.exMode === 'new') {
                ex.titre = this.exTitre.trim();
                ex.existingExerciceId = undefined;
            } else {
                ex.existingExerciceId = this.exExistingId!;
                ex.titre = this.exTitre.trim(); // Allow renaming existing
            }
        } else if (this.isEditingEx && this.targetExIdx === -4) { // Direct View Exercise Rename
            const ex = this.exercices().find(e => e.id === this.managedExerciseId);
            if (ex) {
                await this.exerciceService.updateExercice({ ...ex, titre: this.exTitre.trim() });
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Exercice renommé' });
                this.refreshCurrentView();
                this.testService.fetchTests();
            }
        } else {
            const newEx: ExercicePrep = {
                tempId: Date.now().toString(),
                mode: this.exMode,
                titre: this.exMode === 'new' ? this.exTitre.trim() : undefined,
                existingExerciceId: this.exMode === 'existing' ? this.exExistingId! : undefined,
                questions: [],
                expanded: true,
                removedQuestionIds: []
            };

            if (this.exMode === 'existing' && this.exExistingId) {
                const existingQs = this.questionService.getQuestionsByExercice(this.exExistingId);
                newEx.questions = existingQs.map(q => ({
                    tempId: q.id,
                    mode: 'existing',
                    existingQuestionId: q.id
                }));
            }

            this.exercicesPrep.push(newEx);
        }

        this.addExerciceDialog = false;
        this.submittedEx = false;
    }

    removeExercice(idx: number) {
        const ex = this.exercicesPrep[idx];
        if (ex.mode === 'existing' && ex.existingExerciceId) {
            this.removedExerciceIds.push(ex.existingExerciceId);
        }
        this.exercicesPrep.splice(idx, 1);
    }

    // ─── Sub-dialog: Add Question ──────────────────────
    openAddQuestionDialog(exIdx: number) {
        this.isEditingQ = false;
        this.targetExIdx = exIdx;
        this.targetQIdx = -1;
        this.qMode = 'new';
        this.qEnonce = '';
        this.qType = 'QCU';
        this.qTrueFalse = 'Vrai';
        this.qReponseLibre = '';
        this.qExistingId = null;
        this.props = [{ text: '', isCorrect: false }, { text: '', isCorrect: false }];
        this.submittedQ = false;
        this.addQuestionDialog = true;
    }

    openEditQuestionDialog(exIdx: number, qIdx: number) {
        const q = this.exercicesPrep[exIdx].questions[qIdx];
        this.isEditingQ = true;
        this.targetExIdx = exIdx;
        this.targetQIdx = qIdx;
        this.qMode = q.mode;

        if (q.mode === 'new') {
            this.qEnonce = q.enonce || '';
            this.qType = q.typeQuestion || 'QCU';
            this.qTrueFalse = q.selectedTrueFalse || 'Vrai';
            this.qReponseLibre = q.reponseLibre || '';
            this.props = q.propositions ? [...q.propositions] : [{ text: '', isCorrect: false }, { text: '', isCorrect: false }];
        } else {
            this.qExistingId = q.existingQuestionId || null;
            const eq = this.getQuestionById(this.qExistingId!);
            if (eq) {
                this.qEnonce = eq.enonce;
                this.qType = eq.typeQuestion;
                this.qTrueFalse = (eq.typeQuestion === 'TRUE_FALSE' && eq.reponsesCorrectes?.length) ? eq.reponsesCorrectes[0] : 'Vrai';
                this.qReponseLibre = (eq.typeQuestion === 'QUESTION_REPONSE' && eq.reponsesCorrectes?.length) ? eq.reponsesCorrectes[0] : '';
                
                if (eq.typeQuestion === 'QCU' || eq.typeQuestion === 'QCM') {
                    this.props = (eq.propositions || []).map(p => ({
                        text: p,
                        isCorrect: eq.reponsesCorrectes?.includes(p) || false
                    }));
                    if (this.props.length === 0) {
                        this.props = [{ text: '', isCorrect: false }, { text: '', isCorrect: false }];
                    }
                }
            }
        }

        this.submittedQ = false;
        this.addQuestionDialog = true;
    }

    async confirmAddQuestion() {
        this.submittedQ = true;
        if (this.qMode === 'new') {
            if (!this.qEnonce.trim() || !this.qType) return;
        } else {
            if (!this.qExistingId) return;
        }

        let tempId = Date.now().toString();
        if (this.isEditingQ) {
            if (this.targetExIdx >= 0) {
                tempId = this.exercicesPrep[this.targetExIdx].questions[this.targetQIdx].tempId;
            } else if (this.targetExIdx === -1 && this.quickAddQuestions[this.targetQIdx]) {
                tempId = this.quickAddQuestions[this.targetQIdx].tempId;
            } else if (this.targetExIdx === -5) {
                tempId = this.qExistingId || tempId;
            }
        }

        const data: QuestionPrep = {
            tempId,
            mode: this.qMode,
            existingQuestionId: this.qMode === 'existing' ? this.qExistingId! : undefined,
            enonce: this.qEnonce.trim(),
            typeQuestion: this.qType as any,
            propositions: [...this.props],
            selectedTrueFalse: this.qTrueFalse,
            reponseLibre: this.qReponseLibre
        };

        if (this.isEditingQ) {
            if (this.targetExIdx >= 0) {
                this.exercicesPrep[this.targetExIdx].questions[this.targetQIdx] = data;
            } else if (this.targetExIdx === -1) {
                this.quickAddQuestions[this.targetQIdx] = data;
            } else if (this.targetExIdx === -5) { // Direct View Edit
                const updatedQ: any = { 
                    id: this.qExistingId!,
                    enonce: data.enonce!, 
                    typeQuestion: data.typeQuestion!,
                    exerciceIds: this.getQuestionById(this.qExistingId!)?.exerciceIds || []
                };
                if (data.typeQuestion === 'QCU' || data.typeQuestion === 'QCM') {
                    updatedQ.propositions = (data.propositions || []).map(p => p.text);
                    updatedQ.reponsesCorrectes = (data.propositions || []).filter(p => p.isCorrect).map(p => p.text);
                } else if (data.typeQuestion === 'TRUE_FALSE') {
                    updatedQ.propositions = ['Vrai', 'Faux'];
                    updatedQ.reponsesCorrectes = [data.selectedTrueFalse || 'Vrai'];
                } else if (data.typeQuestion === 'QUESTION_REPONSE') {
                    updatedQ.propositions = [];
                    updatedQ.reponsesCorrectes = [data.reponseLibre || ''];
                }
                await this.questionService.updateQuestion(updatedQ);
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Question modifiée' });
                this.testService.fetchTests(); // Sync main table counts
                this.refreshCurrentView();
            }
        } else {
            if (this.targetExIdx === -1) {
                this.quickAddQuestions.push(data);
            } else if (this.targetExIdx === -2) { // Mode Direct Add (Existing View)
                const exerciceId = this.managedExerciseId!;
                if (data.mode === 'existing') {
                    const existingQ = this.getQuestionById(data.existingQuestionId!);
                    if (existingQ) {
                        const currentExIds = existingQ.exerciceIds || [];
                        if (!currentExIds.includes(exerciceId)) {
                            await this.questionService.updateQuestion({ 
                                ...existingQ, 
                                exerciceIds: [...currentExIds, exerciceId] 
                            });
                        }
                    }
                } else {
                    const enonce = data.enonce?.trim();
                    const type = data.typeQuestion;
                    if (!enonce || !type) return;
                    // For new questions being added directly to an exercise
                    const persistsQ: any = { 
                        enonce: enonce, 
                        typeQuestion: type, 
                        exerciceIds: [exerciceId] 
                    };
                    if (data.typeQuestion === 'QCU' || data.typeQuestion === 'QCM') {
                        persistsQ.propositions = (data.propositions || []).map(p => p.text);
                        persistsQ.reponsesCorrectes = (data.propositions || []).filter(p => p.isCorrect).map(p => p.text);
                    } else if (data.typeQuestion === 'TRUE_FALSE') {
                        persistsQ.propositions = ['Vrai', 'Faux'];
                        persistsQ.reponsesCorrectes = [data.selectedTrueFalse || 'Vrai'];
                    } else {
                        persistsQ.propositions = [];
                        persistsQ.reponsesCorrectes = [data.reponseLibre || ''];
                    }
                    await this.questionService.addQuestion(persistsQ);
                }
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Question ajoutée avec succès', life: 3000 });
                this.testService.fetchTests(); // Sync main table counts
                this.refreshCurrentView(); // Reload the exercices view
            } else if (this.targetExIdx >= 0 && this.exercicesPrep[this.targetExIdx]) {
                this.exercicesPrep[this.targetExIdx].questions.push(data);
            }
        }

        this.addQuestionDialog = false;
        this.submittedQ = false;
    }

    // Direct Adding from View Dialog
    openAddDirectQuestionDialog(exerciceId: string) {
        this.managedExerciseId = exerciceId;
        this.targetExIdx = -2; // Special ID for direct persist
        this.qMode = 'new';
        this.qEnonce = '';
        this.qType = 'QCU';
        this.qTrueFalse = 'Vrai';
        this.qReponseLibre = '';
        this.qExistingId = null;
        this.props = [{ text: '', isCorrect: false }, { text: '', isCorrect: false }];
        this.submittedQ = false;
        this.addQuestionDialog = true;
    }

    refreshCurrentView() {
        if (this.selectedTestForExercice) {
            const testId = this.selectedTestForExercice.id;
            
            // Capture current expansion states
            const expandedMap = new Map<string, boolean>();
            this.associatedExercices.forEach(ex => {
                if (ex.id) expandedMap.set(ex.id, !!ex._expanded);
            });

            this.associatedExercices = this.exerciceService.getExercicesByTest(testId).map((ex: Exercice) => ({
                ...ex,
                questions: this.questionService.getQuestionsByExercice(ex.id),
                _expanded: expandedMap.get(ex.id) || false
            }));

            // Re-fetch tests from service to reflect counter changes in main table
            this.tests = this.testService.getTests();
        }
    }

    async detachExerciceFromTest(ex: any) {
        if (!this.selectedTestForExercice) return;
        const testId = this.selectedTestForExercice.id;

        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir détacher l'exercice "${ex.titre}" de ce test ?`,
            header: 'Confirmation de détachement',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const currentTestIds = ex.testIds || (ex.testId ? [ex.testId] : []);
                    const updatedTestIds = currentTestIds.filter((id: string) => id !== testId);
                    
                    await this.exerciceService.updateExercice({
                        ...ex,
                        testIds: updatedTestIds
                    });

                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Exercice détaché avec succès' });
                    
                    this.testService.fetchTests();
                    this.exerciceService.fetchExercices();
                    this.refreshCurrentView();
                } catch (err) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du détachement' });
                }
            }
        });
    }

    async detachQuestionFromExercice(ex: any, q: any) {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir détacher cette question de l'exercice "${ex.titre}" ?`,
            header: 'Confirmation de détachement',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const currentExIds = q.exerciceIds || [];
                    const updatedExIds = currentExIds.filter((id: string) => id !== ex.id);
                    await this.questionService.updateQuestion({ ...q, exerciceIds: updatedExIds });
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Question détachée avec succès' });
                    this.refreshCurrentView();
                } catch (err) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du détachement' });
                }
            }
        });
    }

    // Direct Edit logic (Immediate DB updates)
    openEditExerciceDirect(ex: Exercice) {
        this.isEditingEx = true;
        this.managedExerciseId = ex.id;
        this.exMode = 'existing';
        this.exTitre = ex.titre;
        this.exExistingId = ex.id;
        this.targetExIdx = -4; // Special ID for direct exercise rename
        this.submittedEx = false;
        this.addExerciceDialog = true;
    }

    openEditQuestionDirect(ex: any, q: any) {
        this.managedExerciseId = ex.id;
        this.isEditingQ = true;
        this.targetExIdx = -5; // Special ID for direct question edit
        this.targetQIdx = -1; // Not used but avoids errors
        this.qMode = 'existing';
        this.qEnonce = q.enonce;
        this.qType = q.typeQuestion;
        this.qTrueFalse = (q.typeQuestion === 'TRUE_FALSE' && q.reponsesCorrectes?.length) ? q.reponsesCorrectes[0] : 'Vrai';
        this.qReponseLibre = (q.typeQuestion === 'QUESTION_REPONSE' && q.reponsesCorrectes?.length) ? q.reponsesCorrectes[0] : '';
        this.props = (q.propositions || []).map((p: string) => ({
            text: p,
            isCorrect: q.reponsesCorrectes?.includes(p) || false
        }));
        if (this.props.length === 0) this.props = [{ text: '', isCorrect: false }, { text: '', isCorrect: false }];
        
        this.qExistingId = q.id;
        this.submittedQ = false;
        this.addQuestionDialog = true;
    }

    // ─── Preview Candidat ─────────────────────────────
    openPreview(test: TechnicalTest) {
        this.selectedTestForExercice = test;
        this.previewDialog = true;
    }

    removeQuestion(exIdx: number, qIdx: number) {
        const q = this.exercicesPrep[exIdx].questions[qIdx];
        if (q.mode === 'existing' && q.existingQuestionId) {
            if (!this.exercicesPrep[exIdx].removedQuestionIds) {
                this.exercicesPrep[exIdx].removedQuestionIds = [];
            }
            this.exercicesPrep[exIdx].removedQuestionIds?.push(q.existingQuestionId);
        }
        this.exercicesPrep[exIdx].questions.splice(qIdx, 1);
    }

    // ─── Propositions helpers ─────────────────────────
    addProp() { this.props.push({ text: '', isCorrect: false }); }
    removeProp(i: number) { if (this.props.length > 2) this.props.splice(i, 1); }
    onRadio(idx: number) { this.props.forEach((p, i) => { if (i !== idx) p.isCorrect = false; }); }
    trackIdx(i: number) { return i; }

    // ─── Quick add exercice (from table +button) ───────
    openQuickAddExercice(test: TechnicalTest) {
        this.selectedTestForExercice = test;
        this.quickExMode = 'new';
        this.quickExExistingId = null;
        this.newExercice = {};
        this.quickAddQuestions = [];
        this.exerciceDialog = true;
    }

    // Charger les questions quand on sélectionne un exercice existant dans Quick Add
    onQuickExChange() {
        if (this.quickExMode === 'existing' && this.quickExExistingId) {
            const existingQs = this.questionService.getQuestionsByExercice(this.quickExExistingId);
            this.quickAddQuestions = existingQs.map(q => ({
                tempId: q.id,
                mode: 'existing',
                existingQuestionId: q.id
            }));
        } else {
            this.quickAddQuestions = [];
        }
    }

    // Ajout d'une question dans le mode "Quick Add"
    openAddQuickQuestionDialog() {
        this.targetExIdx = -1; // Indique qu'on est en mode Quick Add hors de l'array prep principal
        this.qMode = 'new';
        this.qEnonce = '';
        this.qType = 'QCU';
        this.qTrueFalse = 'Vrai';
        this.qReponseLibre = '';
        this.qExistingId = null;
        this.props = [{ text: '', isCorrect: false }, { text: '', isCorrect: false }];
        this.submittedQ = false;
        this.addQuestionDialog = true;
    }

    removeQuickQuestion(idx: number) {
        this.quickAddQuestions.splice(idx, 1);
    }

    async saveQuickExercice() {
        if (!this.selectedTestForExercice) return;

        let exerciceId: string;

        if (this.quickExMode === 'new') {
            const titre = this.newExercice.titre?.trim();
            if (!titre) return;
            exerciceId = await this.exerciceService.addExercice({
                titre: titre,
                testIds: [this.selectedTestForExercice.id],
                questionCount: this.quickAddQuestions.length
            });
        } else {
            if (!this.quickExExistingId || !this.selectedTestForExercice.id) return;
            const ex = this.exercices().find(e => e.id === this.quickExExistingId);
            if (!ex) return;
            
            const currentTestIds = ex.testIds || (ex.testId ? [ex.testId] : []);
            if (!currentTestIds.includes(this.selectedTestForExercice.id)) {
                await this.exerciceService.updateExercice({ ...ex, testIds: [...currentTestIds, this.selectedTestForExercice.id] });
            }
            exerciceId = ex.id;
        }

        // Persist questions added during Quick Add
        for (const q of this.quickAddQuestions) {
            if (q.mode === 'new') {
                const newQ: any = { enonce: q.enonce!, typeQuestion: q.typeQuestion!, exerciceId };
                if (q.typeQuestion === 'QCU' || q.typeQuestion === 'QCM') {
                    newQ.propositions = (q.propositions || []).map(p => p.text);
                    newQ.reponsesCorrectes = (q.propositions || []).filter(p => p.isCorrect).map(p => p.text);
                } else if (q.typeQuestion === 'TRUE_FALSE') {
                    newQ.propositions = ['Vrai', 'Faux'];
                    newQ.reponsesCorrectes = [q.selectedTrueFalse || 'Vrai'];
                } else {
                    newQ.propositions = [];
                    newQ.reponsesCorrectes = [q.reponseLibre || ''];
                }
                await this.questionService.addQuestion(newQ);
            } else {
                const existingQ = this.getQuestionById(q.existingQuestionId!);
                if (existingQ) {
                    await this.questionService.updateQuestion({ ...existingQ, exerciceId });
                }
            }
        }

        const current = this.selectedTestForExercice.exerciceCount || 0;
        await this.testService.updateTest({ ...this.selectedTestForExercice, exerciceCount: current + 1 });
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Exercice et questions ajoutés', life: 3000 });
        this.refreshCurrentView(); // Reload the view dialog to show new exercice
        this.exerciceDialog = false;
    }

    // ─── View exercises accordion ─────────────────────
    viewExercices(test: TechnicalTest) {
        this.selectedTestForExercice = test;
        this.associatedExercices = this.exerciceService.getExercicesByTest(test.id).map((ex: Exercice) => ({
            ...ex,
            questions: this.questionService.getQuestionsByExercice(ex.id)
        }));
        this.viewExercicesDialog = true;
    }

    // ─── Details ─────────────────────────────────────
    showDetails(test: TechnicalTest) {
        this.test = { ...test };
        this.detailsDialog = true;
    }

    // ─── Delete ──────────────────────────────────────
    deleteTest(test: TechnicalTest) {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer le test: ' + test.titre + ' ?',
            header: 'Confirmer', icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                await this.testService.deleteTest(test.id);
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Test supprimé', life: 3000 });
            }
        });
    }

    deleteSelectedTests() {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer les tests sélectionnés ?',
            header: 'Confirmer', icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                if (this.selectedTests) {
                    const ids = this.selectedTests.map(t => t.id);
                    await this.testService.deleteMultipleTests(ids);
                }
                this.selectedTests = null;
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Tests supprimés', life: 3000 });
            }
        });
    }
}
