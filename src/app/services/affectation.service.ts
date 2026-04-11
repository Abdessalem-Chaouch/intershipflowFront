import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AffectationRequest {
    stagiaireId: string;
    encadrantId: string;
}

export interface StagiaireAffecteDTO {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class AffectationService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/affectations';

    async affecter(request: AffectationRequest): Promise<string> {
        return firstValueFrom(this.http.post(`${this.apiUrl}`, request, { responseType: 'text' }));
    }

    async desaffecter(stagiaireId: string, encadrantId: string): Promise<string> {
        const params = new HttpParams()
            .set('stagiaireId', stagiaireId)
            .set('encadrantId', encadrantId);
        return firstValueFrom(this.http.delete(`${this.apiUrl}`, { params, responseType: 'text' }));
    }

    async getStagiairesByEncadrant(encadrantId: string): Promise<StagiaireAffecteDTO[]> {
        return firstValueFrom(this.http.get<StagiaireAffecteDTO[]>(`${this.apiUrl}/encadrant/${encadrantId}/stagiaires`));
    }
}
