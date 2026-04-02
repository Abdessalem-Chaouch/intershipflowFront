import { Component, OnInit, signal, ViewChild, Signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { ExerciceService, Exercice } from '@/app/services/exercice.service';
import { TestService, TechnicalTest } from '@/app/services/test.service';
import { QuestionService, Question } from '@/app/services/question.service';

@Component({
    selector: 'app-exercice-management',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        DialogModule,
        SelectModule,
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule,
        TagModule,
        TooltipModule,
        CheckboxModule,
        RadioButtonModule,
        TextareaModule,
        DividerModule
    ],
    template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nouveau" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button label="Supprimer" icon="pi pi-trash" severity="secondary" [outlined]="true" (onClick)="deleteSelectedExercices()" [disabled]="!selectedExercices || !selectedExercices.length"  />
            </ng-template>
            <ng-template #end>
                <p-button label="Exporter" icon="pi pi-upload" severity="secondary" (onClick)="dt.exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table #dt [value]="exercices()" [rows]="10" [paginator]="true" [globalFilterFields]="['titre', 'testId']" [tableStyle]="{ 'min-width': '75rem' }" [(selection)]="selectedExercices" [rowHover]="true" dataKey="id" currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} exercices" [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 20, 30]">
            <ng-template #caption>
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h5 class="m-0 text-2xl font-bold">Gestion des Exercices</h5>
                    <div class="flex flex-col md:flex-row gap-2">
                        <p-select [options]="tests()" optionLabel="titre" optionValue="id" [showClear]="true" placeholder="Filtrer par test" (onChange)="onTestFilter(dt, $event)" class="w-full md:w-64" />
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Rechercher..." />
                        </p-iconfield>
                    </div>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
                    <th pSortableColumn="titre">Titre <p-sortIcon field="titre" /></th>
                    <th pSortableColumn="testId">Test associé <p-sortIcon field="testId" /></th>
                    <th style="min-width: 8rem">Questions</th>
                    <th style="min-width: 10rem">Actions</th>
                </tr>
            </ng-template>
            <ng-template #body let-exercice>
                <tr>
                    <td><p-tableCheckbox [value]="exercice" /></td>
                    <td class="font-medium">{{ exercice.titre }}</td>
                    <td>{{ getTestName(exercice.testId) }}</td>
                    <td>
                        <div class="flex items-center gap-2">
                            <p-tag [value]="(exercice.questionCount || 0) + ' questions'" severity="info" class="cursor-pointer hover:opacity-80 transition-opacity" (click)="viewQuestions(exercice)" />
                            <p-button icon="pi pi-plus" pTooltip="Ajouter une question" [rounded]="true" [text]="true" size="small" [style]="{'color':'#063970'}" (click)="openQuickAddQuestion(exercice)" />
                        </div>
                    </td>
                    <td>
                        <div class="flex gap-2">
                            <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" (click)="editExercice(exercice)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteExercice(exercice)" />
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="exerciceDialog" [style]="{ width: '500px' }" [breakpoints]="{ '1199px': '75vw', '575px': '90vw' }" header="Détails de l'exercice" [modal]="true" class="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4 pt-2">
                    <div>
                        <label for="titre" class="block font-bold mb-2">Titre de l'exercice</label>
                        <input type="text" pInputText id="titre" [(ngModel)]="exercice.titre" required autofocus placeholder="Titre de l'exercice" class="w-full" />
                        <small class="text-red-500" *ngIf="submitted && !exercice.titre">Le titre est requis.</small>
                    </div>

                    <div>
                        <label for="test" class="block font-bold mb-2">Test technique</label>
                        <p-select id="test" [(ngModel)]="exercice.testId" [options]="tests()" optionLabel="titre" optionValue="id" placeholder="Choisir un test" [fluid]="true" appendTo="body" />
                        <small class="text-red-500" *ngIf="submitted && !exercice.testId">Le test est requis.</small>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="hideDialog()" />
                <p-button label="Enregistrer" icon="pi pi-check" (click)="saveExercice()" [style]="{ 'background-color': '#063970', 'border-color': '#063970' }" />
            </ng-template>
        </p-dialog>

        <!-- Quick Add Question Dialog -->
        <p-dialog [(visible)]="questionDialog" [style]="{ width: '650px' }" [breakpoints]="{ '1199px': '75vw', '575px': '90vw' }" header="Ajouter une question à {{ selectedExerciceForQuestion?.titre }}" [modal]="true" class="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-5 pt-2">
                    <!-- Mode Selection -->
                    <div>
                        <label class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-4">Mode d'ajout</label>
                        <div class="grid grid-cols-2 gap-4">
                            <!-- New Question Card -->
                            <div (click)="qMode='new'" 
                                 [class]="qMode==='new' ? 'border-[#063970] bg-blue-50/30 ring-1 ring-[#063970]/30' : 'border-slate-100 bg-white hover:border-blue-200'"
                                 class="cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group">
                                <div [class]="qMode==='new' ? 'bg-[#063970] text-white shadow-lg shadow-blue-900/10' : 'bg-slate-50 text-slate-400'"
                                     class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                    <p-radiobutton name="qMode" value="new" [(ngModel)]="qMode" />
                                </div>
                                <div class="flex flex-col min-w-0">
                                    <span class="font-black text-slate-800 text-sm whitespace-nowrap">Nouvelle question</span>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Créer une inédite</span>
                                </div>
                            </div>

                            <!-- Existing Question Card -->
                            <div (click)="qMode='existing'" 
                                 [class]="qMode==='existing' ? 'border-[#063970] bg-blue-50/30 ring-1 ring-[#063970]/30' : 'border-slate-100 bg-white hover:border-blue-200'"
                                 class="cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group">
                                <div [class]="qMode==='existing' ? 'bg-[#063970] text-white shadow-lg shadow-blue-900/10' : 'bg-slate-50 text-slate-400'"
                                     class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                    <p-radiobutton name="qMode" value="existing" [(ngModel)]="qMode" />
                                </div>
                                <div class="flex flex-col min-w-0">
                                    <span class="font-black text-slate-800 text-sm whitespace-nowrap">Question existante</span>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Réutiliser existante</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p-divider />

                    <!-- NEW QUESTION FORM -->
                    <div *ngIf="qMode==='new'" class="flex flex-col gap-4 animate-in fade-in duration-300">
                        <div>
                            <label for="newQTit" class="block font-bold mb-2">Enoncé de la question</label>
                            <input type="text" pInputText id="newQTit" [(ngModel)]="newQuestion.enonce" required autofocus placeholder="Poser la question..." class="w-full" />
                            <small class="text-red-500" *ngIf="questionSubmitted && !newQuestion.enonce">L'énoncé est requis.</small>
                        </div>

                        <div>
                            <label for="typeQuestion" class="block font-bold mb-2">Type</label>
                            <p-select id="typeQuestion" [(ngModel)]="newQuestion.typeQuestion" [options]="typeQuestions" optionLabel="label" optionValue="value" placeholder="Type" [fluid]="true" appendTo="body" styleClass="w-full" />
                            <small class="text-red-500" *ngIf="questionSubmitted && !newQuestion.typeQuestion">Le type est requis.</small>
                        </div>

                    <div *ngIf="newQuestion.typeQuestion === 'QCM' || newQuestion.typeQuestion === 'QCU'">
                        <div class="flex justify-between items-center mb-2">
                            <label class="block font-bold m-0">Propositions</label>
                            <p-button icon="pi pi-plus" label="Ajouter" [text]="true" size="small" (click)="addProposition()" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <div *ngFor="let prop of propositionsList; let i = index; trackBy: trackByProp" class="flex items-center gap-2">
                                <p-radiobutton *ngIf="newQuestion.typeQuestion === 'QCU'" [name]="'correctReq_' + i" [value]="true" [(ngModel)]="prop.isCorrect" (onClick)="onRadioChange(i)"></p-radiobutton>
                                <p-checkbox *ngIf="newQuestion.typeQuestion === 'QCM'" [binary]="true" [(ngModel)]="prop.isCorrect"></p-checkbox>
                                
                                <input type="text" pInputText [(ngModel)]="prop.text" placeholder="Option {{ i + 1 }}" class="w-full min-w-0" />
                                <p-button icon="pi pi-trash" severity="danger" [text]="true" (click)="removeProposition(i)" [disabled]="propositionsList.length <= 2" />
                            </div>
                        </div>
                        <small class="text-gray-500 block mt-1">Cochez la ou les bonnes réponses.</small>
                    </div>

                    <div *ngIf="newQuestion.typeQuestion === 'TRUE_FALSE' && qMode === 'new'">
                        <label class="block font-bold mb-2">Réponse correcte</label>
                        <p-select [options]="trueFalseOptions" [(ngModel)]="selectedTrueFalse" optionLabel="label" optionValue="value" placeholder="Choisir la bonne réponse" class="w-full" appendTo="body" [fluid]="true" />
                    </div>

                    <div *ngIf="newQuestion.typeQuestion === 'QUESTION_REPONSE' && qMode === 'new'">
                        <label class="block font-bold mb-2">Réponse correcte attendue</label>
                        <textarea pTextarea [(ngModel)]="reponseLibreTexte" rows="4" placeholder="Tapez la réponse ou les mots-clés attendus..." class="w-full"></textarea>
                    </div>
                </div> <!-- Closing qMode === 'new' -->

                <!-- EXISTING QUESTION SELECTION -->
                <div *ngIf="qMode==='existing'" class="flex flex-col gap-4 animate-in fade-in duration-300">
                        <div>
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
                            <small class="text-red-500 font-bold mt-1 block" *ngIf="questionSubmitted && !qExistingId">Veuillez sélectionner une question.</small>
                        </div>

                        <!-- Premium Preview Area -->
                        <div *ngIf="qExistingId" class="mt-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Aperçu de la question</div>
                            
                            <div class="flex items-start gap-2 mb-3">
                                <p-tag [value]="getQuestionById(qExistingId)?.typeQuestion||''" severity="info" styleClass="text-[9px] font-black px-2 py-0.5" />
                                <div class="text-sm font-bold text-slate-800 leading-tight">{{ getQuestionById(qExistingId)?.enonce }}</div>
                            </div>
                            
                            <!-- Propositions Preview -->
                            <div *ngIf="getQuestionById(qExistingId)?.propositions?.length" class="flex flex-col gap-1.5 mb-3 ml-1">
                                <div *ngFor="let p of getQuestionById(qExistingId)?.propositions" class="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-50">
                                    <i class="pi pi-circle text-[6px] text-slate-300"></i>
                                    <span class="text-xs text-slate-600 font-medium">{{ p }}</span>
                                </div>
                            </div>

                            <!-- Reponse Preview -->
                            <div *ngIf="getQuestionById(qExistingId)?.reponsesCorrectes?.length" class="flex items-center gap-2 text-green-600 ml-1">
                                <i class="pi pi-check-circle text-xs font-bold"></i>
                                <span class="text-xs font-black uppercase tracking-wider">Réponse :</span>
                                <span class="text-xs font-bold leading-tight">{{ (getQuestionById(qExistingId)?.reponsesCorrectes || []).join(' · ') }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="questionDialog = false" />
                <p-button label="Créer la question" icon="pi pi-check" (click)="saveQuickQuestion()" [style]="{ 'background-color': '#063970', 'border-color': '#063970' }" />
            </ng-template>
        </p-dialog>

        <!-- View Associated Questions Dialog -->
        <p-dialog [(visible)]="viewQuestionsDialog" [style]="{ width: '800px' }" [breakpoints]="{ '1199px': '75vw', '575px': '90vw' }" header="Questions associées - {{ selectedExerciceForQuestion?.titre }}" [modal]="true">
            <p-table [value]="associatedQuestions" [tableStyle]="{ 'min-width': '100%' }" class="p-fluid" dataKey="id">
                <ng-template #header>
                    <tr>
                        <th style="width: 15%">Type</th>
                        <th style="width: 35%">Enoncé</th>
                        <th style="width: 25%">Propositions</th>
                        <th style="width: 25%">Réponses Correctes</th>
                    </tr>
                </ng-template>
                <ng-template #body let-q>
                    <tr>
                        <td class="p-3"><p-tag [value]="q.typeQuestion" severity="info" /></td>
                        <td class="font-bold p-3">{{ q.enonce }}</td>
                        <td class="text-sm text-gray-600 p-3">{{ q.propositions?.length ? q.propositions.join(', ') : '-' }}</td>
                        <td class="text-sm text-green-700 font-bold p-3">{{ q.reponsesCorrectes?.length ? q.reponsesCorrectes.join(', ') : '-' }}</td>
                    </tr>
                </ng-template>
                <ng-template #empty>
                    <tr><td colspan="4" class="text-center p-4">Aucune question associée à cet exercice.</td></tr>
                </ng-template>
            </p-table>
            <div class="mt-4 flex justify-end">
                <p-button label="Ajouter une question" icon="pi pi-plus" [text]="true" [style]="{'color':'#063970'}" (click)="openQuickAddQuestion(selectedExerciceForQuestion!)" />
            </div>
            <ng-template #footer>
                <p-button label="Fermer" icon="pi pi-times" [text]="true" (click)="viewQuestionsDialog = false" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
        <p-toast />
    `,
    providers: [MessageService, ConfirmationService, QuestionService]
})
export class ExerciceManagement implements OnInit {
    exerciceDialog: boolean = false;
    questionDialog: boolean = false;
    viewQuestionsDialog: boolean = false;
    exercice: Partial<Exercice> = {};
    selectedExercices!: Exercice[] | null;
    submitted: boolean = false;
    selectedExerciceForQuestion: Exercice | null = null;
    associatedQuestions: Question[] = [];
    newQuestion: Partial<Question> = {};
    
    // Data Signals
    exercices: Signal<Exercice[]>;
    tests: Signal<TechnicalTest[]>;
    questions: Signal<Question[]>;

    questionSubmitted: boolean = false;
    qMode: 'new' | 'existing' = 'new';
    qExistingId: string | null = null;
    typeQuestions = [
        { label: 'Choix unique (QCU)', value: 'QCU' },
        { label: 'Choix multiple (QCM)', value: 'QCM' },
        { label: 'Vrai/Faux', value: 'TRUE_FALSE' },
        { label: 'Question/Réponse libre', value: 'QUESTION_REPONSE' }
    ];
    propositionsList: { text: string, isCorrect: boolean }[] = [];
    trueFalseOptions = [
        { label: 'Vrai', value: 'Vrai' },
        { label: 'Faux', value: 'Faux' }
    ];
    selectedTrueFalse: string = 'Vrai';
    reponseLibreTexte: string = '';

    @ViewChild('dt') dt!: Table;

    constructor(
        private exerciceService: ExerciceService,
        private testService: TestService,
        private questionService: QuestionService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.exercices = this.exerciceService.getExercices();
        this.tests = this.testService.getTests();
        this.questions = this.questionService.getQuestions();
    }

    ngOnInit() {}

    getTestName(testId: string): string {
        const test = this.tests().find(t => t.id === testId);
        return test ? test.titre : 'N/A';
    }

    getQuestionById(id: string): Question | undefined {
        return this.questions().find((q: Question) => q.id === id);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onTestFilter(table: Table, event: any) {
        table.filter(event.value, 'testId', 'equals');
    }

    openNew() {
        this.exercice = {};
        this.submitted = false;
        this.exerciceDialog = true;
    }

    editExercice(exercice: Exercice) {
        this.exercice = { ...exercice };
        this.exerciceDialog = true;
    }

    deleteSelectedExercices() {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer les exercices sélectionnés ?',
            header: 'Confirmer',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                for (const e of this.selectedExercices!) {
                    await this.exerciceService.deleteExercice(e.id);
                    const assocTest = this.tests().find(t => t.id === e.testId);
                    if (assocTest && assocTest.exerciceCount) {
                        await this.testService.updateTest({ ...assocTest, exerciceCount: assocTest.exerciceCount - 1 });
                    }
                }
                this.selectedExercices = null;
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Exercices supprimés', life: 3000 });
            }
        });
    }

    hideDialog() {
        this.exerciceDialog = false;
        this.submitted = false;
    }

    deleteExercice(exercice: Exercice) {
        this.confirmationService.confirm({
            message: "Êtes-vous sûr de vouloir supprimer l'exercice: " + exercice.titre + " ?",
            header: 'Confirmer',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                await this.exerciceService.deleteExercice(exercice.id);

                const assocTest = this.tests().find(t => t.id === exercice.testId);
                if (assocTest && assocTest.exerciceCount) {
                    await this.testService.updateTest({ ...assocTest, exerciceCount: assocTest.exerciceCount - 1 });
                }

                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Exercice supprimé', life: 3000 });
            }
        });
    }

    async saveExercice() {
        this.submitted = true;

        if (this.exercice.titre?.trim() && this.exercice.testId) {
            let wasNew = true;
            let oldTestId: string | null = null;

            try {
                if (this.exercice.id) {
                    wasNew = false;
                    const oldExercice = this.exercices().find(e => e.id === this.exercice.id);
                    oldTestId = oldExercice ? oldExercice.testId : null;
                    await this.exerciceService.updateExercice(this.exercice as Exercice);
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Exercice mis à jour', life: 3000 });
                } else {
                    await this.exerciceService.addExercice(this.exercice as Omit<Exercice, 'id'>);
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Exercice créé', life: 3000 });
                }

                if (wasNew) {
                    const assocTest = this.tests().find(t => t.id === this.exercice.testId);
                    if (assocTest) {
                        await this.testService.updateTest({ ...assocTest, exerciceCount: (assocTest.exerciceCount || 0) + 1 });
                    }
                } else if (oldTestId && oldTestId !== this.exercice.testId) {
                    const oldTest = this.tests().find(t => t.id === oldTestId);
                    if (oldTest && oldTest.exerciceCount) {
                        await this.testService.updateTest({ ...oldTest, exerciceCount: oldTest.exerciceCount - 1 });
                    }
                    const newTest = this.tests().find(t => t.id === this.exercice.testId);
                    if (newTest) {
                        await this.testService.updateTest({ ...newTest, exerciceCount: (newTest.exerciceCount || 0) + 1 });
                    }
                }

                this.exerciceDialog = false;
                this.exercice = {};
            } catch (err) {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'enregistrement de l\'exercice' });
            }
        }
    }

    viewQuestions(exercice: Exercice) {
        this.selectedExerciceForQuestion = exercice;
        this.associatedQuestions = this.questionService.getQuestionsByExercice(exercice.id);
        this.viewQuestionsDialog = true;
    }

    openQuickAddQuestion(exercice: Exercice) {
        this.selectedExerciceForQuestion = exercice;
        this.qMode = 'new';
        this.qExistingId = null;
        this.newQuestion = { typeQuestion: 'QCU' };
        this.questionSubmitted = false;
        this.propositionsList = [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ];
        this.selectedTrueFalse = 'Vrai';
        this.reponseLibreTexte = '';
        this.questionDialog = true;
    }

    saveQuickQuestion() {
        this.questionSubmitted = true;

        if (this.qMode === 'new') {
            if (this.newQuestion.enonce?.trim() && this.newQuestion.typeQuestion && this.selectedExerciceForQuestion) {
                
                if (this.newQuestion.typeQuestion === 'QCM' || this.newQuestion.typeQuestion === 'QCU') {
                    const validProps = this.propositionsList.filter(p => p.text.trim() !== '');
                    if (validProps.length < 2) {
                        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez saisir au moins 2 propositions', life: 3000 });
                        return;
                    }
                    this.newQuestion.propositions = validProps.map(p => p.text.trim());
                    this.newQuestion.reponsesCorrectes = validProps.filter(p => p.isCorrect).map(p => p.text.trim());
                    if (this.newQuestion.reponsesCorrectes.length === 0) {
                        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez sélectionner au moins une bonne réponse', life: 3000 });
                        return;
                    }
                } else if (this.newQuestion.typeQuestion === 'TRUE_FALSE') {
                    this.newQuestion.propositions = ['Vrai', 'Faux'];
                    this.newQuestion.reponsesCorrectes = [this.selectedTrueFalse];
                } else if (this.newQuestion.typeQuestion === 'QUESTION_REPONSE') {
                    this.newQuestion.propositions = [];
                    if (!this.reponseLibreTexte.trim()) {
                        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez saisir la réponse correcte', life: 3000 });
                        return;
                    }
                    this.newQuestion.reponsesCorrectes = [this.reponseLibreTexte.trim()];
                } else {
                    this.newQuestion.propositions = [];
                    this.newQuestion.reponsesCorrectes = [];
                }

                this.questionService.addQuestion({
                    ...this.newQuestion,
                    exerciceId: this.selectedExerciceForQuestion.id
                } as any);

                this.updateExQuestionCount();
                
                // Refresh the associated list if the view dialog is open
                if (this.selectedExerciceForQuestion?.id) {
                    this.associatedQuestions = this.questionService.getQuestionsByExercice(this.selectedExerciceForQuestion.id);
                }

                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Question créée et ajoutée', life: 3000 });
                this.questionDialog = false;
            }
        } else {
            // Existing Question Mode
            if (this.qExistingId && this.selectedExerciceForQuestion) {
                const eq = this.getQuestionById(this.qExistingId);
                if (eq) {
                    this.questionService.updateQuestion({ ...eq, exerciceId: this.selectedExerciceForQuestion.id });
                    this.updateExQuestionCount();
                    
                    // Refresh the associated list if the view dialog is open
                    if (this.selectedExerciceForQuestion?.id) {
                        this.associatedQuestions = this.questionService.getQuestionsByExercice(this.selectedExerciceForQuestion.id);
                    }

                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Question existante associée', life: 3000 });
                    this.questionDialog = false;
                }
            }
        }
    }

    private async updateExQuestionCount() {
        if (!this.selectedExerciceForQuestion) return;
        const currentCount = this.selectedExerciceForQuestion.questionCount || 0;
        await this.exerciceService.updateExercice({
            ...this.selectedExerciceForQuestion,
            questionCount: currentCount + 1
        });
    }

    addProposition() {
        this.propositionsList.push({ text: '', isCorrect: false });
    }

    removeProposition(index: number) {
        if (this.propositionsList.length > 2) {
            this.propositionsList.splice(index, 1);
        }
    }

    onRadioChange(index: number) {
        this.propositionsList.forEach((p, i) => {
            if (i !== index) p.isCorrect = false;
        });
    }

    trackByProp(index: number, item: any) {
        return index;
    }
}
