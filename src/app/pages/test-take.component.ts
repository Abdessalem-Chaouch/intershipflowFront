import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges, LOCALE_ID, effect, computed } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { TechnicalTest, TestService } from '@/app/services/test.service';
import { ExerciceService } from '@/app/services/exercice.service';
import { QuestionService } from '@/app/services/question.service';
import { TestAttemptService, TestAttemptRequest, TestReponseRequest } from '@/app/services/test-attempt.service';

registerLocaleData(localeFr);

@Component({
    selector: 'app-test-take',
    standalone: true,
    imports: [
        CommonModule,
        DialogModule,
        ButtonModule,
        TagModule,
        DividerModule,
        RadioButtonModule,
        CheckboxModule,
        FormsModule,
        TextareaModule
    ],
    providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
    template: `
        <div *ngIf="test" class="test-viewport bg-white rounded-3xl overflow-hidden shadow-sm">
            <!-- Header Premium Section -->
            <div class="test-header bg-gradient-to-br from-[#063970] to-[#1e4b8a] text-white p-8 md:p-12 relative overflow-hidden mb-12">
                <div class="absolute top-[-20%] right-[-5%] p-4 opacity-5 scale-[2.5] pointer-events-none">
                    <i class="pi pi-file-edit text-9xl"></i>
                </div>
                
                <div class="relative z-10">
                    <div class="flex flex-wrap items-center gap-3 mb-6">
                        <span class="inline-block bg-white/10 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20 backdrop-blur-md">
                            Évaluation Technique
                        </span>
                        <span class="inline-block bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/30">
                            En Cours
                        </span>
                    </div>
                    
                    <h2 class="text-4xl md:text-5xl font-bold !text-white mb-4 leading-tight tracking-tight">
  {{ test.titre }}
</h2>
                    <p class="text-blue-100/70 text-lg max-w-2xl leading-relaxed mb-8 italic">{{ test.description }}</p>
                    
                    <div class="flex flex-wrap items-center gap-6">
                        <div class="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                            <i class="pi pi-clock text-blue-200"></i>
                            <span class="text-sm font-bold">{{ test.dureeMinutes }} minutes</span>
                        </div>
                        <div class="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                            <i class="pi pi-list text-blue-200"></i>
                            <span class="text-sm font-bold">{{ totalQuestions() }} Questions</span>
                        </div>
                        <div class="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                            <i class="pi pi-user text-blue-200"></i>
                            <span class="text-sm font-bold">{{ candidateInfo?.firstName }} {{ candidateInfo?.lastName }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content Area -->
            <div class="px-6 md:px-12 pb-12">
                <div class="space-y-20">
                    <div *ngFor="let ex of exercicesPrep(); let i=index" class="exercice-container group">
                        <!-- Exercise Header -->
                        <div class="flex items-center gap-6 mb-10">
                            <div class="flex-none w-14 h-14 bg-[#063970] text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-blue-900/10 group-hover:scale-110 transition-transform">
                                {{ i+1 }}
                            </div>
                            <div class="flex-1">
                                <h3 class="text-2xl font-black text-[#063970] m-0">{{ ex.titre }}</h3>
                                <div class="h-1.5 w-16 bg-blue-100 mt-2 rounded-full overflow-hidden">
                                    <div class="h-full bg-[#063970] w-1/2"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Questions Stack -->
                        <div class="space-y-10 ml-7 border-l-2 border-dashed border-slate-100 pl-8 md:pl-16">
                            <div *ngFor="let q of ex.questions; let qi=index" class="question-card relative bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500">
                                <!-- Marker -->
                                <div class="absolute -left-[54px] md:-left-[70px] top-10 w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm z-10 transition-colors group-hover:border-blue-400 group-hover:text-blue-500">
                                    {{ qi+1 }}
                                </div>

                                <div class="flex items-center gap-3 mb-6">
                                    <span class="px-4 py-1.5 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-100">
                                        {{ q.typeQuestion }}
                                    </span>
                                </div>

                                <h4 class="text-xl md:text-2xl text-slate-800 font-bold mb-10 leading-relaxed">{{ q.enonce }}</h4>

                                <!-- Input Section -->
                                <div class="options-wrapper">
                                    <!-- QCU / TRUE_FALSE -->
                                    <div *ngIf="q.typeQuestion === 'QCU' || q.typeQuestion === 'TRUE_FALSE'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div *ngFor="let option of (q.typeQuestion === 'TRUE_FALSE' ? ['Vrai', 'Faux'] : q.propositions || [])" 
                                             class="option-item flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300"
                                             [ngClass]="answers[q.id] === option 
                                                ? 'bg-blue-50/50 border-[#063970] ring-4 ring-blue-500/5' 
                                                : 'bg-white border-slate-50 hover:border-slate-200 hover:bg-slate-50/30'"
                                             (click)="answers[q.id] = option">
                                            <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                                                 [ngClass]="answers[q.id] === option ? 'border-[#063970] bg-[#063970]' : 'border-slate-200 bg-white'">
                                                <div *ngIf="answers[q.id] === option" class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                            </div>
                                            <span class="text-base font-bold transition-colors" [ngClass]="answers[q.id] === option ? 'text-[#063970]' : 'text-slate-600'">
                                                {{ option }}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- QCM -->
                                    <div *ngIf="q.typeQuestion === 'QCM'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div *ngFor="let option of q.propositions" 
                                             class="option-item flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300"
                                             [ngClass]="isChecked(q.id, option) 
                                                ? 'bg-blue-50/50 border-[#063970] ring-4 ring-blue-500/5' 
                                                : 'bg-white border-slate-50 hover:border-slate-200 hover:bg-slate-50/30'"
                                             (click)="toggleQcm(q.id, option)">
                                            <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all"
                                                 [ngClass]="isChecked(q.id, option) ? 'border-[#063970] bg-[#063970] text-white' : 'border-slate-200 bg-white text-transparent'">
                                                <i class="pi pi-check text-[10px] font-black"></i>
                                            </div>
                                            <span class="text-base font-bold transition-colors" [ngClass]="isChecked(q.id, option) ? 'text-[#063970]' : 'text-slate-600'">
                                                {{ option }}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- QUESTION_REPONSE (Saisie Libre) -->
                                    <div *ngIf="q.typeQuestion === 'QUESTION_REPONSE'" class="free-text-area">
                                        <div class="relative group">
                                            <textarea pInputTextarea [(ngModel)]="answers[q.id]" placeholder="Saisissez votre réponse argumentée ici..." 
                                                      class="w-full p-6 text-lg rounded-2xl border-2 border-slate-100 bg-slate-50/30 focus:bg-white transition-all min-h-[150px] outline-none focus:border-[#063970] focus:ring-4 focus:ring-blue-500/5"
                                                      [autoResize]="true"></textarea>
                                            <div class="absolute bottom-4 right-4 text-[10px] font-bold text-slate-300 uppercase tracking-tighter opacity-0 group-focus-within:opacity-100 transition-opacity">
                                                Zone de saisie libre
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Action Area -->
                <div class="mt-24 pt-10 border-t border-slate-50 flex flex-col items-center gap-6">
                    <div class="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <i class="pi pi-shield"></i> Fin de l'évaluation technique
                    </div>
                    <p-button label="Soumettre et continuer ma candidature" 
                             icon="pi pi-verified" 
                             [loading]="isSubmitting"
                             (onClick)="submitTest()"
                             styleClass="submit-btn !bg-[#063970] !border-none !rounded-[2rem] !px-16 !py-5 !font-black !text-xl !shadow-2xl shadow-blue-900/20 hover:!scale-105 transition-all active:!scale-95" />
                    <p class="text-slate-400 text-[10px] font-medium max-w-xs text-center leading-relaxed">
                        En soumettant ce test, vos réponses seront enregistrées et votre score sera instantanément rattaché à votre dossier.
                    </p>
                </div>
            </div>
        </div>

        <style>
            .question-card::before {
                content: '';
                position: absolute;
                left: -70px;
                top: 55px;
                width: 30px;
                height: 2px;
                background: #f1f5f9;
                z-index: 1;
            }
            .exercice-container:last-child .space-y-10 {
                border-left-color: transparent;
            }
        </style>
    `
})
export class TestTakeComponent implements OnChanges {
    private testService = inject(TestService);
    private exerciceService = inject(ExerciceService);
    private questionService = inject(QuestionService);
    private attemptService = inject(TestAttemptService);

