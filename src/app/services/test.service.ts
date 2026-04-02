import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface TechnicalTest {
    id: string;
    titre: string;
    description: string;
    dureeMinutes: number;
    offerId: string;
    exerciceCount?: number;
}

export interface TestResponseDTO {
    id: number;
    titre: string;
    description: string;
    dureeMinutes: number;
    offreId: number;
    exercices?: { id: number; titre: string }[];
}

export interface TestRequestDTO {
    titre: string;
    description: string;
    dureeMinutes: number;
    offreId: number;
}

@Injectable({
    providedIn: 'root'
})
export class TestService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/api/tests';
    private tests = signal<TechnicalTest[]>([]);

    constructor() {
        this.fetchTests();
    }

    fetchTests() {
        this.http.get<TestResponseDTO[]>(this.apiUrl).subscribe({
            next: (dtos) => {
                const mapped = dtos.map(dto => this.mapToTechnicalTest(dto));
                this.tests.set(mapped);
            },
            error: (err) => console.error('Error fetching tests', err)
        });
    }

    private mapToTechnicalTest(dto: TestResponseDTO): TechnicalTest {
        return {
            id: dto.id.toString(),
            titre: dto.titre,
            description: dto.description,
            dureeMinutes: dto.dureeMinutes,
            offerId: dto.offreId.toString(),
            exerciceCount: dto.exercices?.length || 0
        };
    }

    getTests() {
        return this.tests;
    }

    async addTest(test: Omit<TechnicalTest, 'id'>): Promise<string> {
        const dto: TestRequestDTO = {
            titre: test.titre,
            description: test.description,
            dureeMinutes: test.dureeMinutes,
            offreId: parseInt(test.offerId)
        };

        try {
            const saved = await firstValueFrom(this.http.post<TestResponseDTO>(this.apiUrl, dto));
            const mapped = this.mapToTechnicalTest(saved);
            this.tests.update((tests) => [mapped, ...tests]);
            return mapped.id;
        } catch (err) {
            console.error('Error adding test', err);
            throw err;
        }
    }

    async updateTest(updatedTest: TechnicalTest) {
        const dto: TestRequestDTO = {
            titre: updatedTest.titre,
            description: updatedTest.description,
            dureeMinutes: updatedTest.dureeMinutes,
            offreId: parseInt(updatedTest.offerId)
        };

        try {
            const saved = await firstValueFrom(this.http.put<TestResponseDTO>(`${this.apiUrl}/${updatedTest.id}`, dto));
            const mapped = this.mapToTechnicalTest(saved);
            this.tests.update((tests) => tests.map(t => t.id === mapped.id ? mapped : t));
        } catch (err) {
            console.error('Error updating test', err);
            throw err;
        }
    }

    async deleteTest(id: string) {
        try {
            await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }));
            this.tests.update((tests) => tests.filter(t => t.id !== id));
        } catch (err) {
            console.error('Error deleting test', err);
            throw err;
        }
    }

    getTestsByOffer(offerId: string): TechnicalTest[] {
        return this.tests().filter(t => t.offerId === offerId);
    }
}
