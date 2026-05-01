import { Component, OnInit, signal, ChangeDetectorRef, inject } from '@angular/core';
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
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InternshipApplication, InternshipService, InternshipOffer } from '../../services/internship.service';
import { User, UserService } from '../../services/user.service';
import { CandidatureService, CandidatureResponseDto } from '../../services/candidature.service';
import { AffectationService, EncadrantDTO } from '../../services/affectation.service';
import { TestAttemptService, TestAttemptResponse } from '../../services/test-attempt.service';
import { DocumentStageService } from '../../services/document-stage.service';
import { StageService, Stage } from '../../services/stage.service';

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
        DialogModule,
        ConfirmDialogModule,
        DatePickerModule
    ],
    providers: [MessageService, ConfirmationService, UserService, CandidatureService, AffectationService, TestAttemptService, DocumentStageService, StageService],
    template: `
        <div class="card border-none shadow-xl overflow-hidden bg-white dark:bg-[#06111d] rounded-3xl">
            <!-- Header Toolbar -->
            <p-toolbar styleClass="bg-white dark:bg-[#06111d] border-b border-slate-100 dark:border-slate-800 px-8 py-6">
                <ng-template #start>
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-[#063970]/5 dark:bg-[#063970]/20 flex items-center justify-center text-[#063970] dark:text-blue-300 shadow-sm border border-[#063970]/10">
                            <i class="pi pi-users text-2xl"></i>
                        </div>
                        <div class="flex flex-col gap-0.5">
                            <h5 class="m-0 text-2xl font-black text-slate-800 dark:text-white tracking-tight">Gestion des Candidatures</h5>
                            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Flux de recrutement premium</p>
                        </div>
                    </div>
                </ng-template>
                <ng-template #end>
                    <div class="flex gap-3">
                        <p-button label="Exporter" icon="pi pi-download" [outlined]="true" severity="secondary" styleClass="!rounded-xl !font-bold !px-5" (onClick)="dt.exportCSV()" />
                    </div>
                </ng-template>
            </p-toolbar>

            <!-- Main Table -->
            <p-table
                #dt
                [value]="applications()"
                [rows]="10"
                [paginator]="true"
                [globalFilterFields]="['firstName', 'lastName', 'offerTitle', 'status']"
                [tableStyle]="{ 'min-width': '80rem' }"
                [rowHover]="true"
                dataKey="id"
                currentPageReportTemplate="Lignes {first} à {last} de {totalRecords}"
                [showCurrentPageReport]="true"
                [rowsPerPageOptions]="[10, 20, 30]"
                [loading]="loading()"
                styleClass="p-datatable-lg custom-premium-table"
            >
                <ng-template #caption>
                    <div class="flex flex-wrap items-center justify-between px-4 pt-4 pb-6 gap-4">
                        <div class="flex items-center gap-3">
                           <span class="text-[11px] font-black text-[#063970] dark:text-blue-300 uppercase tracking-widest bg-[#063970]/5 dark:bg-[#063970]/20 px-4 py-2 rounded-xl border border-[#063970]/10">
                                {{applications().length}} Candidature(s)
                           </span>
                        </div>
                        <div class="flex flex-wrap items-center gap-4">
                            <p-select 
                                [options]="internshipService.getOffers()()" 
                                [(ngModel)]="selectedOffer" 
                                (onChange)="onOfferFilter(dt, $event)" 
                                placeholder="Filtrer par offre" 
                                optionLabel="title" 
                                optionValue="title"
                                [showClear]="true"
                                styleClass="w-72 !rounded-2xl !border-slate-200 dark:!border-slate-700 !shadow-none !text-sm dark:!bg-slate-800" />

                            <p-iconField iconPosition="left">
                                <p-inputIcon styleClass="pi pi-search text-slate-400" />
                                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" 
                                    placeholder="Rechercher un candidat..." 
                                    class="w-80 !rounded-2xl !border-slate-200 dark:!border-slate-700 !shadow-none !text-sm dark:!bg-slate-800" />
                            </p-iconField>
                        </div>
                    </div>
                </ng-template>

                <ng-template #header>
                    <tr class="bg-slate-50/50 dark:bg-slate-800/30">
                        <th pSortableColumn="lastName" class="py-5 px-6 !bg-transparent text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">Candidat <p-sortIcon field="lastName" /></th>
                        <th pSortableColumn="offerTitle" class="py-5 !bg-transparent text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">Offre <p-sortIcon field="offerTitle" /></th>
                        <th class="py-5 !bg-transparent text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">Documents</th>
                        <th pSortableColumn="iaScore" class="py-5 !bg-transparent text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] text-center">Score IA <p-sortIcon field="iaScore" /></th>
                        <th class="py-5 !bg-transparent text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] text-center">Approuvé IA</th>
                        <th class="py-5 !bg-transparent text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] text-center">Test Score</th>
                        <th pSortableColumn="status" class="py-5 !bg-transparent text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] text-center">Statut <p-sortIcon field="status" /></th>
                        <th class="py-5 !bg-transparent text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] text-center">Stage</th>
                        <th class="py-5 !bg-transparent text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] text-center">Actions</th>
                    </tr>
                </ng-template>

                <ng-template #body let-app>
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-all border-b border-slate-50 dark:border-slate-800/50">
                        <td class="py-5 px-6">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#063970] to-[#1e4b8a] flex items-center justify-center text-white text-xs font-black shadow-lg">
                                    {{ app.firstName.charAt(0) }}{{ app.lastName.charAt(0) }}
                                </div>
                                <div class="flex flex-col gap-0.5">
                                    <span class="font-black text-slate-800 dark:text-white text-sm">{{ app.lastName }} {{ app.firstName }}</span>
                                    <span class="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{{ app.date | date:'dd MMM yyyy' }}</span>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black bg-[#063970]/5 dark:bg-[#063970]/20 text-[#063970] dark:text-blue-300 border border-[#063970]/10 uppercase tracking-wider">
                                {{ app.offerTitle }}
                            </div>
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <button pButton icon="pi pi-file-pdf" 
                                        class="p-button-text p-button-info !w-9 !h-9 !rounded-xl !p-0"
                                        [pTooltip]="app.cvName && app.cvName !== 'N/A' ? 'Télécharger CV: ' + app.cvName : 'CV non disponible'"
                                        [disabled]="!app.cvNodeId"
                                        (click)="downloadDocument(app.cvNodeId!, app.cvName)"></button>
                                <button pButton icon="pi pi-envelope" 
                                        class="p-button-text p-button-secondary !w-9 !h-9 !rounded-xl !p-0"
                                        [pTooltip]="app.letterName && app.letterName !== 'N/A' ? 'Télécharger Lettre: ' + app.letterName : 'Lettre non disponible'"
                                        [disabled]="!app.lettreNodeId"
                                        (click)="downloadDocument(app.lettreNodeId!, app.letterName)"></button>
                            </div>
                        </td>
                        <td class="text-center">
                            <div class="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border shadow-sm font-black text-[11px]"
                                [ngStyle]="{'border-color': getScoreColor(app.iaScore), 'color': getScoreColor(app.iaScore)}">
                                {{ app.iaScore || 0 }}%
                            </div>
                        </td>
                        <td class="text-center">
                            <p-tag [value]="app.iaApproved ? 'OUI' : 'NON'" [severity]="app.iaApproved ? 'success' : 'danger'" styleClass="text-[9px] font-black px-3 py-1 rounded-xl" />
                        </td>
                        <td class="text-center">
                            <div class="flex items-center justify-center gap-2">
                                <div class="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black text-[11px]" *ngIf="testScoresMap()[app.id]">
                                    {{ testScoresMap()[app.id] | number:'1.0-2' }}%
                                </div>
                                <p-button icon="pi pi-chart-bar" [text]="true" size="small" (onClick)="showTestResults(app)" 
                                          pTooltip="Détails du test" tooltipPosition="top"
                                          styleClass="!w-8 !h-8 !p-0" />
                                <span *ngIf="!testScoresMap()[app.id]" class="text-[10px] text-slate-300 italic">N/A</span>
                            </div>
                        </td>
                        <td class="text-center">
                            <div class="flex items-center justify-center gap-2">
                                <p-tag [value]="getStatusLabel(app.status)" [severity]="getSeverity(app.status)" 
                                       styleClass="text-[9px] font-black uppercase rounded-lg px-3 py-1 tracking-widest" />
                                <i *ngIf="app.status === 'REFUSEE' && app.raisonRefus" 
                                   class="pi pi-info-circle text-red-500 cursor-help text-sm" 
                                   [pTooltip]="'Motif: ' + app.raisonRefus"
                                   tooltipPosition="top"></i>
                            </div>
                        </td>
                        <td class="text-center">
                            <div *ngIf="stageMap[app.id] as stage" class="flex items-center justify-center gap-2">
                                <p-tag [value]="stage.etat" severity="info" styleClass="text-[9px] font-black uppercase rounded-lg px-2 py-1" />
                                <p-button icon="pi pi-info-circle" [text]="true" size="small" (onClick)="showStageDetails(stage)" 
                                          pTooltip="Détails du stage" tooltipPosition="top"
                                          styleClass="!w-8 !h-8 !p-0" />
                            </div>
                            <span *ngIf="!stageMap[app.id]" class="text-[10px] text-slate-300 italic">Aucun stage</span>
                        </td>
                        <td class="text-center">
                            <div class="flex justify-center items-center gap-2">
                                <p-button icon="pi pi-check" [rounded]="true" [text]="true" severity="success" 
                                          [disabled]="app.status === 'ACCEPTEE' || app.status === 'REFUSEE'"
                                          (onClick)="openAcceptDialog(app)" pTooltip="Accepter" tooltipPosition="top" 
                                          styleClass="!w-9 !h-9" />
                                <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="danger" 
                                          [disabled]="app.status === 'ACCEPTEE' || app.status === 'REFUSEE'"
                                          (onClick)="openRefuseDialog(app)" pTooltip="Refuser" tooltipPosition="top" 
                                          styleClass="!w-9 !h-9" />
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Dialog Accepter Candidature -->
        <p-dialog [(visible)]="acceptDialog" [modal]="true" [style]="{ width: '500px' }" styleClass="modern-dialog" [draggable]="false">
            <ng-template #header>
                <div class="flex items-center gap-4 w-full">
                    <div class="w-14 h-14 rounded-2xl bg-[#063970] flex items-center justify-center text-white shadow-xl rotate-3">
                        <i class="pi pi-check-circle text-3xl"></i>
                    </div>
                    <div class="flex flex-col gap-1">
                        <h5 class="m-0 text-2xl font-black text-[#063970] dark:text-white tracking-tight">Validation Candidat</h5>
                        <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Flux opérationnel premium</p>
                    </div>
                </div>
            </ng-template>
            
            <div class="flex flex-col gap-8 py-8 px-4">
                <!-- User Summary Card -->
                <div class="relative overflow-hidden p-6 bg-[#063970] rounded-[2.5rem] shadow-2xl shadow-[#063970]/20">
                    <div class="absolute top-0 right-0 p-8 opacity-10">
                        <i class="pi pi-user text-9xl"></i>
                    </div>
                    <div class="relative flex items-center gap-5">
                        <div class="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-white text-2xl border border-white/20">
                            {{ selectedApp?.firstName?.charAt(0) }}{{ selectedApp?.lastName?.charAt(0) }}
                        </div>
                        <div class="flex flex-col gap-1">
                            <span class="text-xl font-black text-white">{{ selectedApp?.firstName }} {{ selectedApp?.lastName }}</span>
                            <div class="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] text-blue-100 font-black uppercase tracking-widest border border-white/10">
                                {{ selectedApp?.offerTitle }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <div class="flex flex-col gap-3">
                        <label class="text-[10px] font-black text-[#063970] uppercase tracking-[0.2em] ml-2">Date de début</label>
                        <p-datepicker [(ngModel)]="acceptForm.dateDebut" appendTo="body" styleClass="w-full !rounded-3xl custom-datepicker" placeholder="JJ/MM/AAAA" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <label class="text-[10px] font-black text-[#063970] uppercase tracking-[0.2em] ml-2">Date de fin</label>
                        <p-datepicker [(ngModel)]="acceptForm.dateFin" appendTo="body" styleClass="w-full !rounded-3xl custom-datepicker" placeholder="JJ/MM/AAAA" />
                    </div>
                </div>

                <div class="flex flex-col gap-3">
                    <label class="text-[10px] font-black text-[#063970] uppercase tracking-[0.2em] ml-2">Encadrant assigné</label>
                    <p-select [options]="availableSupervisors" 
                             [(ngModel)]="acceptForm.encadrantId" 
                             optionLabel="fullName" 
                             optionValue="id" 
                             placeholder="Rechercher un encadrant..." 
                             appendTo="body" 
                             styleClass="w-full !rounded-3xl !border-slate-100 !bg-slate-50/50 dark:!bg-slate-800 dark:!border-slate-700 !py-2" />
                </div>
            </div>

            <ng-template #footer>
                <div class="flex items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-[2.5rem] border-t border-slate-100 dark:border-slate-800">
                    <p-button label="Annuler" [text]="true" (onClick)="acceptDialog = false" styleClass="!font-black !text-slate-400 !px-8 hover:!text-slate-600" />
                    <p-button label="Finaliser l'acceptation" icon="pi pi-check" (onClick)="confirmAccept()" [loading]="isSubmitting" [disabled]="!isAcceptFormValid()" styleClass="!bg-[#063970] !border-none !rounded-3xl !font-black !px-10 !py-4 shadow-xl shadow-[#063970]/30" />
                </div>
            </ng-template>
        </p-dialog>

        <!-- Dialog Refuser Candidature -->
        <p-dialog [(visible)]="refuseDialog" [modal]="true" [style]="{ width: '500px' }" styleClass="modern-dialog" [draggable]="false">
            <ng-template #header>
                <div class="flex items-center gap-4 w-full">
                    <div class="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-xl -rotate-3">
                        <i class="pi pi-times-circle text-3xl"></i>
                    </div>
                    <div class="flex flex-col gap-1">
                        <h5 class="m-0 text-2xl font-black text-red-600 dark:text-white tracking-tight">Refus Candidat</h5>
                        <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Communication transparente</p>
                    </div>
                </div>
            </ng-template>

            <div class="flex flex-col gap-8 py-8 px-4">
                <div class="p-6 bg-red-600 rounded-[2.5rem] shadow-2xl shadow-red-600/20 relative overflow-hidden">
                    <div class="absolute -bottom-4 -right-4 opacity-10">
                        <i class="pi pi-times text-9xl text-white"></i>
                    </div>
                    <div class="relative flex items-center gap-5 text-white">
                        <div class="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-2xl border border-white/20">
                            {{ selectedApp?.firstName?.charAt(0) }}{{ selectedApp?.lastName?.charAt(0) }}
                        </div>
                        <div class="flex flex-col gap-1">
                            <span class="text-xl font-black">{{ selectedApp?.firstName }} {{ selectedApp?.lastName }}</span>
                            <span class="text-[10px] text-red-100 font-black uppercase tracking-widest">{{ selectedApp?.offerTitle }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-3">
                    <label class="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] ml-2">Motif du refus (obligatoire)</label>
                    <textarea pInputTextarea [(ngModel)]="refuseForm.raison" rows="5" 
                              placeholder="Expliquez ici les raisons du refus pour guider le candidat..." 
                              class="w-full !rounded-3xl !border-slate-100 !bg-slate-50/50 dark:!bg-slate-800 dark:!border-slate-700 !p-6 !shadow-none !text-sm !font-medium"></textarea>
                </div>
            </div>

            <ng-template #footer>
                <div class="flex items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-[2.5rem] border-t border-slate-100 dark:border-slate-800">
                    <p-button label="Annuler" [text]="true" (onClick)="refuseDialog = false" styleClass="!font-black !text-slate-400 !px-8 hover:!text-slate-600" />
                    <p-button label="Confirmer le refus" icon="pi pi-times" (onClick)="confirmRefuse()" [loading]="isSubmitting" [disabled]="!refuseForm.raison.trim()" styleClass="!bg-[#063970] !border-none !rounded-3xl !font-black !px-10 !py-4 shadow-xl shadow-[#063970]/30" />
                </div>
            </ng-template>
        </p-dialog>

        <!-- Dialog Détails Stage Premium -->
        <p-dialog [(visible)]="stageDetailsDialog" [modal]="true" [header]="'Fiche de Stage'" [style]="{ width: '450px' }" styleClass="modern-dialog" [draggable]="false" [resizable]="false">
            <ng-template #header>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-[#063970] flex items-center justify-center text-white">
                        <i class="pi pi-info-circle text-xl"></i>
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <h5 class="m-0 text-xl font-black text-[#063970] dark:text-white tracking-tight">Détails du Stage</h5>
                        <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Informations contractuelles</p>
                    </div>
                </div>
            </ng-template>

            <div *ngIf="selectedStage" class="flex flex-col gap-6 py-6">
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Date de Début</span>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-calendar text-[#063970] text-xs"></i>
                            <span class="text-sm font-black text-slate-800 dark:text-slate-100">{{ selectedStage.dateDebut | date:'dd MMM yyyy' }}</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Date de Fin</span>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-calendar-plus text-orange-500 text-xs"></i>
                            <span class="text-sm font-black text-slate-800 dark:text-slate-100">{{ selectedStage.dateFin | date:'dd MMM yyyy' }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-2 p-4 bg-[#063970]/5 dark:bg-[#063970]/10 rounded-2xl border border-[#063970]/10">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Encadrant Responsable</span>
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-[#063970] text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                            {{ getSupervisorName(selectedStage.encadrantId).charAt(0) }}
                        </div>
                        <span class="text-sm font-black text-[#063970] dark:text-blue-300">{{ getSupervisorName(selectedStage.encadrantId) }}</span>
                    </div>
                </div>

                <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl">
                    <div class="flex flex-col gap-1">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Numéro de Stage</span>
                        <span class="text-sm font-black text-slate-800 dark:text-white">STG-{{ selectedStage.numeroStage || '000' }}</span>
                    </div>
                    <p-tag [value]="selectedStage.etat" severity="info" styleClass="!text-[10px] !font-black !rounded-xl !px-4 !py-2" />
                </div>
            </div>

            <ng-template #footer>
                <div class="flex justify-end p-4 border-t border-slate-50 dark:border-slate-800">
                    <p-button label="Fermer la fiche" (onClick)="stageDetailsDialog = false" styleClass="!rounded-xl !font-black !px-6 !bg-[#063970] !border-none" />
                </div>
            </ng-template>
        </p-dialog>

        <!-- Dialog Détails Résultats Tests -->
        <p-dialog [(visible)]="testResultsDialog" [style]="{width: '800px'}" header="Resultats des Tests" [modal]="true" [draggable]="false" [contentStyle]="{ 'max-height': '75vh', 'overflow-y': 'auto' }">
            <div class="p-1 block">
                <div *ngIf="selectedAppForTest" class="flex items-center gap-4 p-4 bg-gradient-to-r from-[#063970] to-[#1e4b8a] text-white rounded-xl mb-4">
                    <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-sm border border-white/20">
                        {{selectedAppForTest.firstName.charAt(0)}}{{selectedAppForTest.lastName.charAt(0)}}
                    </div>
                    <div class="flex flex-col">
                        <span class="font-black text-base">{{selectedAppForTest.firstName}} {{selectedAppForTest.lastName}}</span>
                        <span class="text-blue-200 text-xs font-medium">{{selectedAppForTest.offerTitle}}</span>
                    </div>
                </div>

                <div *ngIf="selectedTestResults.length === 0" class="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                    <i class="pi pi-file-edit text-4xl"></i>
                    <p class="text-sm font-medium">Aucun test passé pour cette candidature</p>
                </div>

                <div *ngFor="let attempt of selectedTestResults; let ai = index" class="mb-6 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm block">
                    <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        <div class="flex items-center gap-3">
                            <div class="w-7 h-7 rounded-full bg-[#063970] text-white flex items-center justify-center text-[10px] font-black">{{ai + 1}}</div>
                            <div class="flex flex-col">
                                <span class="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">Tentative {{ai + 1}}</span>
                                <span class="text-[11px] text-slate-400 font-medium">
                                    <i class="pi pi-clock mr-1"></i>{{attempt.datePassage | date:'dd/MM/yyyy HH:mm:ss'}}
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex flex-col items-center">
                                <span class="text-[9px] text-slate-400 font-black uppercase tracking-wider">Score</span>
                                <span class="text-2xl font-black leading-none" [ngStyle]="{'color': getScoreColor(attempt.score)}">{{attempt.score | number:'1.0-2'}}%</span>
                            </div>
                            <p-tag [severity]="attempt.passed ? 'success' : 'danger'"
                                   [value]="attempt.passed ? 'REUSSI' : 'ECHOUE'"
                                   styleClass="font-black px-3 py-1 rounded-xl text-xs" />
                        </div>
                    </div>

                    <div class="divide-y divide-slate-50 dark:divide-slate-800 bg-white dark:bg-[#06111d]">
                        <div *ngFor="let rep of attempt.reponses; let qi = index" class="px-5 py-4">
                            <div class="flex items-start gap-3">
                                <div class="flex-none mt-0.5 w-6 h-6 rounded-full flex items-center justify-center font-black"
                                     [ngClass]="rep.correcte ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'">
                                    <i class="pi" [ngClass]="rep.correcte ? 'pi-check' : 'pi-times'" style="font-size:0.6rem"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="m-0 text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Q{{qi + 1}}. {{rep.questionText}}</p>
                                    
                                    <!-- Propositions -->
                                    <div *ngIf="rep.propositions.length" class="flex flex-col gap-1.5 mb-3">
                                        <div *ngFor="let prop of rep.propositions"
                                             class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border"
                                             [ngClass]="(rep.bonnesReponses || []).includes(prop) && (rep.reponsesDonnees || []).includes(prop) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                        (!(rep.bonnesReponses || []).includes(prop) && (rep.reponsesDonnees || []).includes(prop)) ? 'bg-red-50 border-red-200 text-red-600' :
                                                        ((rep.bonnesReponses || []).includes(prop) && !(rep.reponsesDonnees || []).includes(prop)) ? 'bg-emerald-50/50 border-emerald-100 text-emerald-500' :
                                                        'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'">
                                            <i class="pi text-[10px]"
                                               [ngClass]="(rep.bonnesReponses || []).includes(prop) ? 'pi-check-circle' :
                                                          ((rep.reponsesDonnees || []).includes(prop) ? 'pi-times-circle' : 'pi-circle')"></i>
                                            <span class="flex-1">{{prop}}</span>
                                            <span *ngIf="(rep.reponsesDonnees || []).includes(prop)" class="font-black text-[9px] uppercase tracking-wider opacity-60">Ma reponse</span>
                                            <span *ngIf="(rep.bonnesReponses || []).includes(prop)" class="font-black text-[9px] uppercase tracking-wider text-emerald-600">Correcte</span>
                                        </div>
                                    </div>

                                    <!-- Free text answer -->
                                    <div *ngIf="!rep.propositions.length" class="flex flex-col gap-2 mb-3">
                                        <div class="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Reponse donnee</span>
                                            {{(rep.reponsesDonnees || []).join(', ') || '(vide)'}}
                                        </div>
                                        <div *ngIf="rep.bonnesReponses.length" class="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400">
                                            <span class="text-[9px] font-black text-emerald-600 uppercase tracking-wider block mb-1">Bonne reponse</span>
                                            {{(rep.bonnesReponses || []).join(', ')}}
                                        </div>
                                    </div>

                                    <!-- Correctness badge -->
                                    <span class="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                          [ngClass]="rep.correcte ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'">
                                        <i class="pi" [ngClass]="rep.correcte ? 'pi-check' : 'pi-times'" style="font-size:0.55rem"></i>
                                        {{rep.correcte ? 'Correct' : 'Incorrect'}}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Fermer" (onClick)="testResultsDialog = false" [text]="true" />
            </ng-template>
        </p-dialog>

        <p-toast />
        <p-confirmDialog />

        <style>
            ::ng-deep .custom-premium-table .p-datatable-thead > tr > th {
                background: #f8fafc;
                color: #64748b;
                border-bottom: 1px solid #f1f5f9;
            }
            :host-context(.dark) ::ng-deep .custom-premium-table .p-datatable-thead > tr > th {
                background: #0f172a;
                border-color: #1e293b;
            }
            ::ng-deep .p-datatable.custom-premium-table .p-datatable-tbody > tr {
                background: transparent;
            }
            ::ng-deep .p-paginator {
                background: transparent !important;
                border: none !important;
                padding: 1.5rem 0 !important;
            }
            ::ng-deep .modern-dialog .p-dialog-header {
                padding: 2.5rem 2.5rem 1.5rem 2.5rem !important;
                border: none !important;
                background: transparent !important;
            }
            ::ng-deep .modern-dialog .p-dialog-content {
                padding: 0 2.5rem 2rem 2.5rem !important;
                background: transparent !important;
            }
            ::ng-deep .modern-dialog {
                border-radius: 3rem !important;
                overflow: hidden !important;
                border: none !important;
            }
            ::ng-deep .custom-datepicker .p-inputtext {
                border-radius: 1.5rem !important;
                padding: 0.8rem 1.2rem !important;
                border-color: #f1f5f9 !important;
                background: #f8fafc !important;
                font-size: 0.875rem !important;
                font-weight: 600 !important;
            }
            :host-context(.dark) ::ng-deep .custom-datepicker .p-inputtext {
                background: #1e293b !important;
                border-color: #334155 !important;
                color: white !important;
            }
        </style>
    `
})
export class ApplicationManagement implements OnInit {
    applications = signal<InternshipApplication[]>([]);
    selectedOffer: string | null = null;
    loading = signal<boolean>(false);
    isSubmitting = false;

