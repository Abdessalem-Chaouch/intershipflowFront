import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export enum EtatStage {
    ACCEPTE = 'ACCEPTE',
    EN_COURS = 'EN_COURS',
    ATT_VALIDATION_ENCADRANT = 'ATT_VALIDATION_ENCADRANT',
    VALIDE = 'VALIDE',
    NON_VALIDE = 'NON_VALIDE',
    ANNULE = 'ANNULE'
}

export interface Stage {
    id: number;
    utilisateurId: string;
    candidatureId: number;
    offreStageId: number;
    titreOffre: string;
    numeroStage: number;
    etat: EtatStage;
    dateDebut: string;
    dateFin: string;
    documentsValides: boolean;
    encadrantId: string;
    encadrantFirstName?: string;
    encadrantLastName?: string;
    encadrantUsername?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    prenom?: string;
    nom?: string;
    encadrantNom?: string;
}

@Injectable({
    providedIn: 'root'
})
export class StageService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/api/stages';

    activeStage = signal<Stage | null>(null);

    constructor() { }

    async getAllStages(): Promise<Stage[]> {
        return await firstValueFrom(this.http.get<Stage[]>(`${this.apiUrl}/all`));
    }

    async getMesStages(): Promise<Stage[]> {
        return await firstValueFrom(this.http.get<Stage[]>(`${this.apiUrl}/mes-stages`));
    }

    async getStagesEncadrant(): Promise<Stage[]> {
        return await firstValueFrom(this.http.get<Stage[]>(`${this.apiUrl}/encadrant`));
    }

    async getStageActif(): Promise<Stage | null> {
        try {
            const stage = await firstValueFrom(this.http.get<Stage>(`${this.apiUrl}/actif`));
            this.activeStage.set(stage);
            return stage;
        } catch (err) {
            this.activeStage.set(null);
            return null;
        }
    }

    async getHistoriqueStages(): Promise<Stage[]> {
        return await firstValueFrom(this.http.get<Stage[]>(`${this.apiUrl}/historique`));
    }

    async getNumeroStageActif(): Promise<any> {
        return await firstValueFrom(this.http.get<any>(`${this.apiUrl}/numero`));
    }

    async validerStage(id: number): Promise<Stage> {
        return await firstValueFrom(this.http.put<Stage>(`${this.apiUrl}/${id}/valider`, {}));
    }

    async invaliderStage(id: number, raison?: string): Promise<Stage> {
        return await firstValueFrom(this.http.put<Stage>(`${this.apiUrl}/${id}/invalider`, null, {
            params: raison ? { raison } : {}
        }));
    }

    async modifierDates(id: number, dateDebut: string, dateFin: string): Promise<Stage> {
        return await firstValueFrom(this.http.put<Stage>(`${this.apiUrl}/${id}/dates`, { dateDebut, dateFin }));
    }

    async updateEtatStage(id: number, etat: EtatStage): Promise<Stage> {
        const stage = await firstValueFrom(this.http.put<Stage>(`${this.apiUrl}/${id}/etat`, null, {
            params: { etat }
        }));
        this.activeStage.set(stage);
        return stage;
    }

    async getStagesByUtilisateur(userId: string): Promise<Stage[]> {
        return await firstValueFrom(this.http.get<Stage[]>(`${this.apiUrl}/stagiaire/${userId}`));
    }

    async getAllStagesEnCours(): Promise<Stage[]> {
        return await firstValueFrom(this.http.get<Stage[]>(`${this.apiUrl}/en-cours`));
    }

    async creerStageDirect(payload: {
        userId: string;
        dateDebut: string;
        dateFin: string;
        encadrantId?: string;
        offreStageId?: number;
    }): Promise<any> {
        const body: any = {
            userId: payload.userId,
            dateDebut: payload.dateDebut,
            dateFin: payload.dateFin
        };
        if (payload.encadrantId) body['encadrantId'] = payload.encadrantId;
        if (payload.offreStageId) body['offreStageId'] = payload.offreStageId.toString();
        return await firstValueFrom(this.http.post<any>(`${this.apiUrl}/creer-direct`, body));
    }
}