    @Input() test: TechnicalTest | null = null;
    @Input() candidateInfo: { firstName: string, lastName: string, candidatureId: number } | null = null;
    @Output() onTestCompleted = new EventEmitter<{ score: number, passed: boolean }>();

    exercicesPrep = computed(() => {
        if (!this.test) return [];
        const testId = this.test.id;
        return this.exerciceService.getExercicesByTest(testId).map(ex => ({
            ...ex,
            questions: this.questionService.getQuestionsByExercice(ex.id)
        }));
    });

    totalQuestions = computed(() => 
        this.exercicesPrep().reduce((acc, ex) => acc + (ex.questions?.length || 0), 0)
    );

    answers: { [key: string]: any } = {};
    isSubmitting = false;

    constructor() {
        // Automatically initialize answers when content is loaded
        effect(() => {
            const exs = this.exercicesPrep();
            if (exs.length > 0) {
                exs.forEach(ex => {
                    ex.questions?.forEach((q: any) => {
                        if (!(q.id in this.answers)) {
                            if (q.typeQuestion === 'QCM') this.answers[q.id] = [];
                            else this.answers[q.id] = '';
                        }
                    });
                });
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        // SimpleChanges handles input changes, computed handles reactivity
    }

    isChecked(qId: string, option: string): boolean {
        return this.answers[qId]?.includes(option);
    }

    toggleQcm(qId: string, option: string) {
        if (!this.answers[qId]) this.answers[qId] = [];
        const idx = this.answers[qId].indexOf(option);
        if (idx > -1) this.answers[qId].splice(idx, 1);
        else this.answers[qId].push(option);
    }

    async submitTest() {
        if (!this.test || !this.candidateInfo) return;
        this.isSubmitting = true;

        // Build reponses list matching TestReponseRequestDTO
        const reponses: TestReponseRequest[] = [];
        this.exercicesPrep().forEach(ex => {
            ex.questions.forEach((q: any) => {
                const userAnswer = this.answers[q.id];
                let reponsesDonnees: string[];

                if (q.typeQuestion === 'QCM') {
                    reponsesDonnees = Array.isArray(userAnswer) ? userAnswer : [];
                } else if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
                    reponsesDonnees = [String(userAnswer)];
                } else {
                    reponsesDonnees = [];
                }

                reponses.push({
                    questionId: Number(q.id),
                    reponsesDonnees
                });
            });
        });

        const attempt: TestAttemptRequest = {
            candidatureId: this.candidateInfo.candidatureId,
            testId: parseInt(this.test.id),
            reponses
        };

        try {
            const result = await this.attemptService.createAttempt(attempt);
            // Score and passed come from the backend
            this.onTestCompleted.emit({ score: result.score, passed: result.passed });
        } catch (err) {
            console.error('Error saving test attempt', err);
            // Fallback emit with 0 score on error
            this.onTestCompleted.emit({ score: 0, passed: false });
        } finally {
            this.isSubmitting = false;
        }
    }
}
