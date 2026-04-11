import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { InternshipApplication, InternshipService, InternshipOffer } from '../../services/internship.service';
import { User, UserService } from '../../services/user.service';
import { CandidatureService, CandidatureResponseDto } from '../../services/candidature.service';
import { AffectationService } from '../../services/affectation.service';

@Component({
    selector: 'app-application-management',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        TagModule,
        ToolbarModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        ToastModule,
        TooltipModule,
        SelectModule,
        DialogModule
    ],
    providers: [MessageService, UserService, CandidatureService, AffectationService],
    template: `
        <div class="card border-none shadow-sm overflow-hidden bg-slate-50/50">
            <p-toolbar styleClass="bg-white border-b border-slate-100 rounded-none mb-0 px-6 py-4">
                <ng-template #start>
                    <div class="flex flex-col gap-1">
                        <h5 class="m-0 text-2xl font-black text-slate-800 tracking-tight">Candidatures</h5>
                        <p class="text-xs text-slate-400 font-medium uppercase tracking-widest">Gestion du recrutement & IA</p>
                    </div>
                </ng-template>
                <ng-template #end>
                    <p-button label="Exporter" icon="pi pi-download" [outlined]="true" severity="secondary" size="small" (onClick)="dt.exportCSV()" />
                </ng-template>
            </p-toolbar>

            <p-table
                #dt
                [value]="applications()"
                [rows]="10"
                [paginator]="true"
                [globalFilterFields]="['firstName', 'lastName', 'offerTitle', 'status']"
                [tableStyle]="{ 'min-width': '75rem' }"
                [rowHover]="true"
                dataKey="id"
                currentPageReportTemplate="Lignes {first} à {last} de {totalRecords}"
                [showCurrentPageReport]="true"
                [rowsPerPageOptions]="[10, 20, 30]"
                [loading]="loading()"
                styleClass="p-datatable-sm"
            >
                <ng-template #caption>
                    <div class="flex items-center justify-between px-2 pt-2 pb-4">
                        <div class="flex items-center gap-2">
                           <span class="text-sm font-bold text-slate-500 uppercase tracking-tighter bg-slate-100 px-3 py-1 rounded-md">
                                {{applications().length}} Candidature(s) au total
                           </span>
                        </div>
                        <div class="flex items-center gap-3">
                            <p-select 
                                [options]="internshipService.getOffers()()" 
                                [(ngModel)]="selectedOffer" 
                                (onChange)="onOfferFilter(dt, $event)" 
                                placeholder="Toutes les offres" 
                                optionLabel="title" 
                                optionValue="title"
                                [showClear]="true"
                                styleClass="w-64 border-slate-200 shadow-none text-sm rounded-xl" />

                            <p-iconfield>
                                <p-inputicon styleClass="pi pi-search text-slate-400" />
                                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" 
                                    placeholder="Recherche rapide..." 
                                    [autofocus]="false"
                                    class="w-72 border-slate-200 shadow-none text-sm rounded-xl" />
                            </p-iconfield>
                        </div>
                    </div>
                </ng-template>
                <ng-template #header>
                    <tr class="bg-slate-50/50 border-y border-slate-100">
                        <th pSortableColumn="lastName" class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4">Candidat <p-sortIcon field="lastName" /></th>
                        <th pSortableColumn="offerTitle" class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4">Offre <p-sortIcon field="offerTitle" /></th>
                        <th class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4">Documents</th>
                        <th pSortableColumn="iaScore" class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4 text-center">Score IA <p-sortIcon field="iaScore" /></th>
                        <th pSortableColumn="iaApproved" class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4 text-center">IA Approval <p-sortIcon field="iaApproved" /></th>
                        <th pSortableColumn="encadrantId" class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4 text-center">Encadrant <p-sortIcon field="encadrantId" /></th>
                        <th pSortableColumn="status" class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4 text-center">Statut <p-sortIcon field="status" /></th>
                        <th class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4 text-center">Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-app>
                    <tr class="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                        <td class="py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                    {{ app.firstName.charAt(0) }}{{ app.lastName.charAt(0) }}
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-slate-800">{{ app.lastName }} {{ app.firstName }}</span>
                                    <span class="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{{ app.date | date:'dd MMM yyyy' }}</span>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                {{ app.offerTitle }}
                            </div>
                        </td>
                        <td>
                            <div class="flex gap-1">
                                <p-button icon="pi pi-file-pdf" [rounded]="true" [text]="true" severity="info" size="small" [pTooltip]="'Voir CV: ' + app.cvName" tooltipPosition="bottom" />
                                <p-button icon="pi pi-envelope" [rounded]="true" [text]="true" severity="secondary" size="small" [pTooltip]="'Lettre: ' + app.letterName" tooltipPosition="bottom" />
                            </div>
                        </td>
                        <td class="text-center">
                            <div class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border shadow-sm font-black text-xs"
                                [ngStyle]="{'border-color': getScoreColor(app.iaScore), 'color': getScoreColor(app.iaScore)}">
                                {{ app.iaScore || 0 }}%
                            </div>
                        </td>
                        <td class="text-center">
                            <i class="pi" [ngClass]="{'pi-check-circle text-green-500': app.iaApproved, 'pi-times-circle text-slate-300': !app.iaApproved}" style="font-size: 1.2rem"></i>
                        </td>
                        <td class="text-center">
                            <div class="flex flex-col items-center gap-1">
                                <span class="text-xs font-bold text-slate-700 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100" *ngIf="app.encadrantId">
                                    <i class="pi pi-user mr-1 text-[10px]"></i> {{ getSupervisorName(app.encadrantId) }}
                                </span>
                                <p-button *ngIf="app.status === 'ACCEPTEE' && !app.encadrantId" 
                                    label="Affecter" icon="pi pi-plus-circle" [text]="true" size="small" 
                                    styleClass="text-[10px] font-bold text-orange-600 p-0" (onClick)="openAssignDialog(app)" />
                                <span *ngIf="app.status !== 'ACCEPTEE' && !app.encadrantId" class="text-[10px] text-slate-300 italic">Non spécifié</span>
                            </div>
                        </td>
                        <td class="text-center">
                            <p-tag [value]="getStatusLabel(app.status)" [severity]="getSeverity(app.status)" styleClass="text-[10px] font-black uppercase rounded-sm px-2" />
                        </td>
                        <td class="text-center">
                            <div class="flex justify-center items-center gap-1">
                                <p-button icon="pi pi-check" [rounded]="true" [text]="true" severity="success" (onClick)="updateStatus(app, 'ACCEPTEE')" pTooltip="Accepter" tooltipPosition="left" />
                                <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="danger" (onClick)="updateStatus(app, 'REFUSEE')" pTooltip="Refuser" tooltipPosition="left" />
                                <p-button icon="pi pi-clock" [rounded]="true" [text]="true" severity="warn" (onClick)="updateStatus(app, 'EN_ATTENTE')" pTooltip="Mettre en attente" tooltipPosition="left" />
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Dialog d'affectation d'encadrant -->
        <p-dialog [(visible)]="assignmentDialog" [style]="{width: '450px'}" header="Affecter un Encadrant" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4 py-2">
                    <div class="flex flex-col gap-2">
                        <label for="supervisor" class="text-sm font-bold text-slate-700">Choisir l'encadrant</label>
                        <p-select 
                            id="supervisor"
                            [options]="availableSupervisors" 
                            [(ngModel)]="selectedSupervisorId" 
                            optionLabel="fullName" 
                            optionValue="id"
                            placeholder="Sélectionner un encadrant" 
                            appendTo="body"
                            styleClass="w-full border-slate-200">
                        </p-select>
                        <small class="text-slate-400" *ngIf="selectedApp">
                            Affectation pour: <span class="font-bold">{{selectedApp.firstName}} {{selectedApp.lastName}}</span>
                        </small>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <div class="flex justify-end gap-2 p-4 border-t border-slate-50">
                    <p-button label="Annuler" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="assignmentDialog = false" />
                    <p-button label="Confirmer l'affectation" icon="pi pi-check" (onClick)="confirmAssignment()" [disabled]="!selectedSupervisorId" [loading]="loading()" />
                </div>
            </ng-template>
        </p-dialog>

        <p-toast />
    `
})
export class ApplicationManagement implements OnInit {
    applications = signal<InternshipApplication[]>([]);
    offers: InternshipOffer[] = [];
    selectedOffer: string | null = null;

