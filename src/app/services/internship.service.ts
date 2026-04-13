import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface InternshipApplication {
    id: string;
    offerTitle: string;
    firstName: string;
    lastName: string;
    cvName: string;
    cvNodeId?: string;
    letterName: string;
    lettreNodeId?: string;
    status: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
    date: Date;
    iaScore?: number;
    iaApproved?: boolean;
    encadrantId?: string;
    utilisateurId?: string;
}

export interface InternshipOffer {
    id: string;
    title: string;
    badge: string;
    desc: string;
    techs: string[];
    highlight: boolean;
    cta: string;
    details?: string;
    duration?: string;
    location?: string;
    dateDebut?: string | Date;
    dateFin?: string | Date;
    competencesRequises?: string;
    testCount?: number;
    typeSelection?: string;
    selectedTestId?: string;
    candidateCount?: number;
}

export interface OffreStageDTO {
    id?: number;
    titre: string;
    description: string;
    competencesRequises: string;
    localisation: string;
    dateDebut: string;
    dateFin: string;
    nombreCandidatures: number;
    nombreTests: number;
    typeSelection?: string;
    selectedTestId?: number;
    selectedTestTitre?: string;
}

@Injectable({
    providedIn: 'root'
})
export class InternshipService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/api/offres';
    private applications = signal<InternshipApplication[]>([]);
    private offers = signal<InternshipOffer[]>([]);

    constructor() {
        this.fetchOffers();
        // Mock initial applications
        this.applications.set([
            {
                id: '1',
                offerTitle: 'Développeur Web',
                firstName: 'Ahmed',
                lastName: 'Ben Ali',
                cvName: 'cv_ahmed.pdf',
                letterName: 'lettre_ahmed.pdf',
                status: 'EN_ATTENTE',
                date: new Date(),
                iaScore: 85,
                iaApproved: true
            },
            {
                id: '2',
                offerTitle: 'UI/UX Design',
                firstName: 'Sarra',
                lastName: 'Karray',
                cvName: 'cv_sarra.pdf',
                letterName: 'lettre_sarra.pdf',
                status: 'ACCEPTEE',
                date: new Date(),
                iaScore: 92,
                iaApproved: true
            },
            {
                id: '3',
                offerTitle: 'Data Science',
                firstName: 'Firas',
                lastName: 'Ghorbel',
                cvName: 'cv_firas.pdf',
                letterName: 'lettre_firas.pdf',
                status: 'REFUSEE',
                date: new Date(),
                iaScore: 45,
                iaApproved: false
            }
        ]);
    }

    fetchOffers() {
        this.http.get<OffreStageDTO[]>(this.apiUrl).subscribe({
            next: (dtos) => {
                const mappedOffers = dtos.map(dto => this.mapToInternshipOffer(dto));
                this.offers.set(mappedOffers);
            },
            error: (err) => console.error('Error fetching offers', err)
        });
    }

    private mapToInternshipOffer(dto: OffreStageDTO): InternshipOffer {
        return {
            id: dto.id?.toString() || '',
            title: dto.titre,
            desc: dto.description,
            details: dto.description,
            location: dto.localisation,
            competencesRequises: dto.competencesRequises,
            dateDebut: dto.dateDebut,
            dateFin: dto.dateFin,
            testCount: dto.nombreTests,
            candidateCount: dto.nombreCandidatures,
            typeSelection: dto.typeSelection,
            selectedTestId: dto.selectedTestId?.toString(),
            badge: 'Ouvert',
            techs: (dto.competencesRequises || '').split(',').map(s => s.trim()).filter(s => s),
            highlight: false,
            cta: 'Postuler'
        };
    }

    private mapToDTO(offer: Partial<InternshipOffer>): OffreStageDTO {
        return {
            id: offer.id ? parseInt(offer.id) : undefined,
            titre: offer.title || '',
            description: offer.details || offer.desc || '',
            competencesRequises: offer.competencesRequises || (offer.techs || []).join(', '),
            localisation: offer.location || '',
            dateDebut: offer.dateDebut ? (typeof offer.dateDebut === 'string' ? offer.dateDebut : offer.dateDebut.toISOString().split('T')[0]) : '',
            dateFin: offer.dateFin ? (typeof offer.dateFin === 'string' ? offer.dateFin : offer.dateFin.toISOString().split('T')[0]) : '',
            nombreCandidatures: offer.candidateCount || 0,
            nombreTests: offer.testCount || 0,
            typeSelection: offer.typeSelection,
            selectedTestId: offer.selectedTestId ? parseInt(offer.selectedTestId) : undefined
        };
    }

    getApplications() {
        return this.applications;
    }

    getOffers() {
        return this.offers;
    }

    async getOfferById(id: string): Promise<InternshipOffer> {
        try {
            const dto = await firstValueFrom(this.http.get<OffreStageDTO>(`${this.apiUrl}/${id}`));
            return this.mapToInternshipOffer(dto);
        } catch (err) {
            console.error('Error fetching offer by id', err);
            throw err;
        }
    }

    apply(application: Omit<InternshipApplication, 'id' | 'status' | 'date'>) {
        const newApp: InternshipApplication = {
            ...application,
            id: Math.floor(Math.random() * 1000).toString(),
            status: 'EN_ATTENTE',
            date: new Date()
        };
        this.applications.update((apps) => [newApp, ...apps]);
    }

    async addOffer(offer: Omit<InternshipOffer, 'id'>) {
        const dto = this.mapToDTO(offer);
        try {
            const savedDto = await firstValueFrom(this.http.post<OffreStageDTO>(this.apiUrl, dto));
            const newOffer = this.mapToInternshipOffer(savedDto);
            this.offers.update((offers) => [newOffer, ...offers]);
            return newOffer;
        } catch (err) {
            console.error('Error adding offer', err);
            throw err;
        }
    }

    async updateOffer(updatedOffer: InternshipOffer) {
        // Optimistic update: update the signal immediately so the UI reflects changes instantly
        this.offers.update((offers) => offers.map(o => o.id === updatedOffer.id ? { ...updatedOffer } : o));

        const dto = this.mapToDTO(updatedOffer);
        try {
            const savedDto = await firstValueFrom(this.http.put<OffreStageDTO>(`${this.apiUrl}/${dto.id}`, dto));
            const mapped = this.mapToInternshipOffer(savedDto);
            
            // Sync with server response to ensure we have the correct server-side state
            this.offers.update((offers) => offers.map(o => o.id === mapped.id ? mapped : o));
        } catch (err) {
            console.error('Error updating offer', err);
            // Rollback by fetching from server if the update fails
            this.fetchOffers();
            throw err;
        }
    }

    async deleteOffer(id: string) {
        try {
            await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }));
            this.offers.update((offers) => offers.filter(o => o.id !== id));
        } catch (err) {
            console.error('Error deleting offer', err);
            throw err;
        }
    }

    async getRandomTest(id: string): Promise<any> {
        try {
            return await firstValueFrom(this.http.get<any>(`${this.apiUrl}/${id}/test-random`));
        } catch (err) {
            console.error('Error selecting random test', err);
            throw err;
        }
    }

    async chooseTest(offreId: string, testId: string): Promise<any> {
        try {
            return await firstValueFrom(this.http.post<any>(`${this.apiUrl}/${offreId}/choose-test/${testId}`, {}));
        } catch (err) {
            console.error('Error choosing manual test', err);
            throw err;
        }
    }
}
