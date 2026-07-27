import { Component, OnInit, signal, computed, ChangeDetectorRef, inject } from '@angular/core';
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
                [value]="enrichedApplications()"
                [columns]="exportColumns"
                csvSeparator=";"
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
                                {{enrichedApplications().length}} Candidature(s)
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
                        <th class="py-5 !bg-transparent text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] text-center">Stage</th>
                        <th pSortableColumn="status" class="py-5 !bg-transparent text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] text-center">Décision & Statut <p-sortIcon field="status" /></th>
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
                            <div class="inline-flex items-center px-4 py-2 rounded-2xl text-[10px] font-black bg-slate-50 dark:bg-slate-800/40 text-[#063970] dark:text-blue-300 border border-slate-100 dark:border-slate-700 uppercase tracking-wider shadow-sm">
                                <i class="pi pi-briefcase mr-2 opacity-60"></i>
                                {{ app.offerTitle }}
                            </div>
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <p-button icon="pi pi-file-pdf" 
                                        [text]="true"
                                        [pTooltip]="app.cvName && app.cvName !== 'N/A' ? 'Télécharger CV: ' + app.cvName : 'CV non disponible'"
                                        [disabled]="!app.cvNodeId"
                                        (onClick)="downloadDocument(app.cvNodeId!, app.cvName)"
                                        styleClass="!w-9 !h-9 !rounded-xl !bg-blue-50/50 dark:!bg-blue-900/10 !text-blue-600 hover:!bg-blue-100 transition-colors" />
                                <p-button icon="pi pi-envelope" 
                                        [text]="true"
                                        [pTooltip]="app.letterName && app.letterName !== 'N/A' ? 'Télécharger Lettre: ' + app.letterName : 'Lettre non disponible'"
                                        [disabled]="!app.lettreNodeId"
                                        (onClick)="downloadDocument(app.lettreNodeId!, app.letterName)"
                                        styleClass="!w-9 !h-9 !rounded-xl !bg-indigo-50/50 dark:!bg-indigo-900/10 !text-indigo-600 hover:!bg-indigo-100 transition-colors" />
                            </div>
                        </td>
                        <td class="text-center">
                            <div class="inline-flex items-center justify-center w-12 h-12 rounded-[1.25rem] bg-white dark:bg-slate-800 border-2 shadow-inner font-black text-[11px] transition-transform hover:scale-110 cursor-default"
                                [ngStyle]="{'border-color': getScoreColor(app.iaScore), 'color': getScoreColor(app.iaScore)}">
                                {{ app.iaScore || 0 }}%
                            </div>
                        </td>
                        <td class="text-center">
                            <p-tag [value]="app.iaApproved ? 'OUI' : 'NON'" [severity]="app.iaApproved ? 'success' : 'danger'" styleClass="text-[9px] font-black px-3 py-1 rounded-xl" />
                        </td>
                        <td class="text-center">
                            <div class="flex items-center justify-center gap-2">
                                <div class="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black text-[11px]" *ngIf="testScoresMap()[app.id] !== undefined && testScoresMap()[app.id] !== null">
                                    {{ testScoresMap()[app.id] | number:'1.0-2' }}%
                                </div>
                                <p-button icon="pi pi-chart-bar" [text]="true" size="small" (onClick)="showTestResults(app)" 
                                          pTooltip="Détails du test" tooltipPosition="top"
                                          styleClass="!w-8 !h-8 !p-0" />
                                <span *ngIf="testScoresMap()[app.id] === undefined || testScoresMap()[app.id] === null" class="text-[10px] text-slate-300 italic">N/A</span>
                            </div>
                        </td>
                        <td class="text-center">
                            <div *ngIf="stageMap[app.id] as stage" class="flex items-center justify-center gap-2">
                                <div [class]="'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ' + getStageColorClass(stage.etat)">
                                    {{ stage.etat }}
                                </div>
                                <p-button icon="pi pi-info-circle" [text]="true" size="small" (onClick)="showStageDetails(stage)" 
                                          pTooltip="Détails du stage" tooltipPosition="top"
                                          [styleClass]="'!w-8 !h-8 !p-0 ' + getStageButtonClass(stage.etat)" />
                            </div>
                            <span *ngIf="!stageMap[app.id]" class="text-[10px] text-slate-300 font-bold italic uppercase tracking-tighter opacity-50">Pas de stage</span>
                        </td>
                        <td class="text-center">
                            <div class="flex flex-col items-center justify-center gap-3 py-2">
                                <ng-container *ngIf="app.status === 'EN_ATTENTE'; else finalStatus">
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                        <span class="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">En attente</span>
                                    </div>
                                    <div class="flex gap-2">
                                        <p-button icon="pi pi-check" size="small" (onClick)="openAcceptDialog(app)" 
                                                  pTooltip="Accepter" tooltipPosition="top"
                                                  styleClass="!bg-emerald-500 !border-none !rounded-xl !text-[10px] !font-black !w-10 !h-10 shadow-md shadow-emerald-500/10 hover:!shadow-lg hover:-translate-y-0.5 transition-all" />
                                        <p-button icon="pi pi-times" size="small" (onClick)="openRefuseDialog(app)" 
                                                  pTooltip="Refuser" tooltipPosition="top"
                                                  styleClass="!bg-rose-500 !border-none !rounded-xl !text-[10px] !font-black !w-10 !h-10 shadow-md shadow-rose-500/10 hover:!shadow-lg hover:-translate-y-0.5 transition-all" />
                                    </div>
                                </ng-container>
                                <ng-template #finalStatus>
                                    <div class="flex items-center gap-3">
                                        <p-tag [value]="getStatusLabel(app.status)" [severity]="getSeverity(app.status)" 
                                               styleClass="text-[10px] font-black uppercase rounded-xl px-5 py-2 tracking-[0.15em] shadow-md border-2 border-white dark:border-slate-800" />
                                        <div *ngIf="app.status === 'REFUSEE' && app.raisonRefus" 
                                           class="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 cursor-pointer border border-rose-100 dark:border-rose-800 hover:bg-rose-100 transition-colors shadow-sm hover:shadow-md active:scale-90" 
                                           (click)="showRefusalReason(app)"
                                           pTooltip="Voir le motif du refus"
                                           tooltipPosition="top">
                                           <i class="pi pi-info-circle text-base"></i>
                                        </div>
                                    </div>
                                </ng-template>
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
                            {{ getSupervisorName(selectedStage.encadrantId, selectedStage).charAt(0) }}
                        </div>
                        <span class="text-sm font-black text-[#063970] dark:text-blue-300">{{ getSupervisorName(selectedStage.encadrantId, selectedStage) }}</span>
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

        <!-- Dialog Motif Refus Premium -->
        <p-dialog [(visible)]="refusalReasonDialog" [modal]="true" [style]="{ width: '450px' }" styleClass="modern-dialog" [draggable]="false" [resizable]="false">
            <ng-template #header>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <i class="pi pi-exclamation-circle text-xl"></i>
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <h5 class="m-0 text-xl font-black text-rose-600 dark:text-white tracking-tight">Motif du Refus</h5>
                        <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Feedback Candidature</p>
                    </div>
                </div>
            </ng-template>

            <div *ngIf="selectedRefusalApp" class="flex flex-col gap-6 py-6">
                <!-- User Context -->
                <div class="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-xs">
                        {{ selectedRefusalApp.firstName.charAt(0) }}{{ selectedRefusalApp.lastName.charAt(0) }}
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm font-black text-slate-800 dark:text-white">{{ selectedRefusalApp.firstName }} {{ selectedRefusalApp.lastName }}</span>
                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ selectedRefusalApp.offerTitle }}</span>
                    </div>
                </div>

                <!-- Reason Card -->
                <div class="relative overflow-hidden p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-rose-100 dark:border-rose-800/50 shadow-xl shadow-rose-500/5">
                    <div class="absolute -top-6 -right-6 w-24 h-24 bg-rose-50 dark:bg-rose-900/10 rounded-full opacity-50"></div>
                    <p class="relative m-0 text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium italic">
                        <i class="pi pi-quote-left text-rose-200 dark:text-rose-800 text-2xl absolute -top-2 -left-2 opacity-50"></i>
                        {{ selectedRefusalApp.raisonRefus }}
                    </p>
                </div>
            </div>
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
            ::ng-deep .p-tag-success {
                background: #f0fdf4 !important;
                color: #16a34a !important;
                border: 1px solid #bbf7d0 !important;
            }
            ::ng-deep .p-tag-danger {
                background: #fef2f2 !important;
                color: #dc2626 !important;
                border: 1px solid #fecaca !important;
            }
            ::ng-deep .p-tag-warn {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
                color: white !important;
            }
            ::ng-deep .p-datatable-tbody > tr > td {
                padding-top: 1.25rem !important;
                padding-bottom: 1.25rem !important;
            }
            ::ng-deep .custom-premium-table .p-datatable-tbody > tr:hover {
                transform: scale(1.002);
                box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05);
                z-index: 10;
                position: relative;
            }
            :host-context(.dark) ::ng-deep .custom-premium-table .p-datatable-tbody > tr:hover {
                box-shadow: 0 4px 20px -5px rgba(0,0,0,0.3);
            }
            ::ng-deep .stage-orange {
                background: #fff7ed !important;
                color: #f97316 !important;
                border-color: #ffedd5 !important;
            }
            ::ng-deep .stage-grey {
                background: #f8fafc !important;
                color: #64748b !important;
                border-color: #f1f5f9 !important;
            }
            ::ng-deep .stage-blue {
                background: #063970 !important;
                color: white !important;
                border-color: #063970 !important;
            }
            ::ng-deep .stage-red-neon {
                background: #ff003c !important;
                color: white !important;
                border-color: #ff003c !important;
                box-shadow: 0 0 12px rgba(255, 0, 60, 0.4);
                text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
            }
            ::ng-deep .stage-default {
                background: #f1f5f9 !important;
                color: #475569 !important;
                border-color: #e2e8f0 !important;
            }
            ::ng-deep .btn-stage-orange { color: #f97316 !important; }
            ::ng-deep .btn-stage-grey { color: #64748b !important; }
            ::ng-deep .btn-stage-blue { color: #063970 !important; }
            ::ng-deep .btn-stage-red { color: #ff003c !important; }
        </style>
    `
})
export class ApplicationManagement implements OnInit {
    applications = signal<InternshipApplication[]>([]);
    selectedOffer: string | null = null;
    loading = signal<boolean>(false);
    isSubmitting = false;

    exportColumns = [
        { field: 'nomComplet', header: 'Candidat' },
        { field: 'offerTitle', header: 'Offre' },
        { field: 'iaScoreText', header: 'Score IA' },
        { field: 'iaApprovedText', header: 'Approuvé IA' },
        { field: 'testScoreText', header: 'Score Test' },
        { field: 'stageStatusText', header: 'État Stage' },
        { field: 'statusText', header: 'Statut' }
    ];

    enrichedApplications = computed(() => {
        const apps = this.applications();
        const scores = this.testScoresMap();
        return apps.map(app => {
            const stage = this.stageMap[app.id];
            const score = scores[app.id];
            return {
                ...app,
                nomComplet: `${app.lastName} ${app.firstName}`,
                iaScoreText: app.iaScore ? `${app.iaScore}%` : 'N/A',
                iaApprovedText: app.iaApproved ? 'OUI' : 'NON',
                testScoreText: (score !== undefined && score !== null) ? `${score}%` : 'N/A',
                stageStatusText: stage ? stage.etat : 'Pas de stage',
                statusText: this.getStatusLabel(app.status)
            };
        });
    });

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
    refusalReasonDialog = false;
    selectedRefusalApp: InternshipApplication | null = null;

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
    testScoresMap = signal<{ [key: string]: number }>({});

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

            const scores: { [key: string]: number } = {};
            await Promise.allSettled(mapped.map(async (app) => {
                try {
                    const results = await this.testAttemptService.getByCandidature(parseInt(app.id));
                    if (results?.length > 0) {
                        const latest = results.reduce((prev: any, current: any) => (prev.id > current.id) ? prev : current);
                        scores[app.id] = latest.score;
                    }
                } catch (e) { }
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
            date: dto.dateCreation ? new Date(dto.dateCreation) : new Date(),
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

            // Auto-refuse other pending candidatures from the same user
            if (this.selectedApp.utilisateurId) {
                const otherApps = this.applications().filter(
                    app => app.utilisateurId === this.selectedApp!.utilisateurId &&
                           app.id !== this.selectedApp!.id &&
                           app.status === 'EN_ATTENTE'
                );

                for (const otherApp of otherApps) {
                    try {
                        await this.candidatureService.refuser(parseInt(otherApp.id), "Il a déjà un stage");
                    } catch (refuseErr) {
                        console.error(`Error auto-refusing application ${otherApp.id}`, refuseErr);
                    }
                }
            }

            this.acceptDialog = false;
            await this.loadApplications();
            this.cdr.detectChanges();
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Candidature acceptée et stage créé. Les autres candidatures ont été refusées.' });
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

    showRefusalReason(app: InternshipApplication) {
        this.selectedRefusalApp = app;
        this.refusalReasonDialog = true;
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

    getSupervisorName(id: string | undefined, stage?: any): string {
        if (stage?.encadrantFirstName || stage?.encadrantLastName) {
            return `${stage.encadrantFirstName ?? ''} ${stage.encadrantLastName ?? ''}`.trim();
        }
        if (!id) return 'N/A';
        const superv = this.allUsers.find(u => u.id === id);
        return superv ? `${superv.firstName} ${superv.lastName}` : 'N/A';
    }

    getStageColorClass(etat: string) {
        if (!etat) return 'stage-default';
        const e = etat.toUpperCase();
        if (e.includes('COURS')) return 'stage-orange';
        if (e.includes('ACCEPTE')) return 'stage-grey';
        if (e.includes('VALIDE') && !e.includes('NON')) return 'stage-blue';
        if (e.includes('NON_VALIDE') || e.includes('NON VALIDE')) return 'stage-red-neon';
        return 'stage-default';
    }

    getStageButtonClass(etat: string) {
        if (!etat) return '';
        const e = etat.toUpperCase();
        if (e.includes('COURS')) return 'btn-stage-orange';
        if (e.includes('ACCEPTE')) return 'btn-stage-grey';
        if (e.includes('VALIDE') && !e.includes('NON')) return 'btn-stage-blue';
        if (e.includes('NON_VALIDE') || e.includes('NON VALIDE')) return 'btn-stage-red';
        return '';
    }

    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onOfferFilter(table: any, event: any) {
        table.filter(event.value, 'offerTitle', 'equals');
    }
}
