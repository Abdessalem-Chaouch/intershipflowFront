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
}

@Injectable({
    providedIn: 'root'
})
export class DocumentStageService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/documents-stage';
    
    private documents = signal<DocumentStage[]>([]);

    constructor() {
        this.fetchDocuments();
    }

    getDocuments() {
        return this.documents;
    }

    fetchDocuments() {
        this.http.get<DocumentStage[]>(this.apiUrl).subscribe({
            next: (data) => this.documents.set(data),
            error: (err) => console.error('Error fetching documents', err)
        });
    }

    async getById(id: number): Promise<DocumentStage> {
        return await firstValueFrom(this.http.get<DocumentStage>(`${this.apiUrl}/${id}`));
    }

    async createDocument(type: TypeDocument, file: File): Promise<DocumentStage> {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('file', file);

        const saved = await firstValueFrom(this.http.post<DocumentStage>(this.apiUrl, formData));
        this.fetchDocuments();
        return saved;
    }

    async updateDocument(id: number, type?: TypeDocument, note?: number, validation?: boolean, remarque?: string, file?: File): Promise<DocumentStage> {
        const formData = new FormData();
        if (type) formData.append('type', type);
        if (note !== undefined && note !== null) formData.append('note', note.toString());
        if (validation !== undefined && validation !== null) formData.append('validation', validation.toString());
        if (remarque) formData.append('remarque', remarque);
        if (file) formData.append('file', file);

        const updated = await firstValueFrom(this.http.put<DocumentStage>(`${this.apiUrl}/${id}`, formData));
        this.fetchDocuments();
        return updated;
    }

    async toggleValidation(id: number): Promise<DocumentStage> {
        const updated = await firstValueFrom(this.http.put<DocumentStage>(`${this.apiUrl}/${id}/validation`, {}));
        this.fetchDocuments();
        return updated;
    }

    async updateNote(id: number, note: number): Promise<DocumentStage> {
        // Use params for @RequestParam Double note
        const updated = await firstValueFrom(this.http.put<DocumentStage>(`${this.apiUrl}/${id}/note`, null, {
            params: { note: note.toString() }
        }));
        this.fetchDocuments();
        return updated;
    }

    async addRemarque(id: number, remarque: string): Promise<DocumentStage> {
        const updated = await firstValueFrom(this.http.put<DocumentStage>(`${this.apiUrl}/${id}/remarque`, null, {
            params: { remarque }
        }));
        this.fetchDocuments();
        return updated;
    }

    downloadFile(nodeId: string, fileName: string) {
        const url = `${this.apiUrl}/download/${nodeId}?fileName=${encodeURIComponent(fileName)}`;
        window.open(url, '_blank');
    }

    async deleteDocument(id: number): Promise<void> {
        await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }));
        this.fetchDocuments();
    }
}
