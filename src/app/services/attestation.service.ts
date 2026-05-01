import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Attestation {
    id: number;
    stageId: number;
    utilisateurId: string;
    username: string;
    nomOffre: string;
    dateDebut: string;
    dateFin: string;
    dateGeneration: string;
    filePath: string; // nodeId Alfresco
}

@Injectable({
    providedIn: 'root'
})
export class AttestationService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/attestation';

    async getAll(): Promise<Attestation[]> {
        return await firstValueFrom(this.http.get<Attestation[]>(this.apiUrl));
    }

    async getMyAttestations(): Promise<Attestation[]> {
        return await firstValueFrom(this.http.get<Attestation[]>(`${this.apiUrl}/mes-attestations`));
    }

    async getByStage(stageId: number): Promise<Attestation[]> {
        return await firstValueFrom(this.http.get<Attestation[]>(`${this.apiUrl}/stage/${stageId}`));
    }

    async downloadFile(nodeId: string, fileName: string) {
        // We use the same download endpoint from DocumentStageController
        const url = `http://localhost:8081/documents-stage/download/${nodeId}?fileName=${encodeURIComponent(fileName)}`;
        try {
            const blob = await firstValueFrom(this.http.get(url, { responseType: 'blob' }));
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error('Error downloading attestation', err);
        }
    }
}
