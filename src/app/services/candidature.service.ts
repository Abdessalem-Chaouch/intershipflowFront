import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface CandidatureResponseDto {
    id: number;
    nom: string;
    prenom: string;
    cvNodeId: string;
    lettreMotivationNodeId: string;
    etat: string;
    utilisateurId: number;
    approvedByAI: boolean;
    scoreAI: number;
    offreStageId: number;
}

@Injectable({
    providedIn: 'root'
})
export class CandidatureService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/candidatures';
    private _candidatures = signal<CandidatureResponseDto[]>([]);

    constructor() {
        this.fetchAll();
    }

    async fetchAll() {
        try {
            const data = await firstValueFrom(this.http.get<CandidatureResponseDto[]>(`${this.apiUrl}/all`));
            const arrayData = Array.isArray(data) ? data : [];
            this._candidatures.set(arrayData);
            return arrayData;
        } catch (err) {
            console.error('Error fetching candidatures', err);
            return [];
        }
    }

    getCandidaturesSignal() {
        return this._candidatures;
    }

    async create(offreStageId: number, nom: string, prenom: string, cv: File, lettre: File) {
        const formData = new FormData();
        formData.append('offreStageId', offreStageId.toString());
        formData.append('nom', nom);
        formData.append('prenom', prenom);
        formData.append('cv', cv);
        formData.append('lettre', lettre);

        const res = await firstValueFrom(this.http.post<CandidatureResponseDto>(`${this.apiUrl}/create`, formData));
        await this.fetchAll();
        return res;
    }

    async update(id: number, nom: string, prenom: string, cv?: File, lettre?: File) {
        const formData = new FormData();
        formData.append('nom', nom);
        formData.append('prenom', prenom);
        if (cv) formData.append('cv', cv);
        if (lettre) formData.append('lettre', lettre);

        const res = await firstValueFrom(this.http.put<CandidatureResponseDto>(`${this.apiUrl}/update/${id}`, formData));
        await this.fetchAll();
        return res;
    }

    async delete(id: number) {
        await firstValueFrom(this.http.delete(`${this.apiUrl}/delete/${id}`));
        await this.fetchAll();
    }

    async accepter(id: number) {
        const res = await firstValueFrom(this.http.put<CandidatureResponseDto>(`${this.apiUrl}/${id}/accepter`, {}));
        await this.fetchAll();
        return res;
    }

    async refuser(id: number) {
        const res = await firstValueFrom(this.http.put<CandidatureResponseDto>(`${this.apiUrl}/${id}/refuser`, {}));
        await this.fetchAll();
        return res;
    }

    async mettreEnAttente(id: number) {
        const res = await firstValueFrom(this.http.put<CandidatureResponseDto>(`${this.apiUrl}/${id}/attente`, {}));
        await this.fetchAll();
        return res;
    }

    async getById(id: number) {
        return firstValueFrom(this.http.get<CandidatureResponseDto>(`${this.apiUrl}/${id}`));
    }
}