    // Assignment
    assignmentDialog: boolean = false;
    selectedApp: InternshipApplication | null = null;
    availableSupervisors: any[] = [];
    selectedSupervisorId: string | null = null;
    allUsers: User[] = [];

    constructor(
        public internshipService: InternshipService,
        private userService: UserService,
        private candidatureService: CandidatureService,
        private affectationService: AffectationService,
        private messageService: MessageService
    ) {}

    loading = signal<boolean>(false);

    async ngOnInit() {
        this.loading.set(true);
        try {
            // Sequential loading for better stability
            this.allUsers = await this.userService.getUsers();
            
            this.availableSupervisors = this.allUsers
                .filter(u => u.role === 'Encadrant')
                .map(u => ({
                    id: u.id,
                    fullName: `${u.firstName} ${u.lastName}`
                }));
            
            await this.loadApplications();
        } catch (err) {
            console.error('Error in ngOnInit', err);
        } finally {
            this.loading.set(false);
        }
    }

    async loadApplications() {
        try {
            const dtos = await this.candidatureService.fetchAll();
            if (!Array.isArray(dtos)) throw new Error('Data is not an array');
            
            const mapped = dtos.map(dto => this.mapToInternshipApplication(dto));
            this.applications.set(mapped);
        } catch (err) {
            console.error('Load Error Detail:', err);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des candidatures échoué' });
        }
    }

