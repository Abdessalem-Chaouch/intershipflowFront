import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// Matches TestReponseRequestDTO
export interface TestReponseRequest {
    questionId: number;
    reponsesDonnees: string[];
}

// Matches TestAttemptRequestDto
export interface TestAttemptRequest {
    candidatureId: number;
    testId: number;
    reponses: TestReponseRequest[];
}

// Matches TestReponseResponseDTO
export interface TestReponseResponse {
    id: number;
    questionId: number;
    questionText: string;
    propositions: string[];
    bonnesReponses: string[];
    reponsesDonnees: string[];
    correcte: boolean;
    exerciceTitre?: string;
}

// Matches TestAttemptResponseDTO
export interface TestAttemptResponse {
    id: number;
    candidatureId: number;
    testId: number;
    score: number;
    passed: boolean;
    datePassage: string;
    reponses: TestReponseResponse[];
}

@Injectable({
    providedIn: 'root'
})
export class TestAttemptService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/attempts';

    createAttempt(attempt: TestAttemptRequest): Promise<TestAttemptResponse> {
        return firstValueFrom(this.http.post<TestAttemptResponse>(this.apiUrl, attempt));
    }

    getAllAttempts(): Promise<TestAttemptResponse[]> {
        return firstValueFrom(this.http.get<TestAttemptResponse[]>(this.apiUrl));
    }

    getAttemptById(id: number): Promise<TestAttemptResponse> {
        return firstValueFrom(this.http.get<TestAttemptResponse>(`${this.apiUrl}/${id}`));
    }

    deleteAttempt(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    }

    getByCandidature(candidatureId: number): Promise<TestAttemptResponse[]> {
        return firstValueFrom(this.http.get<TestAttemptResponse[]>(`${this.apiUrl}/candidature/${candidatureId}`));
    }

    getByTest(testId: number): Promise<TestAttemptResponse[]> {
        return firstValueFrom(this.http.get<TestAttemptResponse[]>(`${this.apiUrl}/test/${testId}`));
    }
}
