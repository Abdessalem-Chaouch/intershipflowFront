import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface TechnicalTest {
    id: string;
    titre: string;
    description: string;
    dureeMinutes: number;
    offerIds: string[];
    exerciceCount?: number;
}

export interface TestResponseDTO {
    id: number;
    titre: string;
    description: string;
    dureeMinutes: number;
    offreIds: number[];
    exercices?: { id: number; titre: string }[];
}

export interface TestRequestDTO {
    titre: string;
    description: string;
    dureeMinutes: number;
    offreIds: number[];
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
            offerIds: dto.offreIds?.map(id => id.toString()) || [],
            exerciceCount: dto.exercices?.length || 0
        };
    }

    getTests() {
        return this.tests;
    }

    async getTestById(id: string): Promise<TechnicalTest> {
        try {
            const dto = await firstValueFrom(this.http.get<TestResponseDTO>(`${this.apiUrl}/${id}`));
            return this.mapToTechnicalTest(dto);
        } catch (err) {
            console.error('Error fetching test by id', err);
            throw err;
        }
    }

    async getTestsByOffer(offerId: string): Promise<TechnicalTest[]> {
        try {
            const dtos = await firstValueFrom(this.http.get<TestResponseDTO[]>(`${this.apiUrl}/offre/${offerId}`));
            return dtos.map(dto => this.mapToTechnicalTest(dto));
        } catch (err) {
            console.error('Error fetching tests by offer', err);
            throw err;
        }
    }

    async addTest(test: Omit<TechnicalTest, 'id' | 'offerIds'> & { offerIds: string[] }): Promise<TechnicalTest> {
        const dto: TestRequestDTO = {
            titre: test.titre,
            description: test.description,
            dureeMinutes: test.dureeMinutes,
            offreIds: test.offerIds.map(id => parseInt(id))
        };

        try {
            const saved = await firstValueFrom(this.http.post<TestResponseDTO>(this.apiUrl, dto));
            const mapped = this.mapToTechnicalTest(saved);
            this.tests.update((tests) => [mapped, ...tests]);
            return mapped;
        } catch (err) {
            console.error('Error adding test', err);
            throw err;
        }
    }

    async updateTest(updatedTest: TechnicalTest): Promise<TechnicalTest> {
        // Optimistic update
        this.tests.update((tests) => tests.map(t => t.id === updatedTest.id ? { ...updatedTest } : t));

        const dto: TestRequestDTO = {
            titre: updatedTest.titre,
            description: updatedTest.description,
            dureeMinutes: updatedTest.dureeMinutes,
            offreIds: updatedTest.offerIds.map(id => parseInt(id))
        };

        try {
            const saved = await firstValueFrom(this.http.put<TestResponseDTO>(`${this.apiUrl}/${updatedTest.id}`, dto));
            const mapped = this.mapToTechnicalTest(saved);
            
            // Sync with backend response
            this.tests.update((tests) => tests.map(t => t.id === mapped.id ? mapped : t));
            return mapped;
        } catch (err) {
            console.error('Error updating test', err);
            this.fetchTests(); // Rollback if needed
            throw err;
        }
    }

    async deleteTest(id: string): Promise<void> {
        try {
            await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }));
            this.tests.update((tests) => tests.filter(t => t.id !== id));
        } catch (err) {
            console.error('Error deleting test', err);
            throw err;
        }
    }

    async deleteMultipleTests(ids: string[]): Promise<void> {
        const numericIds = ids.map(id => parseInt(id));
        try {
            await firstValueFrom(this.http.request('delete', `${this.apiUrl}/delete-multiple`, {
                body: numericIds,
                responseType: 'text'
            }));
            this.tests.update((tests) => tests.filter(t => !ids.includes(t.id)));
        } catch (err) {
            console.error('Error deleting multiple tests', err);
            throw err;
        }
    }
}

