import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface PredictionResponse {
    prediction: number | null;
    status?: string;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PredictionService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/api/prediction';

    async predict(competences: string): Promise<PredictionResponse> {
        try {
            const res = await firstValueFrom(
                this.http.post<PredictionResponse>(`${this.apiUrl}/predict`, { competences })
            );
            return res ?? { prediction: null, status: 'OFFLINE' };
        } catch (err) {
            console.error('Error fetching prediction from backend PredictionService:', err);
            return { prediction: null, status: 'OFFLINE' };
        }
    }
}
