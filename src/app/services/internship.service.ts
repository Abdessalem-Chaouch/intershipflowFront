import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface InternshipApplication {
    id: string;
    offerTitle: string;
    offerId: string;
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
    raisonRefus?: string;
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
    dureeStage?: number;
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
    dureeStage?: number;
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
    }

    fetchOffers() {
        this.http.get<OffreStageDTO[]>(this.apiUrl).subscribe({
            next: (dtos) => {
                const mappedOffers = dtos.map(dto => this.mapToInternshipOffer(dto));
                this.offers.set(mappedOffers);
            },
            error: (err) => console.error('Error fetching offers', err)
        });
        this.fetchApplications();
    }

    fetchApplications() {
        this.http.get<any[]>('http://localhost:8081/candidatures/candidaturesPostuler').subscribe({
            next: (data) => {
                const mappedApps = data.map(dto => ({
                    id: dto.id.toString(),
                    offerTitle: dto.offreTitre || 'Offre',
                    offerId: dto.offreStageId ? dto.offreStageId.toString() : '',
                    firstName: dto.prenom,
                    lastName: dto.nom,
                    cvName: dto.cvName,
                    letterName: dto.lettreMotivationName,
                    status: dto.etat as any,
                    date: new Date(),
                    iaScore: dto.scoreAI,
                    iaApproved: dto.approvedByAI
                }));
                this.applications.set(mappedApps);
            },
            error: (err) => console.error('Error fetching my applications', err)
        });
    }

    public mapToInternshipOffer(dto: OffreStageDTO): InternshipOffer {
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
            cta: 'Postuler',
            dureeStage: dto.dureeStage
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
            selectedTestId: offer.selectedTestId ? parseInt(offer.selectedTestId) : undefined,
            dureeStage: offer.dureeStage
        };
    }

    public formatDuration(months: number | undefined): string {
        if (months === undefined || months === null) return 'N/A';
        if (months < 12) return `${months} mois`;
        
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        
        let result = `${years} ${years > 1 ? 'ans' : 'an'}`;
        if (remainingMonths > 0) {
            result += ` et ${remainingMonths} mois`;
        }
        return result;
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

    async getRecommendedOffres(): Promise<InternshipOffer[]> {
        try {
            const dtos = await firstValueFrom(this.http.get<OffreStageDTO[]>(`${this.apiUrl}/recommendations`));
            return dtos.map(dto => this.mapToInternshipOffer(dto));
        } catch (err) {
            console.error('Error fetching recommended offers', err);
            throw err;
        }
    }

    async getAppliedOffres(): Promise<InternshipOffer[]> {
        try {
            const dtos = await firstValueFrom(this.http.get<OffreStageDTO[]>(`${this.apiUrl}/applied`));
            return dtos.map(dto => this.mapToInternshipOffer(dto));
        } catch (err) {
            console.error('Error fetching applied offers', err);
            throw err;
        }
    }

    async getOffersWithRecommendations(): Promise<InternshipOffer[]> {
        const allDtos = await firstValueFrom(this.http.get<OffreStageDTO[]>(this.apiUrl));
        const recommended = await this.getRecommendedOffres();
        
        let offers = allDtos.map(dto => {
            const isRec = recommended.some(r => r.id === dto.id?.toString());
            const mapped = this.mapToInternshipOffer(dto);
            return {
                ...mapped,
                highlight: isRec,
                badge: isRec ? 'Recommandé' : mapped.badge
            };
        });

        // Sort: Recommendations first
        return offers.sort((a, b) => (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0));
    }
}
