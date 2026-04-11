import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Question {
    id: string;
    enonce: string;
    typeQuestion: 'QCU' | 'QCM' | 'TRUE_FALSE' | 'QUESTION_REPONSE';
    propositions?: string[];
    reponsesCorrectes?: string[];
    exerciceIds: string[];
    exerciceId?: string; // For UI compatibility
}

export interface QuestionDTO {
    id: number;
    enonce: string;
    typeQuestion: 'QCU' | 'QCM' | 'TRUE_FALSE' | 'QUESTION_REPONSE';
    propositions?: string[];
    reponsesCorrectes?: string[];
    exerciceIds?: number[];
    exerciceId?: number; // For compatibility
}

@Injectable({
    providedIn: 'root'
})
export class QuestionService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/questions';
    private questions = signal<Question[]>([]);

    constructor() {
        this.fetchQuestions();
    }

    fetchQuestions() {
        this.http.get<QuestionDTO[]>(this.apiUrl).subscribe({
            next: (dtos) => {
                const mapped = dtos.map(dto => this.mapToQuestion(dto));
                this.questions.set(mapped);
            },
            error: (err) => console.error('Error fetching questions', err)
        });
    }

    private mapToQuestion(dto: QuestionDTO): Question {
        const exerciceIds = (dto.exerciceIds || []).map(id => id.toString());
        return {
            id: dto.id.toString(),
            enonce: dto.enonce,
            typeQuestion: dto.typeQuestion,
            propositions: dto.propositions,
            reponsesCorrectes: dto.reponsesCorrectes,
            exerciceIds,
            exerciceId: dto.exerciceId?.toString() || (exerciceIds.length > 0 ? exerciceIds[0] : undefined)
        };
    }

    getQuestions() {
        return this.questions;
    }

    getQuestionsByExercice(exerciceId: string): Question[] {
        return this.questions().filter(q => q.exerciceIds.includes(exerciceId));
    }

    async addQuestion(question: Partial<Question> & { exerciceId?: string, exerciceIds?: string[] }) {
        try {
            // Determine exercice IDs (combine singular exerciceId for legacy and exerciceIds for new multiple)
            // Determine exercice IDs
            let ids: number[] = [];
            if (Array.isArray(question.exerciceIds)) {
                ids = question.exerciceIds.map(id => parseInt(id));
            } else if (question.exerciceId) {
                ids = [parseInt(question.exerciceId)];
            }

            const dto: Partial<QuestionDTO> = {
                enonce: question.enonce,
                typeQuestion: question.typeQuestion,
                propositions: question.propositions || [],
                reponsesCorrectes: question.reponsesCorrectes || [],
                exerciceIds: ids
            };

            // Choose endpoint based on presence of associations
            const url = (ids.length > 0) ? `${this.apiUrl}/exercice` : this.apiUrl;

            const saved = await firstValueFrom(this.http.post<QuestionDTO>(url, dto));
            const mapped = this.mapToQuestion(saved);
            this.questions.update((qs) => [mapped, ...qs]);
            return mapped;
        } catch (err) {
            console.error('Error adding question', err);
            throw err;
        }
    }

    async updateQuestion(updatedQ: Question) {
        // Ensure we collect all associated IDs
        let ids: number[] = [];
        if (Array.isArray(updatedQ.exerciceIds)) {
            ids = updatedQ.exerciceIds.map(id => parseInt(id));
        } else if (updatedQ.exerciceId) {
            ids = [parseInt(updatedQ.exerciceId)];
        }

        const dto: Partial<QuestionDTO> = {
            enonce: updatedQ.enonce,
            typeQuestion: updatedQ.typeQuestion,
            propositions: updatedQ.propositions,
            reponsesCorrectes: updatedQ.reponsesCorrectes,
            exerciceIds: ids
        };

        try {
            const saved = await firstValueFrom(this.http.put<QuestionDTO>(`${this.apiUrl}/${updatedQ.id}`, dto));
            const mapped = this.mapToQuestion(saved);
            this.questions.update((qs) => qs.map(q => q.id === mapped.id ? mapped : q));
            return mapped;
        } catch (err) {
            console.error('Error updating question', err);
            throw err;
        }
    }

    async deleteQuestion(id: string) {
        try {
            await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
            this.questions.update((qs) => qs.filter(q => q.id !== id));
        } catch (err) {
            console.error('Error deleting question', err);
            throw err;
        }
    }

    async deleteMultiple(ids: string[]) {
        const numericIds = ids.map(id => parseInt(id));
        try {
            await firstValueFrom(this.http.request('delete', `${this.apiUrl}/delete-multiple`, {
                body: numericIds,
                responseType: 'text'
            }));
            this.questions.update((qs) => qs.filter(q => !ids.includes(q.id)));
        } catch (err) {
            console.error('Error deleting multiple questions', err);
            throw err;
        }
    }
}
