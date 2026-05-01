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
        <p-dialog [(visible)]="visible" [modal]="true" [style]="{'width': '780px', 'max-width': '95vw'}"
            header="Aperçu du Test Technique" [draggable]="false" [resizable]="false" 
            styleClass="preview-modern-dialog" (onHide)="onClose()">
            
            <div *ngIf="visible && test" class="preview-container font-sans text-slate-800 p-0">
                
                <!-- Main Header (Centered and Padded) -->
                <div class="px-8 pt-8 pb-6 border-b border-slate-50">
                    <h1 class="text-2xl font-black text-slate-900 mb-2 tracking-tight">{{ test.titre }}</h1>
                    <div class="flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        <span class="flex items-center gap-1.5"><i class="pi pi-clock text-blue-500"></i> {{ test.dureeMinutes }} minutes</span>
                        <span class="flex items-center gap-1.5"><i class="pi pi-list text-blue-500"></i> {{ exercicesPrep.length }} exercices</span>
                        <span class="flex items-center gap-1.5"><i class="pi pi-shield text-blue-500"></i> Certifié SIGA</span>
                    </div>
                </div>

                <!-- Content Area -->
                <div class="p-8">
                    <!-- Consignes Section -->
                    <div class="mb-10 p-4 bg-blue-50/40 border-l-4 border-blue-500 rounded-r-xl">
                        <h4 class="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Instructions aux candidats</h4>
                        <p class="text-slate-600 leading-relaxed text-sm italic m-0">{{ test.description }}</p>
                    </div>

                    <!-- Exercises List -->
                    <div class="space-y-16">
                        <div *ngFor="let ex of exercicesPrep; let i=index" class="exercice-section relative group">
                            
                            <!-- Continuous Vertical Line for this exercise -->
                            <div class="absolute left-[19px] top-[40px] bottom-0 w-[2px] bg-slate-100 z-0"></div>

                            <!-- Exercise Header -->
                            <div class="flex items-center gap-4 mb-10 relative z-10">
                                <div class="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-lg font-black shadow-lg shadow-slate-200 shrink-0">
                                    {{ i+1 }}
                                </div>
                                <h3 class="text-xl font-black text-slate-800 m-0 tracking-tight leading-none">{{ ex.titre }}</h3>
                            </div>

                            <!-- Questions List -->
                            <div class="pl-14 space-y-14">
                                <div *ngFor="let q of ex.questions; let qi=index" class="question-item relative group">
                                    
                                    <!-- Indicator Square (Perfectly Centered at 20px) -->
                                    <!-- pl-14 = 56px. Center is 20px. Box width 32px (w-8). Left edge = 20 - 16 = 4px. Offset = 56 - 4 = 52px. -->
                                    <div class="absolute -left-[52px] top-0 w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-lg shadow-slate-200/50 z-20">
                                        <span class="text-[10px] font-black text-slate-900">{{ qi+1 }}</span>
                                        <div class="absolute -right-[12px] top-1/2 -translate-y-1/2 w-3 h-[2px] bg-slate-100"></div>
                                    </div>
                                    
                                    <!-- Question Header -->
                                    <div class="flex items-center h-8 mb-4">
                                        <p-tag [value]="q.typeQuestion" [severity]="getSeverity(q.typeQuestion)" [rounded]="true" 
                                            styleClass="text-[8px] px-2 py-0.5 font-black uppercase tracking-widest h-[18px] flex items-center" />
                                    </div>

                                    <h4 class="text-base text-slate-800 font-bold mb-4 leading-snug tracking-tight group-hover:text-slate-900 transition-colors">{{ q.enonce }}</h4>

                                    <!-- Propositions -->
                                    <div class="propositions-list flex flex-col gap-2.5">
                                        <ng-container *ngIf="q.propositions && q.propositions.length > 0">
                                            <div *ngFor="let p of q.propositions" 
                                                class="flex items-center gap-4 p-3 rounded-xl border-2 transition-all duration-300"
                                                [ngClass]="q.reponsesCorrectes?.includes(p) 
                                                    ? 'bg-emerald-50/50 border-emerald-500 ring-4 ring-emerald-500/5' 
                                                    : 'bg-white border-slate-50 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 hover:border-slate-200 hover:shadow-sm'">
                                                <div class="w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors"
                                                    [ngClass]="q.reponsesCorrectes?.includes(p) ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'border-slate-200 text-transparent'">
                                                    <i class="pi pi-check text-[10px]"></i>
                                                </div>
                                                <span class="text-sm" [ngClass]="q.reponsesCorrectes?.includes(p) ? 'text-emerald-900 font-bold' : 'text-slate-600'">
                                                    {{ p }}
                                                </span>
                                            </div>
                                        </ng-container>

                                        <!-- Other types display -->
                                        <div *ngIf="q.typeQuestion === 'QUESTION_REPONSE' || q.typeQuestion === 'TRUE_FALSE'" class="mt-2">
                                            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                                                <div class="text-[9px] font-black text-slate-400 title-font uppercase tracking-[0.2em] mb-2 opacity-70 italic">Réponse attendue</div>
                                                <div class="text-base font-black flex items-center gap-3 text-slate-800">
                                                    <i class="pi pi-key text-blue-400 text-xl"></i>
                                                    {{ (q.reponsesCorrectes || []).join(' · ') }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Spacer for vertical line continuity -->
                                    <div class="h-10 last:hidden"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ng-template #footer>
                <div class="flex justify-center w-full p-6 border-t bg-slate-50/30 rounded-b-2xl">
                    <p-button label="Quitter l'aperçu" icon="pi pi-times" [text]="true" (click)="onClose()" 
                        styleClass="p-button-secondary font-black tracking-widest uppercase text-[10px]" />
                </div>
            </ng-template>
            </p-dialog>
    `,
    styles: [`
        :host ::ng-deep .preview-modern-dialog { border-radius: 1.5rem; overflow: hidden; border: none; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        :host ::ng-deep .preview-modern-dialog .p-dialog-header { padding: 1.5rem 2rem 0.5rem 2rem; background: #fff; }
        :host ::ng-deep .preview-modern-dialog .p-dialog-content { padding: 0 1.5rem 1.5rem 1.5rem; overflow-x: hidden; background: #fff; }
        .preview-container { scroll-behavior: smooth; max-height: 70vh; }
        .preview-container::-webkit-scrollbar { width: 6px; }
        .preview-container::-webkit-scrollbar-track { background: transparent; }
        .preview-container::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .preview-container::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
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
        this.exercicesPrep = this.exerciceService.getExercicesByTest(this.test.id).map((ex: any) => ({
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
