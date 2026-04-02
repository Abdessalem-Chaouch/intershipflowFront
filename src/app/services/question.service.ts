import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Question {
    id: string;
    enonce: string;
    typeQuestion: 'QCU' | 'QCM' | 'TRUE_FALSE' | 'QUESTION_REPONSE';
    propositions?: string[];
    reponsesCorrectes?: string[];
    exerciceId: string;
}

export interface QuestionDTO {
    id: number;
    enonce: string;
    typeQuestion: 'QCU' | 'QCM' | 'TRUE_FALSE' | 'QUESTION_REPONSE';
    propositions?: string[];
    reponsesCorrectes?: string[];
    exerciceId: number;
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
        return {
            id: dto.id.toString(),
            enonce: dto.enonce,
            typeQuestion: dto.typeQuestion,
            propositions: dto.propositions,
            reponsesCorrectes: dto.reponsesCorrectes,
            exerciceId: dto.exerciceId.toString()
        };
    }

    getQuestions() {
        return this.questions;
    }

    getQuestionsByExercice(exerciceId: string): Question[] {
        return this.questions().filter(q => q.exerciceId === exerciceId);
    }

    async addQuestion(question: Omit<Question, 'id'>) {
        const dto = {
            enonce: question.enonce,
            typeQuestion: question.typeQuestion,
            propositions: question.propositions,
            reponsesCorrectes: question.reponsesCorrectes,
            exerciceId: parseInt(question.exerciceId)
        };

        try {
            const saved = await firstValueFrom(this.http.post<QuestionDTO>(`${this.apiUrl}/exercice/${dto.exerciceId}`, dto));
            const mapped = this.mapToQuestion(saved);
            this.questions.update((qs) => [mapped, ...qs]);
        } catch (err) {
            console.error('Error adding question', err);
            throw err;
        }
    }

    async updateQuestion(updatedQ: Question) {
        const dto = {
            enonce: updatedQ.enonce,
            typeQuestion: updatedQ.typeQuestion,
            propositions: updatedQ.propositions,
            reponsesCorrectes: updatedQ.reponsesCorrectes,
            exerciceId: parseInt(updatedQ.exerciceId)
        };

        try {
            const saved = await firstValueFrom(this.http.put<QuestionDTO>(`${this.apiUrl}/${updatedQ.id}`, dto));
            const mapped = this.mapToQuestion(saved);
            this.questions.update((qs) => qs.map(q => q.id === mapped.id ? mapped : q));
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
}
