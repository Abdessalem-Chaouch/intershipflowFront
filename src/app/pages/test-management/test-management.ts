import { Component, OnInit, signal, ViewChild, Signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
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
}

@Component({
    selector: 'app-test-management',
    standalone: true,
    imports: [
        CommonModule, TableModule, FormsModule, ButtonModule, RippleModule,
        ToastModule, ToolbarModule, InputTextModule, DialogModule, SelectModule,
        TextareaModule, InputNumberModule, ConfirmDialogModule, IconFieldModule,
        InputIconModule, TagModule, CheckboxModule, RadioButtonModule, DividerModule, TooltipModule,
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
            [globalFilterFields]="['titre','description','offerId']"
            [tableStyle]="{'min-width':'75rem'}" [(selection)]="selectedTests"
            [rowHover]="true" dataKey="id"
            currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} tests"
            [showCurrentPageReport]="true" [rowsPerPageOptions]="[10,20,30]">
            <ng-template #caption>
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h5 class="m-0 text-2xl font-bold">Gestion des Tests Techniques</h5>
                    <div class="flex flex-col md:flex-row gap-2">
                        <p-select [options]="offers()" optionLabel="title" optionValue="id" [showClear]="true" placeholder="Filtrer par offre" (onChange)="onOfferFilter(dt,$event)" class="w-full md:w-64" />
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt,$event)" placeholder="Rechercher..." />
                        </p-iconfield>
                    </div>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width:3rem"><p-tableHeaderCheckbox /></th>
                    <th pSortableColumn="titre">Titre <p-sortIcon field="titre" /></th>
                    <th pSortableColumn="offerId">Offre associée <p-sortIcon field="offerId" /></th>
                    <th pSortableColumn="dureeMinutes">Durée (min) <p-sortIcon field="dureeMinutes" /></th>
                    <th style="min-width:8rem">Exercices</th>
                    <th style="min-width:10rem">Actions</th>
                </tr>
            </ng-template>
            <ng-template #body let-test>
                <tr>
                    <td><p-tableCheckbox [value]="test" /></td>
                    <td class="font-semibold">{{ test.titre }}</td>
                    <td>{{ getOfferName(test.offerId) }}</td>
                    <td>{{ test.dureeMinutes }} min</td>
                    <td>
                        <div class="flex items-center gap-2">
                            <p-tag [value]="(test.exerciceCount || 0) + ' exercices'" severity="info" class="cursor-pointer hover:opacity-80 transition-opacity" (click)="viewExercices(test)" />
                            <p-button icon="pi pi-plus" pTooltip="Ajouter un exercice" tooltipPosition="top" [rounded]="true" [text]="true" size="small" [style]="{'color':'#063970'}" (click)="openQuickAddExercice(test)" />
                        </div>
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
                        <input type="text" pInputText [(ngModel)]="test.titre" autofocus placeholder="Ex : Test Angular Fondamentaux" [fluid]="true" />
                        <small class="text-red-500" *ngIf="submitted&&!test.titre">Le titre est requis.</small>
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Description</label>
                        <textarea pTextarea [(ngModel)]="test.description" rows="3" placeholder="Description du contenu du test" [fluid]="true"></textarea>
                        <small class="text-red-500" *ngIf="submitted&&!test.description">La description est requise.</small>
                    </div>
                    <div class="flex gap-4">
                        <div class="flex-1">
                            <label class="block font-bold mb-2">Durée (minutes)</label>
                            <p-inputnumber [(ngModel)]="test.dureeMinutes" [min]="5" [max]="240" [showButtons]="true" [fluid]="true" placeholder="60" />
                        </div>
                        <div class="flex-1">
                            <label class="block font-bold mb-2">Offre de stage</label>
                            <p-select [(ngModel)]="test.offerId" [options]="offers()" optionLabel="title" optionValue="id" placeholder="Choisir une offre" [fluid]="true" appendTo="body" />
                            <small class="text-red-500" *ngIf="submitted&&!test.offerId">L'offre est requise.</small>
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
                                <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" size="small"
                                    (click)="removeQuestion(exIdx,qIdx)" />
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
            header="Ajouter un exercice" [modal]="true" class="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-5 pt-2">
                    <div>
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
                    <div *ngIf="exMode==='new'">
                        <label class="block font-bold mb-2">Titre de l'exercice</label>
                        <input type="text" pInputText [(ngModel)]="exTitre" placeholder="Ex : Composants Angular" [fluid]="true" />
                        <small class="text-red-500" *ngIf="submittedEx&&!exTitre.trim()">Le titre est requis.</small>
                    </div>
                    <div *ngIf="exMode==='existing'">
                        <label class="block font-bold mb-2">Choisir un exercice existant</label>
                        <p-select [(ngModel)]="exExistingId" [options]="exercices()" optionLabel="titre" optionValue="id"
                            placeholder="Sélectionner un exercice" [fluid]="true" appendTo="body" [filter]="true" filterBy="titre" />
                        <small class="text-red-500" *ngIf="submittedEx&&!exExistingId">Veuillez sélectionner un exercice.</small>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="addExerciceDialog=false" />
                <p-button label="Ajouter à ce test" icon="pi pi-check"
                    [style]="{'background-color':'#063970','border-color':'#063970'}"
                    (click)="confirmAddExercice()" />
            </ng-template>
        </p-dialog>

        <!-- ══════════════════════════════════════════ -->
        <!-- SUB-DIALOG: Ajouter une Question         -->
        <!-- ══════════════════════════════════════════ -->
        <p-dialog [(visible)]="addQuestionDialog" [style]="{'width':'640px'}"
            header="Ajouter une question" [modal]="true" class="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-5 pt-2">
                    <div>
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

                    <!-- Nouvelle question -->
                    <div *ngIf="qMode==='new'" class="flex flex-col gap-4">
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
                                placeholder="Choisir" [fluid]="true" appendTo="body" />
                        </div>
                        <!-- QUESTION_REPONSE -->
                        <div *ngIf="qType==='QUESTION_REPONSE'">
                            <label class="block font-bold mb-2">Réponse correcte attendue</label>
                            <textarea pTextarea [(ngModel)]="qReponseLibre" rows="3" placeholder="Tapez la réponse attendue..." [fluid]="true"></textarea>
                        </div>
                    </div>

                    <!-- Question existante -->
                    <div *ngIf="qMode==='existing'" class="w-full">
                        <label class="block font-bold text-slate-800 mb-2">Choisir une question existante</label>
                        <p-select [(ngModel)]="qExistingId" [options]="questions()" optionLabel="enonce" optionValue="id"
                            placeholder="Sélectionner une question" [fluid]="true" appendTo="body" [filter]="true" filterBy="enonce">
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
                <p-button label="Ajouter à l'exercice" icon="pi pi-check"
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
                        <p-select [(ngModel)]="quickExExistingId" [options]="exercices()" optionLabel="titre" optionValue="id"
                            placeholder="Sélectionner un exercice" [fluid]="true" appendTo="body" [filter]="true" filterBy="titre"
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
                <div><span class="block font-bold mb-1 text-gray-500 text-sm uppercase">Offre associée</span>
                    <div class="text-blue-700 font-medium">{{ getOfferName(test.offerId!) }}</div></div>
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
        <p-dialog [(visible)]="viewExercicesDialog" [style]="{'width':'850px'}"
            [header]="'Exercices & Questions – '+selectedTestForExercice?.titre" [modal]="true">
            <p-table [value]="associatedExercices" [tableStyle]="{ 'min-width': '100%' }" class="p-fluid" dataKey="id">
                <ng-template #header>
                    <tr>
                        <th style="width:3rem"></th>
                        <th>Titre de l'exercice</th>
                        <th style="width:8rem" class="text-center">Questions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-ex>
                    <tr class="cursor-pointer hover:bg-gray-50" (click)="ex._expanded=!ex._expanded">
                        <td>
                            <p-button type="button" pRipple [text]="true" [rounded]="true" [plain]="true"
                                [icon]="ex._expanded?'pi pi-chevron-down':'pi pi-chevron-right'"
                                (click)="$event.stopPropagation();ex._expanded=!ex._expanded" />
                        </td>
                        <td class="font-bold p-3">{{ ex.titre }}</td>
                        <td class="text-center p-3">
                            <div class="flex items-center justify-center gap-2">
                                <p-tag [value]="ex.questions?.length||0" severity="info" class="cursor-pointer" (click)="$event.stopPropagation();ex._expanded=!ex._expanded" />
                                <p-button icon="pi pi-plus" [text]="true" [rounded]="true" size="small" [style]="{'color':'#063970'}" 
                                          pTooltip="Ajouter une question" tooltipPosition="top"
                                          (click)="$event.stopPropagation(); openAddDirectQuestionDialog(ex.id)" />
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="ex._expanded">
                        <td colspan="3" style="padding:0">
                            <div class="p-4 bg-gray-50 border-l-4 border-blue-400 ml-4 mr-2 mb-2 rounded-r-lg">
                                <div class="flex items-center justify-between mb-3 mt-1">
                                    <h6 class="m-0 font-semibold text-gray-700">Questions de "{{ ex.titre }}"</h6>
                                    <p-button label="Ajouter une question" icon="pi pi-plus" [text]="true" size="small"
                                        [style]="{'color':'#063970'}" (click)="openAddDirectQuestionDialog(ex.id)" />
                                </div>
                                <div *ngIf="ex.questions&&ex.questions.length>0; else noQ">
                                    <div *ngFor="let q of ex.questions; let i=index"
                                        class="flex items-start gap-3 py-2 border-b border-gray-200 last:border-0">
                                        <span class="text-xs text-gray-400 font-mono mt-1 w-4">{{ i+1 }}.</span>
                                        <p-tag [value]="q.typeQuestion" severity="secondary" class="shrink-0 mt-0.5" />
                                        <div class="flex-1 min-w-0">
                                            <div class="font-medium text-gray-800">{{ q.enonce }}</div>
                                            <!-- Propositions (Existing View) -->
                                            <div *ngIf="q.propositions && q.propositions.length > 0" class="mt-1 text-xs text-xs text-gray-500 italic">
                                                <span *ngFor="let p of q.propositions; let last = last">
                                                    {{ p }}<span *ngIf="!last"> · </span>
                                                </span>
                                            </div>
                                            <!-- Réponse Correcte (Existing View) -->
                                            <div class="mt-1 text-sm font-bold text-green-700">
                                                ✓ {{ (q.reponsesCorrectes || []).join(' · ') }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <ng-template #noQ>
                                    <div class="text-gray-400 italic py-2 text-sm">Aucune question dans cet exercice.</div>
                                </ng-template>
                            </div>
                        </td>
                    </tr>
                </ng-template>
                <ng-template #empty>
                    <tr><td colspan="3" class="text-center p-4 text-gray-400">Aucun exercice associé à ce test.</td></tr>
                </ng-template>
            </p-table>

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

        <p-confirmdialog [style]="{'width':'450px'}" />
        <p-toast />
    `,
    providers: [MessageService, ConfirmationService, ExerciceService, QuestionService]
})
export class TestManagement implements OnInit {
    // ─── Dialogs ───────────────────────────────────────
    testWizardDialog = false;
    detailsDialog = false;
    exerciceDialog = false;
    viewExercicesDialog = false;
    previewDialog = false; // New preview state
    addExerciceDialog = false;
    addQuestionDialog = false;

    // ─── Data signals ──────────────────────────────────
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
    associatedExercices: (Exercice & { questions?: Question[] })[] = [];

    @ViewChild('dt') dt!: Table;

    constructor(
        private testService: TestService,
        private internshipService: InternshipService,
        private exerciceService: ExerciceService,
        private questionService: QuestionService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.tests = this.testService.getTests();
        this.offers = this.internshipService.getOffers();
        this.exercices = this.exerciceService.getExercices();
        this.questions = this.questionService.getQuestions();
    }

    ngOnInit() { }

    // ─── Helpers ───────────────────────────────────────
    getOfferName(offerId: string): string {
        return this.offers().find(o => o.id === offerId)?.title ?? 'N/A';
    }
    getQuestionById(id: string): Question | undefined {
        return this.questions().find(q => q.id === id);
    }

    // Retourne la réponse correcte d'une question en préparation (pour l'affichage step 2)
    getQCorrectAnswer(q: QuestionPrep): string {
        if (q.mode === 'new') {
            const type = q.typeQuestion;
            if (type === 'QCU' || type === 'QCM') {
                const corrects = (q.propositions || []).filter(p => p.isCorrect).map(p => p.text).filter(t => t.trim());
                return corrects.length ? corrects.join(' · ') : '';
            } else if (type === 'TRUE_FALSE') {
                return q.selectedTrueFalse || '';
            } else if (type === 'QUESTION_REPONSE') {
                return q.reponseLibre ? q.reponseLibre.substring(0, 80) + (q.reponseLibre.length > 80 ? '…' : '') : '';
            }
        } else {
            const eq = this.getQuestionById(q.existingQuestionId!);
            if (eq) return (eq.reponsesCorrectes || []).join(' · ');
        }
        return '';
    }

    // Retourne les propositions d'une question en préparation (pour l'affichage step 2)
    getQPropositions(q: QuestionPrep): string[] {
        if (q.mode === 'new') {
            return (q.propositions || []).map(p => p.text).filter(t => t.trim() !== '');
        } else {
            const eq = this.getQuestionById(q.existingQuestionId!);
            return eq ? (eq.propositions || []) : [];
        }
    }

    getExLabel(ex: ExercicePrep): string {
        if (ex.mode === 'new') return ex.titre || '(sans titre)';
        return this.exercices().find(e => e.id === ex.existingExerciceId)?.titre ?? 'Exercice inconnu';
    }
    getQLabel(q: QuestionPrep): string {
        if (q.mode === 'new') return q.enonce || '(sans énoncé)';
        return this.getQuestionById(q.existingQuestionId!)?.enonce ?? 'Question inconnue';
    }
    getQType(q: QuestionPrep): string {
        if (q.mode === 'new') return q.typeQuestion ?? '';
        return this.getQuestionById(q.existingQuestionId!)?.typeQuestion ?? '';
    }
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
    onOfferFilter(table: Table, event: any) {
        table.filter(event.value, 'offerId', 'equals');
    }

    // ─── Open new wizard ───────────────────────────────
    openNew() {
        this.test = { dureeMinutes: 60 };
        this.submitted = false;
        this.wizardStep = 1;
        this.exercicesPrep = [];
        this.testWizardDialog = true;
    }

    // ─── Edit : charge exercices et questions existants ──
    editTest(test: TechnicalTest) {
        this.test = { ...test };
        this.submitted = false;
        this.wizardStep = 1;

        // Pré-charger les exercices existants du test
        const existingExercices = this.exerciceService.getExercicesByTest(test.id);
        this.exercicesPrep = existingExercices.map(ex => {
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
                expanded: false
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
        if (this.test.titre?.trim() && this.test.description?.trim() && this.test.offerId) {
            this.submitted = false;
            this.wizardStep = 2;
        }
    }

    // ─── Save wizard (depuis étape 1 ou 2) ────────────
    async saveWizard() {
        this.submitted = true;
        if (!this.test.titre?.trim() || !this.test.description?.trim() || !this.test.offerId) {
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
                testId = await this.testService.addTest({
                    titre: this.test.titre!,
                    description: this.test.description!,
                    dureeMinutes: this.test.dureeMinutes ?? 60,
                    offerId: this.test.offerId!,
                    exerciceCount: totalExCount
                });
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Test créé', life: 3000 });
            }

            // Persist exercises and their questions
            for (const ex of this.exercicesPrep) {
                let exerciceId: string;
                if (ex.mode === 'new') {
                    exerciceId = await this.exerciceService.addExercice({
                        titre: ex.titre!,
                        testId,
                        questionCount: ex.questions.length
                    });
                } else {
                    const existingEx = this.exercices().find(e => e.id === ex.existingExerciceId);
                    if (existingEx) {
                        await this.exerciceService.updateExercice({ ...existingEx, testId });
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
                            await this.questionService.updateQuestion({ ...existingQ, exerciceId });
                        }
                    }
                }
            }

            this.testWizardDialog = false;
            this.test = {};
            this.exercicesPrep = [];
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'enregistrement du test' });
        }
    }

    // ─── Sub-dialog: Add Exercise ──────────────────────
    openAddExerciceDialog() {
        this.exMode = 'new';
        this.exTitre = '';
        this.exExistingId = null;
        this.submittedEx = false;
        this.addExerciceDialog = true;
    }

    confirmAddExercice() {
        this.submittedEx = true;
        if (this.exMode === 'new' && !this.exTitre.trim()) return;
        if (this.exMode === 'existing' && !this.exExistingId) return;

        const newEx: ExercicePrep = {
            tempId: Date.now().toString(),
            mode: this.exMode,
            titre: this.exMode === 'new' ? this.exTitre.trim() : undefined,
            existingExerciceId: this.exMode === 'existing' ? this.exExistingId! : undefined,
            questions: [],
            expanded: true
        };

        // Si exercice existant, charger ses questions
        if (this.exMode === 'existing' && this.exExistingId) {
            const existingQs = this.questionService.getQuestionsByExercice(this.exExistingId);
            newEx.questions = existingQs.map(q => ({
                tempId: q.id,
                mode: 'existing',
                existingQuestionId: q.id
            }));
        }

        this.exercicesPrep.push(newEx);
        this.addExerciceDialog = false;
        this.submittedEx = false;
    }

    removeExercice(idx: number) {
        this.exercicesPrep.splice(idx, 1);
    }

    // ─── Sub-dialog: Add Question ──────────────────────
    openAddQuestionDialog(exIdx: number) {
        this.targetExIdx = exIdx;
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

    confirmAddQuestion() {
        this.submittedQ = true;
        if (this.qMode === 'new') {
            if (!this.qEnonce.trim() || !this.qType) return;
        } else {
            if (!this.qExistingId) return;
        }

        const newQ: QuestionPrep = {
            tempId: Date.now().toString(),
            mode: this.qMode,
            existingQuestionId: this.qMode === 'existing' ? this.qExistingId! : undefined,
            enonce: this.qMode === 'new' ? this.qEnonce.trim() : undefined,
            typeQuestion: this.qMode === 'new' ? (this.qType as any) : undefined,
            propositions: this.qMode === 'new' ? [...this.props] : undefined,
            selectedTrueFalse: this.qMode === 'new' ? this.qTrueFalse : undefined,
            reponseLibre: this.qMode === 'new' ? this.qReponseLibre : undefined
        };

        if (this.targetExIdx === -1) {
            this.quickAddQuestions.push(newQ);
        } else if (this.targetExIdx === -2) { // Mode Direct Add (Existing View)
            const exerciceId = this.managedExerciseId!;
            if (newQ.mode === 'existing') {
                const existingQ = this.getQuestionById(newQ.existingQuestionId!);
                if (existingQ) {
                    this.questionService.updateQuestion({ ...existingQ, exerciceId });
                }
            } else {
                const enonce = newQ.enonce?.trim();
                const type = newQ.typeQuestion;
                if (!enonce || !type) return;
                const persistsQ: any = { enonce: enonce, typeQuestion: type, exerciceId };
                if (newQ.typeQuestion === 'QCU' || newQ.typeQuestion === 'QCM') {
                    persistsQ.propositions = (newQ.propositions || []).map(p => p.text);
                    persistsQ.reponsesCorrectes = (newQ.propositions || []).filter(p => p.isCorrect).map(p => p.text);
                } else if (newQ.typeQuestion === 'TRUE_FALSE') {
                    persistsQ.propositions = ['Vrai', 'Faux'];
                    persistsQ.reponsesCorrectes = [newQ.selectedTrueFalse || 'Vrai'];
                } else {
                    persistsQ.propositions = [];
                    persistsQ.reponsesCorrectes = [newQ.reponseLibre || ''];
                }
                this.questionService.addQuestion(persistsQ);
            }
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Question ajoutée avec succès', life: 3000 });
            this.refreshCurrentView(); // Reload the exercices view
        } else if (this.targetExIdx >= 0 && this.exercicesPrep[this.targetExIdx]) {
            this.exercicesPrep[this.targetExIdx].questions.push(newQ);
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
            this.associatedExercices = this.exerciceService.getExercicesByTest(testId).map(ex => ({
                ...ex,
                questions: this.questionService.getQuestionsByExercice(ex.id)
            }));

            // Re-fetch tests from service to reflect counter changes in main table
            this.tests = this.testService.getTests();
        }
    }

    // ─── Preview Candidat ─────────────────────────────
    openPreview(test: TechnicalTest) {
        this.selectedTestForExercice = test;
        this.previewDialog = true;
    }

    removeQuestion(exIdx: number, qIdx: number) {
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
                testId: this.selectedTestForExercice.id,
                questionCount: this.quickAddQuestions.length
            });
        } else {
            if (!this.quickExExistingId || !this.selectedTestForExercice.id) return;
            const ex = this.exercices().find(e => e.id === this.quickExExistingId);
            if (!ex) return;
            await this.exerciceService.updateExercice({ ...ex, testId: this.selectedTestForExercice.id });
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
        this.associatedExercices = this.exerciceService.getExercicesByTest(test.id).map(ex => ({
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
            accept: () => {
                this.testService.deleteTest(test.id);
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Test supprimé', life: 3000 });
            }
        });
    }

    deleteSelectedTests() {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer les tests sélectionnés ?',
            header: 'Confirmer', icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.selectedTests?.forEach(t => this.testService.deleteTest(t.id));
                this.selectedTests = null;
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Tests supprimés', life: 3000 });
            }
        });
    }
}
