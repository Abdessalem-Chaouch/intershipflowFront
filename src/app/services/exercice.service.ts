import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Exercice {
    id: string;
    titre: string;
    testIds: string[];
    testId?: string; // Added for UI compatibility
    questionCount?: number;
    questions?: any[];
}

export interface ExerciceDTO {
    id: number;
    titre: string;
    testIds?: number[];
    testId?: number; // Added for compatibility
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
        const testIds = (dto.testIds || []).map(id => id.toString());
        // Use testId from dto if present, or first one from testIds
        let testId = dto.testId?.toString() || (testIds.length > 0 ? testIds[0] : undefined);
        
        return {
            id: dto.id.toString(),
            titre: dto.titre,
            testIds,
            testId,
            questionCount: dto.questions?.length || 0,
            questions: dto.questions
        };
    }

    getExercices() {
        return this.exercices;
    }

    async getByTestId(testId: string): Promise<Exercice[]> {
        const dtos = await firstValueFrom(this.http.get<ExerciceDTO[]>(`${this.apiUrl}/test/${testId}`));
        return dtos.map(dto => this.mapToExercice(dto));
    }

    getExercicesByTest(testId: string): Exercice[] {
        return this.exercices().filter(ex => ex.testIds.includes(testId));
    }

    async addExercice(exercice: Partial<Exercice> & { testId?: string, testIds?: string[] }): Promise<string> {
        try {
            // Determine test IDs
            let ids: number[] = [];
            if (Array.isArray(exercice.testIds)) {
                ids = exercice.testIds.map(id => parseInt(id));
            } else if (exercice.testId) {
                ids = [parseInt(exercice.testId)];
            }

            const dto: Partial<ExerciceDTO> = {
                titre: exercice.titre,
                testIds: ids
            };
            
            const saved = await firstValueFrom(this.http.post<ExerciceDTO>(this.apiUrl, dto));
            const mapped = this.mapToExercice(saved);
            this.exercices.update((exs) => [mapped, ...exs]);
            return mapped.id;
        } catch (err) {
            console.error('Error adding exercice', err);
            throw err;
        }
    }

    async updateExercice(updatedEx: Exercice) {
        let ids: number[] = [];
        if (Array.isArray(updatedEx.testIds)) {
            ids = updatedEx.testIds.map(id => parseInt(id));
        } else if (updatedEx.testId) {
            ids = [parseInt(updatedEx.testId)];
        }

        const dto: Partial<ExerciceDTO> = {
            titre: updatedEx.titre,
            testIds: ids
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

    async deleteMultiple(ids: string[]) {
        const numericIds = ids.map(id => parseInt(id));
        try {
            await firstValueFrom(this.http.request('delete', `${this.apiUrl}/delete-multiple`, {
                body: numericIds,
                responseType: 'text'
            }));
            this.exercices.update((exs) => exs.filter(ex => !ids.includes(ex.id)));
        } catch (err) {
            console.error('Error deleting multiple exercices', err);
            throw err;
        }
    }
}