    private mapToInternshipApplication(dto: CandidatureResponseDto): InternshipApplication {
        const currentOffers = this.internshipService.getOffers()();
        const offer = currentOffers.find(o => o.id === (dto.offreStageId?.toString() ?? ''));
        // Try to match by utilisateurId or username if available in DTO
        const user = this.allUsers.find(u => u.id === dto.utilisateurId?.toString());
        
        return {
            id: dto.id?.toString() || Math.random().toString(),
            offerTitle: offer ? offer.title : (dto.offreStageId ? `Offre #${dto.offreStageId}` : 'Offre inconnue'),
            firstName: dto.prenom || 'N/A',
            lastName: dto.nom || 'N/A',
            cvName: dto.cvNodeId || 'N/A',
            letterName: dto.lettreMotivationNodeId || 'N/A',
            status: (dto.etat === 'ACCEPTEE' || dto.etat === 'REFUSEE' || dto.etat === 'EN_ATTENTE') ? dto.etat as any : 'EN_ATTENTE',
            date: new Date(), 
            iaScore: dto.scoreAI,
            iaApproved: dto.approvedByAI,
            encadrantId: user ? user.encadrantId : undefined,
            utilisateurId: dto.utilisateurId?.toString()
        };
    }

    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onOfferFilter(table: any, event: any) {
        table.filter(event.value, 'offerTitle', 'equals');
    }

    getStatusLabel(status: string) {
        switch (status) {
            case 'ACCEPTEE': return 'Accepté';
            case 'REFUSEE': return 'Refusé';
            case 'EN_ATTENTE': return 'En attente';
            default: return status;
        }
    }

    getSeverity(status: string) {
        switch (status) {
            case 'ACCEPTEE': return 'success';
            case 'REFUSEE': return 'danger';
            case 'EN_ATTENTE': return 'warn';
            default: return 'secondary';
        }
    }

    getScoreColor(score: number | undefined) {
        if (!score) return '#94a3b8';
        if (score >= 80) return '#22c55e';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    }

    getSupervisorName(id: string | undefined): string {
        if (!id) return 'N/A';
        const superv = this.allUsers.find(u => u.id === id);
        return superv ? `${superv.firstName} ${superv.lastName}` : 'N/A';
    }

    async updateStatus(app: InternshipApplication, newStatus: 'ACCEPTEE' | 'REFUSEE' | 'EN_ATTENTE') {
        try {
            const id = parseInt(app.id);
            if (newStatus === 'ACCEPTEE') await this.candidatureService.accepter(id);
            else if (newStatus === 'REFUSEE') await this.candidatureService.refuser(id);
            else await this.candidatureService.mettreEnAttente(id);

            await this.loadApplications();
            this.messageService.add({
                severity: 'success',
                summary: 'Statut mis à jour',
                detail: `La candidature de ${app.firstName} est maintenant ${this.getStatusLabel(newStatus)}.`
            });

            if (newStatus === 'ACCEPTEE' && !app.encadrantId) {
                const refreshedApp = this.applications().find(a => a.id === app.id);
                if (refreshedApp) this.openAssignDialog(refreshedApp);
            }
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Mise à jour du statut échouée' });
        }
    }

    openAssignDialog(app: InternshipApplication) {
        this.selectedApp = app;
        this.selectedSupervisorId = null;
        this.assignmentDialog = true;
    }

    async confirmAssignment() {
        if (!this.selectedApp || !this.selectedSupervisorId) return;

        try {
            // Must use the utilisateurId (Keycloak ID) for the affectation
            const stagiaireId = this.selectedApp.utilisateurId || this.selectedApp.id;

            await this.affectationService.affecter({
                stagiaireId: stagiaireId,
                encadrantId: this.selectedSupervisorId
            });

            this.messageService.add({
                severity: 'success',
                summary: 'Affectation réussie',
                detail: `L'encadrant a été affecté à ${this.selectedApp.firstName}.`
            });
            this.assignmentDialog = false;
            this.loadApplications();
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de l'affectation" });
        }
    }
}
