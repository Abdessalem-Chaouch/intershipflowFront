import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type TypeDocument = 'PRESENTATION' | 'CONVENTION' | 'RAPPORT';

export interface DocumentStage {
    id: number;
    type: TypeDocument;
    alfrescoNodeId?: string;
    fileName?: string;
    noteEncadrant?: number;
    remarqueEncadrant?: string;
    validationEncadrant?: boolean;
    idStage?: number;
    userId?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    titreOffre?: string;
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class DocumentStageService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/documents-stage';
    
    private documents = signal<DocumentStage[]>([]);

    constructor() {}

    getDocuments() {
        return this.documents;
    }

    fetchDocuments() {
        this.http.get<ApiResponse<DocumentStage[]>>(this.apiUrl).subscribe({
            next: (response) => this.documents.set(response.data),
            error: (err) => console.error('Error fetching documents', err)
        });
    }

    fetchDocumentsEncadrant() {
        this.http.get<any>(`${this.apiUrl}/encadrant`).subscribe({
            next: (response) => {
                // Handle both wrapped ApiResponse and direct array response
                const data = response && response.data !== undefined ? response.data : response;
                this.documents.set(Array.isArray(data) ? data : []);
            },
            error: (err) => console.error('Error fetching encadrant documents', err)
        });
    }

    async getById(id: number): Promise<DocumentStage> {
        const response = await firstValueFrom(this.http.get<ApiResponse<DocumentStage>>(`${this.apiUrl}/${id}`));
        return response.data;
    }

    async createDocument(type: TypeDocument, file: File): Promise<DocumentStage> {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('file', file);

        const response = await firstValueFrom(this.http.post<ApiResponse<DocumentStage>>(this.apiUrl, formData));
        this.fetchDocuments();
        return response.data;
    }

    async updateDocument(id: number, type?: TypeDocument, note?: number, validation?: boolean, remarque?: string, file?: File): Promise<DocumentStage> {
        const formData = new FormData();
        if (type) formData.append('type', type);
        if (note !== undefined && note !== null) formData.append('note', note.toString());
        if (validation !== undefined && validation !== null) formData.append('validation', validation.toString());
        if (remarque) formData.append('remarque', remarque);
        if (file) formData.append('file', file);

        const response = await firstValueFrom(this.http.put<ApiResponse<DocumentStage>>(`${this.apiUrl}/${id}`, formData));
        this.fetchDocuments();
        return response.data;
    }

    async getMesDocuments(): Promise<DocumentStage[]> {
        const response = await firstValueFrom(this.http.get<ApiResponse<DocumentStage[]>>(`${this.apiUrl}/mes-documents`));
        return response.data;
    }

    async getDocumentsByStage(stageId: number): Promise<DocumentStage[]> {
        const response = await firstValueFrom(this.http.get<ApiResponse<DocumentStage[]>>(`${this.apiUrl}/stage/${stageId}`));
        return response.data;
    }

    async validerDocument(id: number): Promise<DocumentStage> {
        const response = await firstValueFrom(this.http.put<ApiResponse<DocumentStage>>(`${this.apiUrl}/${id}/validation`, {}));
        return response.data;
    }

    async invaliderDocument(id: number): Promise<DocumentStage> {
        const response = await firstValueFrom(this.http.put<ApiResponse<DocumentStage>>(`${this.apiUrl}/${id}/invalidation`, {}));
        return response.data;
    }

    async updateNote(id: number, note: number): Promise<DocumentStage> {
        const response = await firstValueFrom(this.http.put<ApiResponse<DocumentStage>>(`${this.apiUrl}/${id}/note`, null, {
            params: { note: note.toString() }
        }));
        return response.data;
    }

    async addRemarque(id: number, remarque: string): Promise<DocumentStage> {
        const response = await firstValueFrom(this.http.put<ApiResponse<DocumentStage>>(`${this.apiUrl}/${id}/remarque`, null, {
            params: { remarque }
        }));
        return response.data;
    }

    async downloadFile(nodeId: string, fileName: string) {
        const url = `${this.apiUrl}/download/${nodeId}?fileName=${encodeURIComponent(fileName)}`;
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
            console.error('Error downloading file', err);
            // Fallback or error notification could be added here
        }
    }

    async deleteDocument(id: number): Promise<void> {
        await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }));
        this.fetchDocuments();
    }
}
