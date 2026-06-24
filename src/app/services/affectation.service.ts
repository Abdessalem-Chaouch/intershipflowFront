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

    /** PUT /affectations/{stageId}/encadrant/{newEncadrantId} */
    async updateAffectation(stageId: number, newEncadrantId: string): Promise<string> {
        return firstValueFrom(
            this.http.put(`${this.apiUrl}/${stageId}/encadrant/${newEncadrantId}`, null, { responseType: 'text' })
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

    async getMyStagiaires(): Promise<StagiaireDetailsDTO[]> {
        return firstValueFrom(
            this.http.get<StagiaireDetailsDTO[]>(`${this.apiUrl}/MesStagiaires`)
        );
    }

    async getMyEncadrant(): Promise<EncadrantDTO | null> {
        try {
            return await firstValueFrom(
                this.http.get<EncadrantDTO>(`${this.apiUrl}/MonEncadrant`)
            );
        } catch {
            return null;
        }
    }
}

export interface EncadrantDTO {
    id?: string;
    encadrantId?: string;
    encadrantNom?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
}

export interface StagiaireDetailsDTO {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    photoUrl?: string;
    cin?: string;
    phone?: string;
    address?: string;
    stageId?: number;
    candidatureId: number;
    offreStageId: number;
    titreOffre: string;
    numeroStage: number;
    etat: string;
    dateDebut: string;
    dateFin: string;
    documentsValides: boolean;
    affecte: boolean;
    encadrantNom: string;
}
