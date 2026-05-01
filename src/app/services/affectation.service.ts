import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/** Matches backend AffectationRequest DTO */
export interface AffectationRequest {
    stageId: number;
    encadrantId: string;
}

export interface StagiaireAffecteDTO {
    stagiaireId: string;
    stagiaireNom: string;
}

export interface EncadrantDTO {
    encadrantId: string;
    encadrantNom: string;
}

@Injectable({
    providedIn: 'root'
})
export class AffectationService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/affectations';

    /** POST /affectations  — body: { stageId, encadrantId } */
    async affecter(request: AffectationRequest): Promise<string> {
        return firstValueFrom(
            this.http.post(`${this.apiUrl}`, request, { responseType: 'text' })
        );
    }

    /** DELETE /affectations/{stageId} */
    async desaffecter(stageId: number): Promise<string> {
        return firstValueFrom(
            this.http.delete(`${this.apiUrl}/${stageId}`, { responseType: 'text' })
        );
    }

    async getStagiairesByEncadrant(encadrantId: string): Promise<StagiaireAffecteDTO[]> {
        return firstValueFrom(
            this.http.get<StagiaireAffecteDTO[]>(`${this.apiUrl}/encadrant/${encadrantId}/stagiaires`)
        );
    }

    /** Returns null if the stagiaire has no encadrant (instead of throwing) */
    async getEncadrant(stagiaireId: string): Promise<EncadrantDTO | null> {
        try {
            return await firstValueFrom(
                this.http.get<EncadrantDTO>(`${this.apiUrl}/stagiaire/${stagiaireId}/encadrant`)
            );
        } catch {
            return null;
        }
    }
}
