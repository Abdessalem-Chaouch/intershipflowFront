import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { StageService, Stage, EtatStage } from '@/app/services/stage.service';
import { DocumentStageService, DocumentStage } from '@/app/services/document-stage.service';
import { UserService, User } from '@/app/services/user.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AttestationService, Attestation } from '@/app/services/attestation.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
    selector: 'app-gestion-stages',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, TagModule, 
        TooltipModule, DialogModule, InputTextModule, DatePickerModule,
        ToastModule, ConfirmDialogModule, IconFieldModule, InputIconModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="p-4 md:p-10 bg-[#f8fafc] dark:bg-slate-950 min-h-screen transition-all duration-500">
            <!-- Header Section -->
            <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">Suivi des Stages</h1>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                            Live Dashboard
                        </div>
                        <span class="text-slate-400 text-xs font-medium italic">Dernière mise à jour : {{ currentDate | date:'HH:mm' }}</span>
                    </div>
                </div>
            </div>

            <!-- Summary Widgets -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div class="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                    <div class="relative z-10">
                        <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Stages</div>
                        <div class="text-4xl font-black text-slate-900 dark:text-white">{{ totalStages() }}</div>
                    </div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div class="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 dark:bg-orange-900/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                    <div class="relative z-10">
                        <div class="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">En Attente</div>
                        <div class="text-4xl font-black text-slate-900 dark:text-white">{{ pendingStages() }}</div>
                    </div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                    <div class="relative z-10">
                        <div class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Validés</div>
                        <div class="text-4xl font-black text-slate-900 dark:text-white">{{ validatedStages() }}</div>
                    </div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div class="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                    <div class="relative z-10">
                        <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">En Cours</div>
                        <div class="text-4xl font-black text-slate-900 dark:text-white">{{ activeStages() }}</div>
                    </div>
                </div>
            </div>

            <!-- Main Table Section -->
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden">
                <p-table #dt [value]="mappedStages()" [rows]="8" [paginator]="true" 
                         responsiveLayout="scroll"
                         styleClass="p-datatable-modern-clean"
                         [globalFilterFields]="['firstName', 'lastName', 'username', 'titreOffre', 'numeroStage']">
                    
                    <ng-template pTemplate="caption">
                        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 px-8 py-8">
                            <div class="flex items-center gap-3">
                                <span class="text-xl font-black text-slate-900 dark:text-white">Dernières Activités</span>
                            </div>
                            <p-iconField iconPosition="left" class="w-full sm:w-auto">
                                <p-inputIcon styleClass="pi pi-search text-slate-400" />
                                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" 
                                       placeholder="Rechercher par stagiaire ou offre..." 
                                       class="w-full sm:w-80 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-5 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 transition-all" />
                            </p-iconField>
                        </div>
                    </ng-template>

                    <ng-template pTemplate="header">
                        <tr class="bg-slate-50/30 dark:bg-slate-800/50">
                            <th class="py-6 px-8 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Stagiaire</th>
                            <th class="py-6 px-8 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Affectation</th>
                            <th class="py-6 px-8 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Planning</th>
                            <th class="py-6 px-8 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-center">État</th>
                            <th class="py-6 px-8 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-center">Livrables</th>
                            <th class="py-6 px-8 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-center">Actions</th>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="body" let-stage>
                        <tr class="group hover:bg-slate-50 dark:hover:bg-transparent transition-all border-b border-slate-50/50 dark:border-slate-800/50">
                            <td class="py-6 px-8">
                                <div class="flex items-center gap-4">
                                    <div class="relative">
                                        <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
                                            {{ (stage.firstName || '?').charAt(0) }}{{ (stage.lastName || '?').charAt(0) }}
                                        </div>
                                        <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900"
                                             [ngClass]="stage.etat === 'EN_COURS' ? 'bg-emerald-500' : 'bg-slate-300'"></div>
                                    </div>
                                    <div class="flex flex-col min-w-0">
                                        <div class="font-black text-slate-900 dark:text-white text-sm truncate max-w-[150px]">
                                            {{ stage.firstName }} {{ stage.lastName }}
                                        </div>
                                        <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            {{ stage.username }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="py-6 px-8">
                                <div class="flex flex-col">
                                    <span class="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight truncate max-w-[200px]">{{ stage.titreOffre }}</span>
                                    <span class="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest opacity-60">REF: {{ stage.numeroStage }}</span>
                                </div>
                            </td>
                            <td class="py-6 px-8">
                                <div (click)="openDateDialog(stage)" 
                                     [pTooltip]="stage.etat === 'VALIDE' ? 'Planning verrouillé (Stage Validé)' : 'Modifier le planning'"
                                     class="cursor-pointer group/date flex flex-col gap-1 hover:translate-x-1 transition-transform">
                                    <div class="flex items-center gap-2 text-[11px] font-bold"
                                         [ngClass]="stage.etat === 'VALIDE' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'">
                                        <i class="pi pi-calendar text-[10px]" [ngClass]="stage.etat === 'VALIDE' ? 'text-slate-300' : 'text-blue-500'"></i>
                                        <span>{{ stage.dateDebut | date:'dd/MM/yyyy' }}</span>
                                        <i *ngIf="stage.etat === 'VALIDE'" class="pi pi-lock text-[8px] opacity-50 ml-1"></i>
                                    </div>
                                    <div class="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                        <i class="pi pi-arrow-right opacity-30"></i>
                                        <span>{{ stage.dateFin | date:'dd/MM/yyyy' }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="py-6 px-8 text-center">
                                <p-tag [value]="stage.etat === 'ATT_VALIDATION_ENCADRANT' ? 'En attente' : stage.etat" 
                                       [severity]="getStageSeverity(stage.etat)" 
                                       styleClass="text-[9px] font-black uppercase px-4 py-2 rounded-xl shadow-sm border-none" />
                            </td>
                                <td class="py-6 px-8 text-center">
                                    <div class="inline-flex items-center gap-3">

                                        <!-- Document de stage -->
                                        <div
                                            (click)="viewDocuments(stage)"
                                            pTooltip="Documents de stage"
                                            tooltipPosition="top"
                                            class="cursor-pointer w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-[#0d1c84] flex items-center justify-center transition-all duration-300"
                                        >
                                            <i
                                                [class]="stage.documentsValides ? 'pi pi-check-square text-[#0d1c84]' : 'pi pi-file text-[#0d1c84]'"
                                                class="text-sm"
                                            ></i>
                                        </div>

                                        <!-- Attestation -->
                                        <div
                                            *ngIf="getAttestation(stage.id)"
                                            (click)="$event.stopPropagation(); downloadAttestation(stage)"
                                            pTooltip="Attestation"
                                            tooltipPosition="top"
                                            class="cursor-pointer w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-[#0d1c84] flex items-center justify-center transition-all duration-300"
                                        >
                                            <i class="pi pi-verified text-sm text-[#0d1c84]"></i>
                                        </div>

                                    </div>
                                </td>
                            <td class="py-6 px-8 text-center">
                                <div class="flex items-center justify-center gap-1">
                                    <ng-container *ngIf="stage.etat === 'ATT_VALIDATION_ENCADRANT'">
                                        <p-button icon="pi pi-check" [text]="true" [rounded]="true" severity="success" size="small" 
                                                 [disabled]="!stage.documentsValides"
                                                 (click)="confirmValidation(stage)" 
                                                 [pTooltip]="stage.documentsValides ? 'Approuver le stage' : 'Validation des documents requise'" />
                                        <p-button icon="pi pi-times" [text]="true" [rounded]="true" severity="danger" size="small" 
                                                 [disabled]="!stage.documentsValides"
                                                 (click)="confirmInvalidation(stage)" 
                                                 [pTooltip]="stage.documentsValides ? 'Invalider' : 'Validation des documents requise'" />
                                    </ng-container>
                                    
                                    <p-button icon="pi pi-ban" [text]="true" [rounded]="true" severity="danger" size="small"
                                             *ngIf="stage.etat !== 'VALIDE' && stage.etat !== 'ANNULE' && stage.etat !== 'NON_VALIDE'"
                                             (click)="confirmCancellation(stage)" 
                                             pTooltip="Annuler le stage" />
                                    
                                    <div *ngIf="stage.etat === 'VALIDE'" class="flex flex-col items-center opacity-40">
                                        <i class="pi pi-lock text-[10px] mb-1"></i>
                                        <span class="text-[8px] font-black uppercase tracking-widest">Archivé</span>
                                    </div>

                                    <div *ngIf="stage.etat === 'ANNULE'" class="flex flex-col items-center opacity-40">
                                        <i class="pi pi-ban text-[10px] mb-1 text-red-500"></i>
                                        <span class="text-[8px] font-black uppercase tracking-widest text-red-500">Annulé</span>
                                    </div>

                                    <div *ngIf="stage.etat === 'NON_VALIDE'" class="flex flex-col items-center opacity-40">
                                        <i class="pi pi-times-circle text-[10px] mb-1 text-red-500"></i>
                                        <span class="text-[8px] font-black uppercase tracking-widest text-red-500">Refusé</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="py-32 text-center">
                                <div class="flex flex-col items-center justify-center">
                                    <div class="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                        <i class="pi pi-inbox text-5xl text-slate-200 dark:text-slate-700"></i>
                                    </div>
                                    <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2">Aucune donnée disponible</h3>
                                    <p class="text-slate-400 text-sm max-w-xs mx-auto">Le registre des stages est actuellement vide pour les critères sélectionnés.</p>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
             <!-- Date Modification Dialog -->
        <p-dialog [visible]="showDateDialog()" (onHide)="showDateDialog.set(false)" 
                  [showHeader]="false" [modal]="true" [style]="{width: '450px'}" 
                  styleClass="modern-dialog-clean p-0 overflow-hidden rounded-[2.5rem] shadow-2xl border-none">
            <div class="relative overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
                <!-- Header -->
                <div [ngClass]="selectedStage?.etat === 'VALIDE' ? 'from-slate-500 to-slate-700 dark:from-slate-700 dark:to-slate-900' : 'from-blue-600 to-indigo-900'"
                     class="bg-gradient-to-br p-8 text-white relative">
                    <div class="relative z-10">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3 mb-2">
                                <i [class]="selectedStage?.etat === 'VALIDE' ? 'pi pi-lock' : 'pi pi-calendar-plus'" class="text-xl"></i>
                                <h3 class="text-xl font-black tracking-tight">
                                    {{ selectedStage?.etat === 'VALIDE' ? 'Planning Verrouillé' : 'Ajustement du Planning' }}
                                </h3>
                            </div>
                            <button (click)="showDateDialog.set(false)" class="cursor-pointer w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                                <i class="pi pi-times text-xs"></i>
                            </button>
                        </div>
                        <p class="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">{{ selectedStage?.titreOffre }}</p>
                    </div>
                    <!-- Decorative circles -->
                    <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                <!-- Body -->
                <div class="p-10 space-y-8">
                    <div *ngIf="selectedStage?.etat === 'VALIDE'" 
                         class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl flex gap-3 items-start mb-2">
                        <i class="pi pi-exclamation-circle text-amber-500 mt-0.5"></i>
                        <p class="text-[11px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed uppercase tracking-wider">
                            Ce stage est validé. Les dates ne peuvent plus être modifiées pour garantir l'intégrité de l'attestation.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 gap-8" [ngClass]="{'opacity-60 pointer-events-none': selectedStage?.etat === 'VALIDE'}">
                        <div class="flex flex-col gap-3 group">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-500">
                                Date de début effective
                            </label>
                            <p-datepicker [(ngModel)]="newDateDebut" [showIcon]="true" appendTo="body" 
                                          styleClass="w-full modern-datepicker-v2"
                                          [readonlyInput]="selectedStage?.etat === 'VALIDE'" />
                        </div>
                        <div class="flex flex-col gap-3 group">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-500">
                                Date de fin prévue
                            </label>
                            <p-datepicker [(ngModel)]="newDateFin" [showIcon]="true" appendTo="body" 
                                          styleClass="w-full modern-datepicker-v2"
                                          [readonlyInput]="selectedStage?.etat === 'VALIDE'" />
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="px-10 py-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                    <p-button label="Fermer" (click)="showDateDialog.set(false)" [text]="true" severity="secondary" styleClass="font-bold text-xs uppercase tracking-widest" />
                    <p-button *ngIf="selectedStage?.etat !== 'VALIDE'" 
                             label="Sauvegarder" icon="pi pi-check" (click)="saveDates()" 
                             styleClass="bg-blue-600 hover:bg-blue-700 border-none rounded-2xl px-10 py-4 font-black shadow-lg shadow-blue-500/20 text-xs uppercase tracking-widest" />
                </div>
            </div>
        </p-dialog>

        <!-- Documents View Dialog -->
        <p-dialog [visible]="showDocsDialog()" (onHide)="showDocsDialog.set(false)" 
                  [showHeader]="false" [modal]="true" [style]="{width: '650px'}" 
                  styleClass="modern-dialog-clean p-0 overflow-hidden rounded-[2.5rem] shadow-2xl border-none">
            <div class="relative overflow-hidden bg-white dark:bg-slate-900">
                <!-- Header -->
                <div class="bg-blue-600 p-8 text-white relative">
                    <div class="relative z-10 flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-black tracking-tight mb-1">Porte-documents</h3>
                            <p class="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">
                                {{ selectedStage?.firstName }} {{ selectedStage?.lastName }}
                            </p>
                        </div>
                        <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <i class="pi pi-folder-open text-xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Body -->
                <div class="p-10">
                    <div *ngIf="loadingDocs()" class="flex flex-col items-center justify-center py-10 gap-4">
                        <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
                        <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Récupération des fichiers...</span>
                    </div>
                    
                    <div *ngIf="!loadingDocs() && stageDocuments().length === 0" class="text-center py-16">
                        <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="pi pi-file text-2xl text-slate-200 dark:text-slate-700"></i>
                        </div>
                        <p class="text-slate-400 font-bold">Aucun document n'a encore été déposé.</p>
                    </div>

                    <div *ngIf="!loadingDocs() && stageDocuments().length > 0" class="space-y-4">
                        <div *ngFor="let doc of stageDocuments()" 
                             class="group p-5 bg-slate-50/50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
                            <div class="flex items-center gap-5">
                                <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 shadow-sm"
                                     [ngClass]="getDocumentIconColor(doc.type)">
                                    <i [class]="getDocumentIcon(doc.type)" class="text-2xl"></i>
                                </div>
                                <div class="flex flex-col min-w-0">
                                    <h6 class="m-0 font-black text-slate-800 dark:text-slate-100 text-sm truncate max-w-[280px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {{ doc.fileName || doc.type }}
                                    </h6>
                                    <div class="flex items-center gap-2 mt-1.5">
                                        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">{{ doc.type }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div [pTooltip]="doc.validationEncadrant ? 'Document validé' : 'En attente de validation'"
                                     class="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                                     [ngClass]="doc.validationEncadrant ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'">
                                    <i [class]="doc.validationEncadrant ? 'pi pi-check-circle' : 'pi pi-clock'" class="text-sm"></i>
                                </div>
                                <button (click)="downloadDoc(doc)" 
                                        pTooltip="Télécharger"
                                        class="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-900 transition-all flex items-center justify-center shadow-sm">
                                    <i class="pi pi-download"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="px-10 py-6 text-center border-t border-slate-50 dark:border-slate-800">
                    <p-button label="Fermer" (click)="showDocsDialog.set(false)" [text]="true" severity="secondary" styleClass="font-bold" />
                </div>
            </div>
        </p-dialog>

        <p-confirmDialog />
        <p-toast />
    `,
    styles: [`
        :host ::ng-deep .modern-datepicker-v2 {
            width: 100%;
        }
        :host ::ng-deep .modern-datepicker-v2 .p-datepicker {
            border: none;
            box-shadow: none;
            background: transparent;
        }
        :host ::ng-deep .modern-datepicker-v2 input {
            width: 100%;
            border-radius: 1.25rem;
            padding: 1rem 1.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            border: 2px solid #f1f5f9;
            background: #f8fafc;
            color: #1e293b;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dark :host ::ng-deep .modern-datepicker-v2 input {
            border-color: #1e293b;
            background: #0f172a;
            color: #f8fafc;
        }
        :host ::ng-deep .modern-datepicker-v2 input:focus {
            border-color: #3b82f6;
            background: #ffffff;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
            transform: translateY(-1px);
        }
        .dark :host ::ng-deep .modern-datepicker-v2 input:focus {
            border-color: #60a5fa;
            background: #1e293b;
            box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.1);
        }
        :host ::ng-deep .p-datepicker:not(.p-datepicker-inline) {
            border-radius: 1.5rem;
            border: 1px solid #e2e8f0;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
            padding: 1.25rem;
        }
        .dark :host ::ng-deep .p-datepicker:not(.p-datepicker-inline) {
            border-color: #1e293b;
            background: #0f172a;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        /* DatePicker Panel Internals */
        :host ::ng-deep .p-datepicker .p-datepicker-header {
            background: transparent;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 1rem;
            margin-bottom: 1rem;
        }
        .dark :host ::ng-deep .p-datepicker .p-datepicker-header {
            border-bottom-color: #1e293b;
        }
        :host ::ng-deep .p-datepicker .p-datepicker-title {
            font-weight: 800;
            color: #1e293b;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .dark :host ::ng-deep .p-datepicker .p-datepicker-title {
            color: #f1f5f9;
        }
        :host ::ng-deep .p-datepicker table th {
            padding: 0.5rem;
            font-size: 0.75rem;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
        }
        :host ::ng-deep .p-datepicker table td {
            padding: 2px;
        }
        :host ::ng-deep .p-datepicker table td > span {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            transition: all 0.2s;
        }
        :host ::ng-deep .p-datepicker table td > span.p-highlight {
            background: #3b82f6;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .dark :host ::ng-deep .p-datepicker table td > span:not(.p-highlight):not(.p-disabled):hover {
            background: #1e293b;
            color: #3b82f6;
        }
        .dark :host ::ng-deep .p-datepicker .p-datepicker-prev,
        .dark :host ::ng-deep .p-datepicker .p-datepicker-next {
            color: #94a3b8;
            background: #1e293b;
            border-radius: 0.5rem;
        }
        /* Disable Table Hover in Dark Mode */
        .dark :host ::ng-deep .p-datatable-modern-clean .p-datatable-tbody > tr:hover {
            background-color: transparent !important;
        }
    `]
})
export class GestionStagesComponent implements OnInit {
    private stageService = inject(StageService);
    private documentService = inject(DocumentStageService);
    private userService = inject(UserService);
    private attestationService = inject(AttestationService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    stages = signal<Stage[]>([]);
    attestations = signal<Attestation[]>([]);
    selectedStage: Stage | null = null;
    stageDocuments = signal<DocumentStage[]>([]);
    
    currentDate = new Date();
    
    totalStages = computed(() => this.stages().length);
    pendingStages = computed(() => this.stages().filter(s => s.etat === 'ATT_VALIDATION_ENCADRANT').length);
    activeStages = computed(() => this.stages().filter(s => s.etat === 'EN_COURS').length);
    validatedStages = computed(() => this.stages().filter(s => s.etat === 'VALIDE').length);

    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
    
    showDateDialog = signal<boolean>(false);
    showDocsDialog = signal<boolean>(false);
    loadingDocs = signal<boolean>(false);

    newDateDebut: Date | null = null;
    newDateFin: Date | null = null;

    mappedStages = computed(() => {
        return this.stages();
    });

    async ngOnInit() {
        await this.loadAttestations();
        await this.loadStages();
    }

    async loadAttestations() {
        try {
            const user = this.userService.currentUser();
            let data: Attestation[];
            
            if (user?.role === 'Encadrant') {
                data = await this.attestationService.getAttestationsByEncadrant();
            } else {
                data = await this.attestationService.getAll();
            }
            
            this.attestations.set(data);
        } catch (err) {
            console.error('Error loading attestations', err);
        }
    }

    async loadStages() {
        try {
            const user = this.userService.currentUser();
            let data: Stage[];
            
            if (user?.role === 'Encadrant') {
                data = await this.stageService.getStagesEncadrant();
            } else {
                data = await this.stageService.getAllStages();
            }
            
            this.stages.set(data);
        } catch (err) {
            console.error('Error loading stages', err);
        }
    }

    getAttestation(stageId: number) {
        return this.attestations().find(a => a.stageId === stageId);
    }

    downloadAttestation(stage: Stage) {
        const att = this.getAttestation(stage.id);
        if (att && att.filePath) {
            this.attestationService.downloadFile(att.filePath, `attestation_${stage.utilisateurId}.pdf`);
        }
    }

    getStageSeverity(etat: EtatStage) {
        switch (etat) {
            case EtatStage.EN_COURS: return 'info';
            case EtatStage.ATT_VALIDATION_ENCADRANT: return 'warn';
            case EtatStage.VALIDE: return 'success';
            case EtatStage.NON_VALIDE: return 'danger';
            case EtatStage.ANNULE: return 'danger';
            case EtatStage.ACCEPTE: return 'secondary';
            default: return 'info';
        }
    }

    getDocumentTypeSeverity(type: string) {
        switch (type) {
            case 'PRESENTATION': return 'info';
            case 'CONVENTION': return 'success';
            case 'RAPPORT': return 'warn';
            default: return 'secondary';
        }
    }

    getDocumentIcon(type: string) {
        switch (type) {
            case 'CONVENTION': return 'pi pi-file-pdf';
            case 'RAPPORT': return 'pi pi-file-word';
            case 'PRESENTATION': return 'pi pi-file';
            default: return 'pi pi-file';
        }
    }

    getDocumentIconColor(type: string) {
        switch (type) {
            case 'CONVENTION': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
            case 'RAPPORT': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'PRESENTATION': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
            default: return 'text-slate-500 bg-slate-50 dark:bg-slate-900/20';
        }
    }

    openDateDialog(stage: Stage) {
        this.selectedStage = stage;
        this.newDateDebut = stage.dateDebut ? new Date(stage.dateDebut) : null;
        this.newDateFin = stage.dateFin ? new Date(stage.dateFin) : null;
        this.showDateDialog.set(true);
    }

    async saveDates() {
        if (!this.selectedStage || !this.newDateDebut || !this.newDateFin) return;
        try {
            const debutStr = this.newDateDebut.toISOString().split('T')[0];
            const finStr = this.newDateFin.toISOString().split('T')[0];
            await this.stageService.modifierDates(this.selectedStage.id, debutStr, finStr);
            this.messageService.add({ severity: 'success', summary: 'Dates modifiées', detail: 'Le planning du stage a été mis à jour.' });
            this.showDateDialog.set(false);
            this.loadStages();
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de modifier les dates.' });
        }
    }

    async viewDocuments(stage: Stage) {
        this.selectedStage = stage;
        this.showDocsDialog.set(true);
        this.loadingDocs.set(true);
        try {
            const docs = await this.documentService.getDocumentsByStage(stage.id);
            this.stageDocuments.set(docs);
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les documents.' });
        } finally {
            this.loadingDocs.set(false);
        }
    }

    downloadDoc(doc: DocumentStage) {
        if (doc.alfrescoNodeId && doc.fileName) {
            this.documentService.downloadFile(doc.alfrescoNodeId, doc.fileName);
        }
    }

    confirmValidation(stage: Stage) {
        this.confirmationService.confirm({
            message: `Vous êtes sur le point de valider officiellement le stage de ${stage.firstName} ${stage.lastName}. Cette action générera l'attestation de fin de stage. Continuer ?`,
            header: 'Clôture et Validation',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Valider le stage',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-success',
            accept: async () => {
                try {
                    await this.stageService.validerStage(stage.id);
                    this.messageService.add({ severity: 'success', summary: 'Stage Validé', detail: 'Le stage a été clôturé avec succès.' });
                    await this.loadStages();
                    await this.loadAttestations();
                } catch (err) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la validation.' });
                }
            }
        });
    }

    confirmInvalidation(stage: Stage) {
        this.confirmationService.confirm({
            message: `Confirmez-vous l'invalidation du stage de ${stage.firstName} ${stage.lastName} ? Cela réinitialisera son statut et supprimera toute attestation associée.`,
            header: 'Alerte Invalidation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: "Confirmer l'invalidation",
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            accept: async () => {
                try {
                    await this.stageService.invaliderStage(stage.id);
                    this.messageService.add({ severity: 'success', summary: 'Stage Invalidé', detail: 'Le stage est désormais marqué comme non valide.' });
                    await this.loadStages();
                    await this.loadAttestations();
                } catch (err) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'invalidation." });
                }
            }
        });
    }

    confirmCancellation(stage: Stage) {
        this.confirmationService.confirm({
            message: `Confirmez-vous l'annulation du stage de ${stage.firstName} ${stage.lastName} ? Cette action est irréversible.`,
            header: 'Annulation du stage',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: "Confirmer l'annulation",
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            accept: async () => {
                try {
                    await this.stageService.updateEtatStage(stage.id, EtatStage.ANNULE);
                    this.messageService.add({ severity: 'success', summary: 'Stage Annulé', detail: 'Le stage a été annulé avec succès.' });
                    await this.loadStages();
                } catch (err) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'annulation du stage." });
                }
            }
        });
    }
}
