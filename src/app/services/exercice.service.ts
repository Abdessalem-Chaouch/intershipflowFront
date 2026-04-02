import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Exercice {
    id: string;
    titre: string;
    testId: string;
    questionCount?: number;
    questions?: any[];
}

export interface ExerciceDTO {
    id: number;
    titre: string;
    testId: number;
    questions?: any[];
}

@Injectable({
    providedIn: 'root'
})
export class ExerciceService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/exercices';
    private exercices = signal<Exercice[]>([]);

    constructor() {
        this.fetchExercices();
    }

    fetchExercices() {
        this.http.get<ExerciceDTO[]>(this.apiUrl).subscribe({
            next: (dtos) => {
                const mapped = dtos.map(dto => this.mapToExercice(dto));
                this.exercices.set(mapped);
            },
            error: (err) => console.error('Error fetching exercices', err)
        });
    }

    private mapToExercice(dto: ExerciceDTO): Exercice {
        return {
            id: dto.id.toString(),
            titre: dto.titre,
            testId: dto.testId.toString(),
            questionCount: dto.questions?.length || 0,
            questions: dto.questions
        };
    }

    getExercices() {
        return this.exercices;
    }

    getExercicesByTest(testId: string): Exercice[] {
        return this.exercices().filter(ex => ex.testId === testId);
    }

    async addExercice(exercice: Omit<Exercice, 'id'>): Promise<string> {
        const dto = {
            titre: exercice.titre,
            testId: parseInt(exercice.testId)
        };

        try {
            const saved = await firstValueFrom(this.http.post<ExerciceDTO>(`${this.apiUrl}/test/${dto.testId}`, dto));
            const mapped = this.mapToExercice(saved);
            this.exercices.update((exs) => [mapped, ...exs]);
            return mapped.id;
        } catch (err) {
            console.error('Error adding exercice', err);
            throw err;
        }
    }

    async updateExercice(updatedEx: Exercice) {
        const dto = {
            titre: updatedEx.titre,
            testId: parseInt(updatedEx.testId)
        };

        try {
            const saved = await firstValueFrom(this.http.put<ExerciceDTO>(`${this.apiUrl}/${updatedEx.id}`, dto));
            const mapped = this.mapToExercice(saved);
            this.exercices.update((exs) => exs.map(ex => ex.id === mapped.id ? mapped : ex));
        } catch (err) {
            console.error('Error updating exercice', err);
            throw err;
        }
    }

    async deleteExercice(id: string) {
        try {
            await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
            this.exercices.update((exs) => exs.filter(ex => ex.id !== id));
        } catch (err) {
            console.error('Error deleting exercice', err);
            throw err;
        }
    }
}