    // Users and Encadrants
    allUsers: User[] = [];
    availableSupervisors: any[] = [];
    
    // Stages
    stageMap: { [candidatureId: string]: Stage } = {};
    selectedStage: Stage | null = null;
    stageDetailsDialog = false;

    // Selection for actions
    selectedApp: InternshipApplication | null = null;
    
    // Dialogs
    acceptDialog = false;
    refuseDialog = false;
    testResultsDialog = false;

    acceptForm = {
        dateDebut: null as Date | null,
        dateFin: null as Date | null,
        encadrantId: ''
    };

    refuseForm = {
        raison: ''
    };

    // Test Results
    selectedTestResults: TestAttemptResponse[] = [];
    selectedAppForTest: InternshipApplication | null = null;
    testScoresMap = signal<{[key: string]: number}>({});

    private cdr = inject(ChangeDetectorRef);
    public internshipService = inject(InternshipService);
    private userService = inject(UserService);
    private candidatureService = inject(CandidatureService);
    private testAttemptService = inject(TestAttemptService);
    private documentStageService = inject(DocumentStageService);
    private stageService = inject(StageService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    async ngOnInit() {
        this.loading.set(true);
        try {
            const users = await this.userService.getUsers();
            this.allUsers = users;
            this.availableSupervisors = users
                .filter(u => u.role === 'Encadrant')
                .map(u => ({
                    id: u.id,
                    fullName: `${u.firstName} ${u.lastName}`
                }));
            
            this.cdr.detectChanges();
            await this.loadApplications();
        } catch (err) {
            console.error('Error in ngOnInit', err);
        } finally {
            this.loading.set(false);
            this.cdr.detectChanges();
        }
    }

    async loadApplications() {
        try {
            const [dtos, stages] = await Promise.all([
                this.candidatureService.fetchAll(),
                this.stageService.getAllStages()
            ]);

            const mapped = dtos.map(dto => this.mapToInternshipApplication(dto));
            this.applications.set(mapped);
            
            const newStageMap: { [candidatureId: string]: Stage } = {};
            stages.forEach(s => {
                if (s.candidatureId) newStageMap[s.candidatureId.toString()] = s;
            });
            this.stageMap = newStageMap;

            const scores: {[key: string]: number} = {};
            await Promise.allSettled(mapped.map(async (app) => {
                try {
                    const results = await this.testAttemptService.getByCandidature(parseInt(app.id));
                    if (results?.length > 0) {
                        const latest = results.reduce((prev: any, current: any) => (prev.id > current.id) ? prev : current);
                        scores[app.id] = latest.score;
                    }
                } catch (e) {}
            }));
            
            this.testScoresMap.set(scores);
            this.cdr.detectChanges();
        } catch (err) {
            console.error('Error loading applications', err);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des candidatures échoué' });
        }
    }

    private mapToInternshipApplication(dto: CandidatureResponseDto): InternshipApplication {
        const offer = this.internshipService.getOffers()().find(o => o.id === (dto.offreStageId?.toString() ?? ''));
        return {
            id: dto.id?.toString() || '',
            offerTitle: offer ? offer.title : (dto.offreStageId ? `Offre #${dto.offreStageId}` : 'Offre inconnue'),
            offerId: dto.offreStageId?.toString() || '',
            firstName: dto.prenom || 'N/A',
            lastName: dto.nom || 'N/A',
            cvName: dto.cvName || 'CV',
            cvNodeId: dto.cvNodeId || '',
            letterName: dto.lettreMotivationName || 'Lettre',
            lettreNodeId: dto.lettreMotivationNodeId || '',
            status: dto.etat as any || 'EN_ATTENTE',
            date: new Date(),
            iaScore: dto.scoreAI,
            iaApproved: dto.approvedByAI,
            utilisateurId: dto.utilisateurId?.toString(),
            raisonRefus: dto.raisonRefus
        };
    }

    downloadDocument(nodeId: string, fileName: string) {
        if (!nodeId || nodeId === 'N/A') return;
        this.documentStageService.downloadFile(nodeId, fileName);
    }

    openAcceptDialog(app: InternshipApplication) {
        this.selectedApp = app;
        this.acceptForm = { dateDebut: null, dateFin: null, encadrantId: '' };
        this.acceptDialog = true;
    }

    openRefuseDialog(app: InternshipApplication) {
        this.selectedApp = app;
        this.refuseForm = { raison: '' };
        this.refuseDialog = true;
    }

    isAcceptFormValid() {
        return this.acceptForm.dateDebut && this.acceptForm.dateFin && this.acceptForm.encadrantId;
    }

    async confirmAccept() {
        if (!this.selectedApp || !this.isAcceptFormValid()) return;
        this.isSubmitting = true;
        try {
            const dateDebutStr = this.acceptForm.dateDebut!.toISOString().split('T')[0];
            const dateFinStr = this.acceptForm.dateFin!.toISOString().split('T')[0];
            
            await this.candidatureService.accepter(
                parseInt(this.selectedApp.id), 
                dateDebutStr, 
                dateFinStr, 
                this.acceptForm.encadrantId
            );
            
            this.acceptDialog = false;
            await this.loadApplications();
            this.cdr.detectChanges();
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Candidature acceptée et stage créé.' });
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de l'acceptation" });
        } finally {
            this.isSubmitting = false;
        }
    }

    async confirmRefuse() {
        if (!this.selectedApp || !this.refuseForm.raison.trim()) return;
        this.isSubmitting = true;
        try {
            await this.candidatureService.refuser(parseInt(this.selectedApp.id), this.refuseForm.raison);
            this.refuseDialog = false;
            await this.loadApplications();
            this.cdr.detectChanges();
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Candidature refusée.' });
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec du refus" });
        } finally {
            this.isSubmitting = false;
        }
    }

    async showTestResults(app: InternshipApplication) {
        this.selectedAppForTest = app;
        this.selectedTestResults = [];
        try {
            this.selectedTestResults = await this.testAttemptService.getByCandidature(parseInt(app.id));
            this.testResultsDialog = true;
            this.cdr.detectChanges();
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de récupérer les résultats' });
        }
    }

    showStageDetails(stage: Stage) {
        this.selectedStage = stage;
        this.stageDetailsDialog = true;
        this.cdr.detectChanges();
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

    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onOfferFilter(table: any, event: any) {
        table.filter(event.value, 'offerTitle', 'equals');
    }
}
