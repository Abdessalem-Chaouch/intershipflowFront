import { Component, OnInit, signal, ViewChild, Signal } from '@angular/core';
import { ConfirmationService, MessageService, FilterService } from 'primeng/api';
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { QuestionService, Question } from '@/app/services/question.service';
import { ExerciceService, Exercice } from '@/app/services/exercice.service';

@Component({
    selector: 'app-question-management',
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
        TextareaModule,
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule,
        TagModule,
        CheckboxModule,
        RadioButtonModule,
        MultiSelectModule
    ],
    template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nouveau" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button label="Supprimer" icon="pi pi-trash" severity="secondary" [outlined]="true" (onClick)="deleteSelectedQuestions()" [disabled]="!selectedQuestions || !selectedQuestions.length"  />
            </ng-template>
            <ng-template #end>
                <p-button label="Exporter" icon="pi pi-upload" severity="secondary" (onClick)="dt.exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table #dt [value]="questions()" [rows]="10" [paginator]="true" [globalFilterFields]="['enonce', 'exerciceId', 'typeQuestion']" [tableStyle]="{ 'min-width': '75rem' }" [(selection)]="selectedQuestions" [rowHover]="true" dataKey="id" currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} questions" [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 20, 30]">
            <ng-template #caption>
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h5 class="m-0 text-2xl font-bold">Gestion des Questions</h5>
                    <div class="flex flex-col md:flex-row gap-2">
                        <p-multiselect [options]="typeQuestions" optionLabel="label" optionValue="value" placeholder="Filtrer types" (onChange)="onTypeFilter(dt, $event)" class="w-full md:w-56" display="chip" />
                        <p-multiselect [options]="exercices()" optionLabel="titre" optionValue="id" placeholder="Filtrer exercices" (onChange)="onExerciceFilter(dt, $event)" class="w-full md:w-64" display="chip" />
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Rechercher..." class="w-full md:w-auto" />
                        </p-iconfield>
                    </div>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
                    <th pSortableColumn="enonce">Enoncé <p-sortIcon field="enonce" /></th>
                    <th pSortableColumn="typeQuestion">Type <p-sortIcon field="typeQuestion" /></th>
                    <th style="min-width: 12rem">Exercices associés</th>
                    <th style="min-width: 10rem">Actions</th>
                </tr>
            </ng-template>
            <ng-template #body let-question>
                <tr>
                    <td><p-tableCheckbox [value]="question" /></td>
                    <td class="font-medium">{{ question.enonce }}</td>
                    <td><p-tag [value]="question.typeQuestion" severity="info" /></td>
                    <td>
                        <div class="flex flex-wrap gap-1">
                            <p-tag *ngFor="let exName of getExerciceNames(question.exerciceIds)" [value]="exName" severity="secondary" styleClass="text-[10px] bg-slate-100 text-slate-600" />
                            <span *ngIf="!question.exerciceIds || !question.exerciceIds.length" class="text-xs text-slate-400 italic">Aucun</span>
                        </div>
                    </td>
                    <td>
                        <div class="flex gap-2">
                            <p-button icon="pi pi-eye" [rounded]="true" [text]="true" [style]="{'color': '#063970'}" (click)="viewQuestionDetails(question)" pTooltip="Voir détails" tooltipPosition="top" />
                            <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" (click)="editQuestion(question)" pTooltip="Modifier" tooltipPosition="top" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteQuestion(question)" pTooltip="Supprimer" tooltipPosition="top" />
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="questionDialog" [style]="{ width: '600px' }" [breakpoints]="{ '1199px': '75vw', '575px': '90vw' }" header="Détails de la question" [modal]="true" class="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4 pt-2">
                    <div>
                        <label for="enonce" class="block font-bold mb-2">Enoncé de la question</label>
                        <input type="text" pInputText id="enonce" [(ngModel)]="question.enonce" required autofocus placeholder="Poser la question..." class="w-full" />
                        <small class="text-red-500" *ngIf="submitted && !question.enonce">L'énoncé est requis.</small>
                    </div>

                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex-1 min-w-0">
                            <label for="typeQuestion" class="block font-bold mb-2">Type</label>
                            <p-select id="typeQuestion" [(ngModel)]="question.typeQuestion" [options]="typeQuestions" optionLabel="label" optionValue="value" placeholder="Type" [fluid]="true" appendTo="body" styleClass="w-full" />
                            <small class="text-red-500" *ngIf="submitted && !question.typeQuestion">Le type est requis.</small>
                        </div>
                        <div class="flex-1 min-w-0">
                            <label for="exercice" class="block font-bold mb-2">Exercices techniques (Optionnel)</label>
                            <p-multiselect id="exercice" [(ngModel)]="question.exerciceIds" [options]="exercices()" optionLabel="titre" optionValue="id" placeholder="Choisir des exercices" [fluid]="true" appendTo="body" display="chip" styleClass="w-full" [showClear]="true" />
                            <small class="text-blue-500 italic mt-1 block">Optionnel : La question peut être rattachée à plusieurs exercices.</small>
                        </div>
                    </div>

                    <div *ngIf="question.typeQuestion === 'QCM' || question.typeQuestion === 'QCU'">
                        <div class="flex justify-between items-center mb-2">
                            <label class="block font-bold m-0">Propositions</label>
                            <p-button icon="pi pi-plus" label="Ajouter" [text]="true" size="small" (click)="addProposition()" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <div *ngFor="let prop of propositionsList; let i = index; trackBy: trackByProp" class="flex items-center gap-2">
                                <!-- Sélecteur pour définir si c'est la bonne réponse -->
                                <p-radiobutton *ngIf="question.typeQuestion === 'QCU'" [name]="'correctReq_' + i" [value]="true" [(ngModel)]="prop.isCorrect" (onClick)="onRadioChange(i)"></p-radiobutton>
                                <p-checkbox *ngIf="question.typeQuestion === 'QCM'" [binary]="true" [(ngModel)]="prop.isCorrect"></p-checkbox>
                                
                                <input type="text" pInputText [(ngModel)]="prop.text" placeholder="Option {{ i + 1 }}" class="w-full min-w-0" />
                                <p-button icon="pi pi-trash" severity="danger" [text]="true" (click)="removeProposition(i)" [disabled]="propositionsList.length <= 2" />
                            </div>
                        </div>
                        <small class="text-gray-500 block mt-1">Cochez la ou les bonnes réponses.</small>
                    </div>

                    <div *ngIf="question.typeQuestion === 'TRUE_FALSE'">
                        <label class="block font-bold mb-2">Réponse correcte</label>
                        <p-select [options]="trueFalseOptions" [(ngModel)]="selectedTrueFalse" optionLabel="label" optionValue="value" placeholder="Choisir la bonne réponse" class="w-full" appendTo="body" />
                    </div>

                    <div *ngIf="question.typeQuestion === 'QUESTION_REPONSE'">
                        <label class="block font-bold mb-2">Réponse correcte attendue</label>
                        <textarea pTextarea [(ngModel)]="reponseLibreTexte" rows="4" placeholder="Tapez la réponse ou les mots-clés attendus..." class="w-full"></textarea>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="hideDialog()" />
                <p-button label="Enregistrer" icon="pi pi-check" (click)="saveQuestion()" [style]="{ 'background-color': '#063970', 'border-color': '#063970' }" />
            </ng-template>
        </p-dialog>

        <!-- View Question Details Dialog -->
        <p-dialog [(visible)]="viewQuestionDialog" [style]="{ width: '550px' }" header="Détails de la Question" [modal]="true" class="p-fluid">
            <div *ngIf="selectedQuestion" class="flex flex-col gap-6 pt-2">
                <!-- Enoncé -->
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex items-center gap-2 mb-3">
                        <p-tag [value]="selectedQuestion.typeQuestion" severity="info" styleClass="text-[10px] font-black px-2 py-0.5" />
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question #{{selectedQuestion.id}}</span>
                    </div>
                    <div class="text-lg font-bold text-slate-800 leading-tight">
                        {{selectedQuestion.enonce}}
                    </div>
                </div>

                <!-- Exercices -->
                <div *ngIf="selectedQuestion.exerciceIds.length">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Exercices Associés</label>
                    <div class="flex flex-wrap gap-2">
                        <p-tag *ngFor="let exName of getExerciceNames(selectedQuestion.exerciceIds)" 
                               [value]="exName" 
                               styleClass="bg-white border border-slate-200 text-slate-600 font-bold px-3 py-1" />
                    </div>
                </div>

                <!-- Propositions -->
                <div *ngIf="selectedQuestion.propositions?.length">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Propositions & Réponses</label>
                    <div class="flex flex-col gap-2">
                        <div *ngFor="let prop of selectedQuestion.propositions" 
                             [class]="(selectedQuestion.reponsesCorrectes || []).includes(prop) ? 'bg-green-50 border-green-100 ring-1 ring-green-500/20' : 'bg-white border-slate-100 hover:bg-slate-50'"
                             class="flex items-center justify-between p-3 rounded-xl border transition-all">
                            <div class="flex items-center gap-3">
                                <i [class]="(selectedQuestion.reponsesCorrectes || []).includes(prop) ? 'pi pi-check-circle text-green-500' : 'pi pi-circle text-slate-300'" class="text-sm"></i>
                                <span [class]="(selectedQuestion.reponsesCorrectes || []).includes(prop) ? 'text-green-700 font-bold' : 'text-slate-600'" class="text-sm">{{prop}}</span>
                            </div>
                            <p-tag *ngIf="(selectedQuestion.reponsesCorrectes || []).includes(prop)" value="Correct" severity="success" styleClass="text-[9px] font-black px-2 py-0.5" />
                        </div>
                    </div>
                </div>

                <!-- Specific answers -->
                <div *ngIf="!selectedQuestion.propositions?.length && selectedQuestion.reponsesCorrectes?.length">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Réponse Attendue</label>
                    <div class="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3">
                        <i class="pi pi-info-circle text-green-500 mt-0.5"></i>
                        <span class="text-sm text-green-800 font-bold leading-relaxed">{{selectedQuestion.reponsesCorrectes?.[0] || 'N/A'}}</span>
                    </div>
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Fermer" icon="pi pi-times" [text]="true" (click)="viewQuestionDialog = false" />
                <p-button label="Modifier" icon="pi pi-pencil" (click)="editQuestion(selectedQuestion!); viewQuestionDialog=false" [style]="{ 'background-color': '#063970', 'border-color': '#063970' }" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
        <p-toast />
    `,
    providers: [MessageService, ConfirmationService]
})
export class QuestionManagement implements OnInit {
    questionDialog: boolean = false;
    viewQuestionDialog: boolean = false;
    selectedQuestion: Question | null = null;
    questions: Signal<Question[]>;
    exercices: Signal<Exercice[]>;
    question: Partial<Question> = {};
    selectedQuestions!: Question[] | null;
    submitted: boolean = false;
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
        private questionService: QuestionService,
        private exerciceService: ExerciceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private filterService: FilterService
    ) {
        this.questions = this.questionService.getQuestions();
        this.exercices = this.exerciceService.getExercices();
    }

    ngOnInit() {
        // Enregistrement d'un filtre personnalisé pour l'intersection de tableaux
        this.filterService.register('arrayIntersection', (value: any[], filter: any[]): boolean => {
            if (!filter || filter.length === 0) return true;
            if (!value || value.length === 0) return false;
            return value.some(id => filter.includes(id));
        });
    }

    getExerciceNames(exerciceIds: string[] = []): string[] {
        if (!exerciceIds?.length) return [];
        return exerciceIds.map(id => {
            const ex = this.exercices().find(e => e.id === id);
            return ex ? ex.titre : 'Inconnu';
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onExerciceFilter(table: Table, event: any) {
        // Mode personnalisé 'arrayIntersection' pour matcher si un exercice est dans la sélection
        table.filter(event.value, 'exerciceIds', 'arrayIntersection');
    }

    onTypeFilter(table: Table, event: any) {
        table.filter(event.value, 'typeQuestion', 'in');
    }

    openNew() {
        this.question = { typeQuestion: 'QCU', exerciceIds: [] };
        this.submitted = false;
        this.propositionsList = [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ];
        this.selectedTrueFalse = 'Vrai';
        this.reponseLibreTexte = '';
        this.questionDialog = true;
    }

    viewQuestionDetails(question: Question) {
        this.selectedQuestion = { ...question };
        this.viewQuestionDialog = true;
    }

    editQuestion(question: Question) {
        this.question = { ...question };
        if (question.typeQuestion === 'QCM' || question.typeQuestion === 'QCU') {
            this.propositionsList = (question.propositions || []).map(p => ({
                text: p,
                isCorrect: (question.reponsesCorrectes || []).includes(p)
            }));
            if (this.propositionsList.length === 0) {
                this.propositionsList = [
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false }
                ];
            }
        } else if (question.typeQuestion === 'TRUE_FALSE') {
            this.selectedTrueFalse = question.reponsesCorrectes?.[0] || 'Vrai';
        } else if (question.typeQuestion === 'QUESTION_REPONSE') {
            this.reponseLibreTexte = question.reponsesCorrectes?.[0] || '';
        }
        if (!this.question.exerciceIds) {
            this.question.exerciceIds = question.exerciceId ? [question.exerciceId] : [];
        }
        this.questionDialog = true;
    }

    deleteSelectedQuestions() {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer les questions sélectionnées ?',
            header: 'Confirmer',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                if (this.selectedQuestions) {
                    const allExIds = this.selectedQuestions.flatMap(q => q.exerciceIds || []);
                    const uniqueExIds = [...new Set(allExIds)];
                    
                    const questionIds = this.selectedQuestions.map(q => q.id);
                    await this.questionService.deleteMultiple(questionIds);
                    
                    // Cleanup counters (approximate logic - might need careful backend implementation)
                    for (const exId of uniqueExIds) {
                        const assocEx = this.exercices().find(e => e.id === exId);
                        if (assocEx && assocEx.questionCount) {
                            await this.exerciceService.updateExercice({ ...assocEx, questionCount: Math.max(0, assocEx.questionCount - 1) });
                        }
                    }
                }
                this.selectedQuestions = null;
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Questions supprimées', life: 3000 });
            }
        });
    }

    hideDialog() {
        this.questionDialog = false;
        this.submitted = false;
    }

    deleteQuestion(question: Question) {
        this.confirmationService.confirm({
            message: "Êtes-vous sûr de vouloir supprimer la question: '" + question.enonce + "' ?",
            header: 'Confirmer',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                await this.questionService.deleteQuestion(question.id);

                const ids = question.exerciceIds || (question.exerciceId ? [question.exerciceId] : []);
                for (const exId of ids) {
                    const assocEx = this.exercices().find(e => e.id === exId);
                    if (assocEx && assocEx.questionCount) {
                        await this.exerciceService.updateExercice({ ...assocEx, questionCount: Math.max(0, assocEx.questionCount - 1) });
                    }
                }

                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Question supprimée', life: 3000 });
            }
        });
    }

    async saveQuestion() {
        this.submitted = true;

        if (this.question.enonce?.trim() && this.question.typeQuestion) {
            
            if (this.question.typeQuestion === 'QCM' || this.question.typeQuestion === 'QCU') {
                const validProps = this.propositionsList.filter(p => p.text.trim() !== '');
                if (validProps.length < 2) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez saisir au moins 2 propositions', life: 3000 });
                    return;
                }
                this.question.propositions = validProps.map(p => p.text.trim());
                this.question.reponsesCorrectes = validProps.filter(p => p.isCorrect).map(p => p.text.trim());
                if (this.question.reponsesCorrectes.length === 0) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez sélectionner au moins une bonne réponse', life: 3000 });
                    return;
                }
            } else if (this.question.typeQuestion === 'TRUE_FALSE') {
                this.question.propositions = ['Vrai', 'Faux'];
                this.question.reponsesCorrectes = [this.selectedTrueFalse];
            } else if (this.question.typeQuestion === 'QUESTION_REPONSE') {
                this.question.propositions = [];
                if (!this.reponseLibreTexte.trim()) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez saisir la réponse correcte', life: 3000 });
                    return;
                }
                this.question.reponsesCorrectes = [this.reponseLibreTexte.trim()];
            } else {
                this.question.propositions = [];
                this.question.reponsesCorrectes = [];
            }

            let wasNew = true;
            let oldQuestion: Question | undefined = undefined;

            try {
                if (this.question.id) {
                    wasNew = false;
                    oldQuestion = this.questions().find(q => q.id === this.question.id);
                    await this.questionService.updateQuestion(this.question as Question);
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Question mise à jour', life: 3000 });
                } else {
                    await this.questionService.addQuestion(this.question as any);
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Question créée', life: 3000 });
                }

                if (wasNew) {
                    const ids = this.question.exerciceIds || [];
                    for (const exId of ids) {
                        const assocEx = this.exercices().find(e => e.id === exId);
                        if (assocEx) {
                            await this.exerciceService.updateExercice({ ...assocEx, questionCount: (assocEx.questionCount || 0) + 1 });
                        }
                    }
                } else {
                    // Logic for updates: determine which associations were added/removed
                    const oldExIds = oldQuestion ? (oldQuestion.exerciceIds || (oldQuestion.exerciceId ? [oldQuestion.exerciceId] : [])) : [];
                    const newExIds = this.question.exerciceIds || [];

                    // Added IDs
                    const added = newExIds.filter(id => !oldExIds.includes(id));
                    for (const id of added) {
                        const ex = this.exercices().find(e => e.id === id);
                        if (ex) await this.exerciceService.updateExercice({ ...ex, questionCount: (ex.questionCount || 0) + 1 });
                    }

                    // Removed IDs
                    const removed = oldExIds.filter(id => !newExIds.includes(id));
                    for (const id of removed) {
                        const ex = this.exercices().find(e => e.id === id);
                        if (ex && ex.questionCount) await this.exerciceService.updateExercice({ ...ex, questionCount: ex.questionCount - 1 });
                    }
                }

                this.questionDialog = false;
                this.question = {};
            } catch (err) {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'enregistrement' });
            }
        }
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
