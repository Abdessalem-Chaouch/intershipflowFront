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
import { User, UserService } from '../service/user.service';

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
    providers: [MessageService, UserService],
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
                                [options]="offers" 
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
        private internshipService: InternshipService,
        private userService: UserService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.applications = this.internshipService.getApplications();
        this.offers = this.internshipService.getOffers()();
        this.userService.getUsers().then(data => {
            this.allUsers = data;
            this.availableSupervisors = data
                .filter(u => u.role === 'Encadrant')
                .map(u => ({
                    id: u.id,
                    fullName: `${u.firstName} ${u.lastName}`
                }));
        });
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

    updateStatus(app: InternshipApplication, newStatus: 'ACCEPTEE' | 'REFUSEE' | 'EN_ATTENTE') {
        const apps = [...this.applications()];
        const index = apps.findIndex(a => a.id === app.id);
        if (index !== -1) {
            apps[index] = { ...apps[index], status: newStatus };
            this.internshipService.getApplications().set(apps);
            this.messageService.add({
                severity: 'success',
                summary: 'Statut mis à jour',
                detail: `La candidature de ${app.firstName} est maintenant ${this.getStatusLabel(newStatus)}.`
            });

            if (newStatus === 'ACCEPTEE' && !app.encadrantId) {
                this.openAssignDialog(apps[index]);
            }
        }
    }

    openAssignDialog(app: InternshipApplication) {
        this.selectedApp = app;
        this.selectedSupervisorId = null;
        this.assignmentDialog = true;
    }

    confirmAssignment() {
        if (!this.selectedApp || !this.selectedSupervisorId) return;

        const apps = [...this.applications()];
        const index = apps.findIndex(a => a.id === this.selectedApp?.id);
        if (index !== -1) {
            apps[index] = { ...apps[index], encadrantId: this.selectedSupervisorId };
            this.internshipService.getApplications().set(apps);
            this.messageService.add({
                severity: 'success',
                summary: 'Affectation réussie',
                detail: `L'encadrant a été affecté à ${this.selectedApp.firstName}.`
            });
            this.assignmentDialog = false;
        }
    }
}
