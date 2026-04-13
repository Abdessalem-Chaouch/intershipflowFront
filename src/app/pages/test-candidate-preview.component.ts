import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TechnicalTest } from '@/app/services/test.service';
import { ExerciceService } from '@/app/services/exercice.service';
import { QuestionService } from '@/app/services/question.service';

registerLocaleData(localeFr);

@Component({
    selector: 'app-test-candidate-preview',
    standalone: true,
    imports: [
        CommonModule,
        DialogModule,
        ButtonModule,
        TagModule,
        DividerModule
    ],
    providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
    template: `
        <p-dialog [(visible)]="visible" [modal]="true" [style]="{'width': '850px', 'max-width': '95vw'}"
            header="Aperçu du Test Technique" [draggable]="false" [resizable]="false" 
            styleClass="preview-modern-dialog" (onHide)="onClose()">
            
            <div *ngIf="visible && test" class="preview-container font-sans text-gray-800 p-4">
                <!-- Header Card (Plus de contraste et de clarté) -->
                <div class="header-card bg-[#063970] text-white p-8 rounded-2xl shadow-xl mb-8 relative overflow-hidden">
                    <div class="absolute top-[-20%] right-[-5%] p-4 opacity-5 scale-[2.5] pointer-events-none">
                        <i class="pi pi-file-edit text-9xl"></i>
                    </div>
                    <div class="relative z-10">
                        <span class="inline-block bg-white/10 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20 mb-4">
                            Module de Test Technnique
                        </span>
                        <h2 class="text-4xl font-extrabold m-0 leading-tight text-white mb-6">{{ test.titre }}</h2>
                        <div class="flex flex-wrap items-center gap-6 text-blue-50 text-sm">
                            <span class="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                <i class="pi pi-clock opacity-70"></i> 
                                <span class="font-medium">{{ test.dureeMinutes }} minutes</span>
                            </span>
                            <span class="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                <i class="pi pi-bars opacity-70"></i>
                                <span class="font-medium">{{ test.exerciceCount || exercicesPrep.length }} Exercices</span>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Section Consignes (Épurée) -->
                <div class="mb-10 p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
                    <div class="flex items-center gap-3 mb-3 border-b border-gray-50 pb-3">
                        <i class="pi pi-info-circle text-[#063970] text-xl"></i>
                        <h4 class="text-sm font-black text-[#063970] uppercase tracking-widest m-0">Consignes et Objectifs</h4>
                    </div>
                    <p class="text-gray-500 leading-relaxed text-sm m-0 italic">{{ test.description }}</p>
                </div>

                <!-- Exercises List -->
                <div class="space-y-16 pb-10">
                    <div *ngFor="let ex of exercicesPrep; let i=index" class="exercice-section border-t border-gray-100 pt-10 first:border-0 first:pt-0">
                        <!-- Exercise Title Bar -->
                        <div class="flex items-center gap-5 mb-8">
                            <div class="w-14 h-14 bg-[#063970] text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg">
                                {{ i+1 }}
                            </div>
                            <div>
                                <h3 class="text-2xl font-extrabold text-[#063970] m-0">{{ ex.titre }}</h3>
                                <div class="h-1 w-12 bg-blue-200 mt-1 rounded-full"></div>
                            </div>
                        </div>

                        <!-- Questions List (Mode Vertical Uniquement) -->
                        <div class="grid gap-8 ml-7 border-l-2 border-dashed border-gray-100 pl-10">
                            <div *ngFor="let q of ex.questions; let qi=index" class="question-item relative">
                                <!-- Question Mark -->
                                <div class="absolute -left-[54px] top-1 w-7 h-7 rounded-full bg-white border-2 border-blue-50 flex items-center justify-center text-[10px] font-black text-gray-400 shadow-sm">
                                    {{ qi+1 }}
                                </div>
                                <div class="mb-4">
                                    <p-tag [value]="q.typeQuestion" [severity]="getSeverity(q.typeQuestion)" [rounded]="true" styleClass="text-[10px] px-3 py-1 font-bold" />
                                </div>
                                <h4 class="text-xl text-gray-800 font-bold mb-6 leading-relaxed">{{ q.enonce }}</h4>

                                <!-- Propositions (Vertical Layout) -->
                                <div class="propositions-list flex flex-col gap-3">
                                    <!-- QCU / QCM Choices -->
                                    <ng-container *ngIf="q.propositions && q.propositions.length > 0">
                                        <div *ngFor="let p of q.propositions" 
                                            class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300"
                                            [ngClass]="q.reponsesCorrectes?.includes(p) 
                                                ? 'bg-emerald-50 border-emerald-500 shadow-sm' 
                                                : 'bg-white border-gray-50 opacity-70 grayscale'">
                                            <div class="w-6 h-6 rounded-full flex items-center justify-center border-2"
                                                [ngClass]="q.reponsesCorrectes?.includes(p) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 text-transparent'">
                                                <i class="pi pi-check text-[10px]"></i>
                                            </div>
                                            <span class="text-base" [ngClass]="q.reponsesCorrectes?.includes(p) ? 'text-emerald-900 font-bold' : 'text-gray-600'">
                                                {{ p }}
                                            </span>
                                        </div>
                                    </ng-container>

                                    <!-- Other types display -->
                                    <div *ngIf="q.typeQuestion === 'QUESTION_REPONSE' || q.typeQuestion === 'TRUE_FALSE'" class="mt-2">
                                        <div class="p-5 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-100 text-gray-800">
                                            <div class="text-[10px] font-black text-[#063970] uppercase tracking-widest mb-2 opacity-70">Réponse attendue (Admin)</div>
                                            <div class="text-lg font-bold flex items-center gap-3">
                                                <i class="pi pi-key text-blue-500"></i>
                                                {{ (q.reponsesCorrectes || []).join(' · ') }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ng-template #footer>
                <div class="flex justify-center w-full p-4 border-t bg-gray-50 rounded-b-xl">
                    <p-button label="Fermer l'aperçu" icon="pi pi-times" [outlined]="true" (click)="onClose()" 
                        [style]="{'color':'#063970', 'border-color':'#063970', 'font-weight':'bold'}" />
                </div>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        :host ::ng-deep .preview-modern-dialog .p-dialog-header { padding: 1.5rem 2rem 0.5rem 2rem; }
        :host ::ng-deep .preview-modern-dialog .p-dialog-content { padding: 0 1rem; overflow-x: hidden; }
        .preview-container { scroll-behavior: smooth; }
        .question-item::after {
            content: '';
            position: absolute;
            left: -40px;
            top: 15px;
            width: 15px;
            height: 2px;
            background: #f1f5f9;
        }
    `]
})
export class TestCandidatePreviewComponent implements OnChanges {
    private exerciceService = inject(ExerciceService);
    private questionService = inject(QuestionService);

    @Input() visible = false;
    @Input() test: TechnicalTest | null = null;
    @Output() onClosePreview = new EventEmitter<void>();

    exercicesPrep: any[] = [];

    ngOnChanges(changes: SimpleChanges) {
        if (this.visible && this.test) {
            this.loadContent();
        }
    }

    loadContent() {
        if (!this.test) return;
        this.exercicesPrep = this.exerciceService.getExercicesByTest(this.test.id).map(ex => ({
            ...ex,
            questions: this.questionService.getQuestionsByExercice(ex.id)
        }));
    }

    onClose() {
        this.onClosePreview.emit();
    }

    getSeverity(type: string): any {
        switch (type) {
            case 'QCU': return 'info';
            case 'QCM': return 'warn';
            case 'TRUE_FALSE': return 'success';
            default: return 'secondary';
        }
    }
}
