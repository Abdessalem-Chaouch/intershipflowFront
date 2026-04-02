import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface InternshipApplication {
    id: string;
    offerTitle: string;
    firstName: string;
    lastName: string;
    cvName: string;
    letterName: string;
    status: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
    date: Date;
    iaScore?: number;
    iaApproved?: boolean;
    encadrantId?: string;
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
    testSelectionMode?: 'UN_CHOIX' | 'ALEATOIRE';
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
            nombreTests: offer.testCount || 0
        };
    }

    getApplications() {
        return this.applications;
    }

    getOffers() {
        return this.offers;
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
        const dto = this.mapToDTO(updatedOffer);
        try {
            const savedDto = await firstValueFrom(this.http.put<OffreStageDTO>(`${this.apiUrl}/${dto.id}`, dto));
            const mapped = this.mapToInternshipOffer(savedDto);
            this.offers.update((offers) => offers.map(o => o.id === mapped.id ? mapped : o));
        } catch (err) {
            console.error('Error updating offer', err);
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
}
