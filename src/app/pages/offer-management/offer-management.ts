import { Component, OnInit, signal, ViewChild, Signal, inject, ChangeDetectorRef, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { InternshipService, InternshipOffer } from '@/app/services/internship.service';
import { TestService, TechnicalTest } from '@/app/services/test.service';
import { ExerciceService, Exercice } from '@/app/services/exercice.service';
import { QuestionService, Question } from '@/app/services/question.service';
import { CandidatureService } from '@/app/services/candidature.service';

import { TestCandidatePreviewComponent } from '../test-management/test-candidate-preview.component';

interface QuestionPrep {
    tempId: string;
    mode: 'new' | 'existing';
    existingQuestionId?: string;
    enonce?: string;
    typeQuestion?: 'QCU' | 'QCM' | 'TRUE_FALSE' | 'QUESTION_REPONSE';
    propositions?: { text: string; isCorrect: boolean }[];
    selectedTrueFalse?: string;
    reponseLibre?: string;
}

interface ExercicePrep {
    tempId: string;
    mode: 'new' | 'existing';
    titre?: string;
    existingExerciceId?: string;
    questions: QuestionPrep[];
    expanded?: boolean;
}

@Component({
    selector: 'app-offer-management',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        DatePickerModule,
        TextareaModule,
        InputNumberModule,
        TooltipModule,
        RadioButtonModule,
        DividerModule,
        CheckboxModule,
        SelectModule,
        TestCandidatePreviewComponent
    ],
    template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nouveau" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button label="Supprimer" icon="pi pi-trash" severity="secondary" [outlined]="true" (onClick)="deleteSelectedOffers()" [disabled]="!selectedOffers || !selectedOffers.length"  />
            </ng-template>
            <ng-template #end>
                <p-button label="Exporter" icon="pi pi-upload" severity="secondary" (onClick)="dt.exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="offers()"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['title', 'location', 'competencesRequises']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedOffers"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} offres"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0 text-2xl font-bold">Gestion des Offres de Stage</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Rechercher..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th pSortableColumn="title">Titre <p-sortIcon field="title" /></th>
                    <th pSortableColumn="location">Localisation <p-sortIcon field="location" /></th>
                    <th pSortableColumn="dureeStage">Durée <p-sortIcon field="dureeStage" /></th>
                    <th pSortableColumn="dateDebut">Début <p-sortIcon field="dateDebut" /></th>
                    <th pSortableColumn="dateFin">Fin <p-sortIcon field="dateFin" /></th>
                    <th pSortableColumn="statut">Statut <p-sortIcon field="statut" /></th>
                    <th pSortableColumn="testCount">Tests <p-sortIcon field="testCount" /></th>
                    <th class="text-center">Candidatures</th>
                    <th style="width: 8rem" class="text-center">Actions</th>
                </tr>
            </ng-template>
            <ng-template #body let-offer>
                <tr>
                    <td>
                        <p-tableCheckbox [value]="offer" />
                    </td>
                    <td [pTooltip]="offer.title" tooltipPosition="top">{{ truncateTitle(offer.title) }}</td>
                    <td>{{ offer.location }}</td>
                    <td>{{ internshipService.formatDuration(offer.dureeStage) }}</td>
                    <td>{{ offer.dateDebut | date:'dd/MM/yyyy' }}</td>
                    <td>
                        {{ offer.dateFin | date:'dd/MM/yyyy' }}
                        <p-tag *ngIf="isExpired(offer.dateFin)" value="Expiré" severity="danger" [rounded]="true" styleClass="text-[5px] font-black uppercase ml-1 px-1 py-0" />
                    </td>
                    <td>
                        <p-tag [value]="offer.statut === 'FERME' ? 'Fermé' : 'Ouvert'" [severity]="offer.statut === 'FERME' ? 'danger' : 'success'" [rounded]="true" styleClass="font-black uppercase text-[10px]" />
                    </td>
                    <td>
                        <div class="flex items-center gap-2">
                            <p-button icon="pi pi-plus" [text]="true" [rounded]="true" size="small" [style]="{ 'color': '#C0C0C0' }" (onClick)="openAddTestChoice(offer)" pTooltip="Gérer les tests" tooltipPosition="top" />
                            <button 
                            pButton
                            type="button"
                            class="p-button p-button-outlined p-button-secondary flex items-center gap-2"
                            (click)="viewTests(offer)"
                            pTooltip="Voir les tests associés"
                            size="small"
                            tooltipPosition="top">

                            <i class="fa-regular fa-file-lines"></i>
                            <span>{{ offer.testCount || 0 }}</span>
                            <span>tests</span>
</button>
                        </div>
                    </td>
                    <td class="text-center">
                        <p-button 
                            *ngIf="(offer.candidateCount || 0) > 0"
                            [label]="(offer.candidateCount || 0).toString()" 
                            icon="pi pi-users" 
                            [text]="true" 
                            size="small" 
                            styleClass="font-bold text-blue-600 hover:bg-blue-50 py-1"
                            (onClick)="viewApplications(offer)" 
                            pTooltip="Voir les candidatures"
                            tooltipPosition="top" />
                        <span *ngIf="(offer.candidateCount || 0) === 0" class="text-xs text-slate-300 italic">Aucune</span>
                    </td>
                    <td class="text-center">
                        <div class="flex gap-2 justify-center">
                            <p-button icon="pi pi-eye" [rounded]="true" [text]="true" (click)="viewOfferDetails(offer)" pTooltip="Voir plus" tooltipPosition="top" />
                            <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" (click)="editOffer(offer)" pTooltip="Modifier" tooltipPosition="top" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteOffer(offer)" pTooltip="Supprimer" tooltipPosition="top" />
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <!-- View Offer Details Dialog -->
        <p-dialog [(visible)]="viewOfferDialog" [style]="{ width: '700px' }" [header]="'Détails - ' + selectedOfferForView?.title" [modal]="true" class="custom-dialog">
            <div *ngIf="selectedOfferForView" class="flex flex-col gap-6 pt-2">
                <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-2xl bg-[#063970] text-white flex items-center justify-center shadow-lg">
                            <i class="pi pi-briefcase text-3xl"></i>
                        </div>
                        <div>
                            <h2 class="text-2xl font-black text-slate-800 dark:text-slate-100 m-0">{{ selectedOfferForView.title }}</h2>
                            <div class="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
                                <i class="pi pi-map-marker"></i>
                                {{ selectedOfferForView.location }}
                            </div>
                        </div>
                    </div>
                    <p-tag [value]="isExpired(selectedOfferForView.dateFin) ? 'Fermé' : (selectedOfferForView.badge || 'Ouvert')" 
                           [severity]="isExpired(selectedOfferForView.dateFin) ? 'danger' : 'info'" 
                           [rounded]="true" styleClass="px-4 py-1.5 font-black uppercase text-[10px]" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <div class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <i class="pi pi-calendar text-blue-500"></i> Date de début
                        </div>
                        <div class="text-slate-800 dark:text-slate-200 font-bold">{{ selectedOfferForView.dateDebut | date:'dd MMMM yyyy' }}</div>
                    </div>
                    <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <div class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <i class="pi pi-calendar-times text-indigo-500"></i> Date de fin
                        </div>
                        <div class="text-slate-800 dark:text-slate-200 font-bold">{{ selectedOfferForView.dateFin | date:'dd MMMM yyyy' }}</div>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <h5 class="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                        <i class="pi pi-align-left text-blue-500"></i> Mission & Détails
                    </h5>
                    <div class="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 leading-relaxed text-sm whitespace-pre-wrap">
                        {{ selectedOfferForView.details || selectedOfferForView.desc || 'Aucune description détaillée.' }}
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <h5 class="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                        <i class="pi pi-bolt text-amber-500"></i> Compétences Clés
                    </h5>
                    <div class="flex flex-wrap gap-2 mt-1">
                        <span *ngFor="let tech of selectedOfferForView.techs" 
                              class="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-black border border-amber-100 dark:border-amber-800/50 uppercase tracking-wider shadow-sm">
                            {{ tech }}
                        </span>
                        <span *ngIf="!selectedOfferForView.techs || selectedOfferForView.techs.length === 0" class="text-slate-400 italic text-sm">Aucune compétence spécifiée.</span>
                    </div>
                </div>

                <div class="flex flex-col gap-3">
                    <h5 class="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] flex items-center gap-2 mb-1 cursor-pointer select-none" (click)="showTestsDetail.set(!showTestsDetail())">
                        <i [class]="showTestsDetail() ? 'pi pi-chevron-down text-indigo-500' : 'pi pi-chevron-right text-indigo-500'" class="transition-all duration-300"></i> 
                        Tests techniques
                    </h5>
                    <div *ngIf="showTestsDetail()" class="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div *ngFor="let t of viewingOfferTests()" 
                             [ngClass]="{'ring-2 ring-green-500/20 bg-green-50/30 border-green-200 dark:bg-green-900/10 dark:border-green-800': selectedOfferForView.selectedTestId === t.id}"
                             class="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm hover:border-indigo-200 transition-all duration-300 relative group">
                            
                            <!-- Highlight Badge for Active Test -->


                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors"
                                     [ngClass]="selectedOfferForView.selectedTestId === t.id ? 'bg-green-100 text-green-600' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'">
                                    <i class="pi pi-file"></i>
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ t.titre }}</span>
                                    <div class="flex items-center gap-2">
                                        <span class="text-[10px] text-slate-400 font-bold uppercase">{{ t.dureeMinutes }} minutes</span>
                                        <span *ngIf="selectedOfferForView.selectedTestId === t.id" class="text-[9px] text-green-600 font-black uppercase tracking-tighter">● Sélectionné</span>
                                    </div>
                                </div>
                            </div>
                            <p-button icon="pi pi-eye" [text]="true" [rounded]="true" size="small" (onClick)="previewTest(t)" pTooltip="Aperçu" 
                                      [styleClass]="selectedOfferForView.selectedTestId === t.id ? 'text-green-600' : ''" />
                        </div>
                        <div *ngIf="viewingOfferTests().length === 0" class="p-4 text-center bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 italic text-sm">
                            Aucun test associé à cette offre.
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mt-2">
                    <div class="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-800/50 text-blue-600 flex items-center justify-center">
                                <i class="pi pi-list"></i>
                            </div>
                            <span class="font-bold text-slate-700 dark:text-slate-300">Tests techniques</span>
                        </div>
                        <span class="font-black text-blue-600 dark:text-blue-400 text-xl">{{ selectedOfferForView.testCount || 0 }}</span>
                    </div>
                    <div class="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 flex items-center justify-center">
                                <i class="pi pi-users"></i>
                            </div>
                            <span class="font-bold text-slate-700 dark:text-slate-300">Candidatures</span>
                        </div>
                        <span class="font-black text-indigo-600 dark:text-indigo-400 text-xl">{{ selectedOfferForView.candidateCount || 0 }}</span>
                    </div>
                </div>
            </div>
            <ng-template #footer>
                <div class="flex justify-end gap-3 mt-4">
                    <p-button label="Modifier l'offre" icon="pi pi-pencil" [text]="true" (click)="viewOfferDialog.set(false); editOffer(selectedOfferForView!)" class="text-slate-500" />
                    <p-button label="Fermer" icon="pi pi-times" [style]="{'background-color':'#063970','border-color':'#063970'}" (click)="viewOfferDialog.set(false)" />
                </div>
            </ng-template>
        </p-dialog>

        <!-- Edit/New Offer Dialog -->
        <p-dialog [(visible)]="offerDialog" [style]="{ width: '600px' }" [breakpoints]="{ '1199px': '75vw', '575px': '90vw' }" header="Détails de l'offre de stage" [modal]="true" class="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4 pt-2">
                    <div class="flex gap-4">
                        <div class="flex-1">
                            <label for="title" class="block font-bold mb-2">Titre de l'offre</label>
                            <input type="text" pInputText id="title" [(ngModel)]="offer.title" required autofocus placeholder="Titre" [fluid]="true" />
                            <small class="text-red-500" *ngIf="submitted && !offer.title">Le titre est requis.</small>
                        </div>
                        <div class="flex-1">
                            <label for="location" class="block font-bold mb-2">Localisation</label>
                            <input type="text" pInputText id="location" [(ngModel)]="offer.location" placeholder="Localisation" [fluid]="true" />
                        </div>
                    </div>

                    <div>
                        <label for="description" class="block font-bold mb-2">Description</label>
                        <textarea id="description" pTextarea [(ngModel)]="offer.details" required rows="4" placeholder="Description détaillée" [fluid]="true"></textarea>
                        <small class="text-red-500" *ngIf="submitted && !offer.details">La description est requise.</small>
                    </div>

                    <div>
                        <label for="competences" class="block font-bold mb-2">Compétences</label>
                        <input type="text" pInputText id="competences" [(ngModel)]="offer.competencesRequises" placeholder="Compétences" [fluid]="true" />
                    </div>

                    <div>
                        <label for="dureeStage" class="block font-bold mb-2">Durée du stage (en mois)</label>
                        <p-inputnumber id="dureeStage" [(ngModel)]="offer.dureeStage" [min]="1" [max]="36" [showButtons]="true" [fluid]="true" placeholder="Ex: 6"></p-inputnumber>
                    </div>

                    <div>
                        <label for="dateDebut" class="block font-bold mb-2">Date début</label>
                        <p-datepicker id="dateDebut" [(ngModel)]="offer.dateDebut" dateFormat="dd/mm/yy" [showIcon]="true" appendTo="body" [fluid]="true" />
                    </div>

                    <div>
                        <label for="dateFin" class="block font-bold mb-2">Date fin</label>
                        <p-datepicker id="dateFin" [(ngModel)]="offer.dateFin" dateFormat="dd/mm/yy" [showIcon]="true" appendTo="body" [fluid]="true" />
                    </div>

                    <div>
                        <label for="statut" class="block font-bold mb-2">Statut</label>
                        <p-select id="statut" [(ngModel)]="offer.statut" [options]="statutOptions" optionLabel="label" optionValue="value" appendTo="body" [fluid]="true" placeholder="Sélectionner le statut"></p-select>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="hideDialog()" />
                <p-button label="Enregistrer" icon="pi pi-check" (click)="saveOffer()" [style]="{ 'background-color': '#063970', 'border-color': '#063970' }" />
            </ng-template>
        </p-dialog>

        <!-- Quick Add Test Dialog -->
        <p-dialog [(visible)]="testDialog" [style]="{ width: '500px' }" header="Ajouter un test technique" [modal]="true" class="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4 pt-2">
                    <p class="text-sm text-gray-600 mb-2">Ajout d'un test pour : <strong>{{ selectedOfferForTest?.title }}</strong></p>
                    
                    <div>
                        <label for="testTitle" class="block font-bold mb-2">Titre du test</label>
                        <input type="text" pInputText id="testTitle" [(ngModel)]="newTest.titre" required autofocus placeholder="Titre du test" [fluid]="true" />
                        <small class="text-red-500" *ngIf="testSubmitted && !newTest.titre">Le titre est requis.</small>
                    </div>

                    <div>
                        <label for="testDesc" class="block font-bold mb-2">Description</label>
                        <textarea id="testDesc" pTextarea [(ngModel)]="newTest.description" required rows="4" placeholder="Description du contenu..." [fluid]="true"></textarea>
                        <small class="text-red-500" *ngIf="testSubmitted && !newTest.description">La description est requise.</small>
                    </div>

                    <div>
                        <label for="testDuree" class="block font-bold mb-2">Durée (minutes)</label>
                        <p-inputnumber id="testDuree" [(ngModel)]="newTest.dureeMinutes" [min]="5" [max]="240" [showButtons]="true" [fluid]="true" placeholder="60" />
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="testDialog = false" />
                <p-button label="Créer le test" icon="pi pi-check" (click)="saveQuickTest()" [style]="{ 'background-color': '#063970', 'border-color': '#063970' }" />
            </ng-template>
        </p-dialog>

        <!-- View Associated Tests Dialog -->
        <p-dialog [(visible)]="viewTestsDialog" [style]="{ width: '750px' }" [header]="'Gestion des Tests - ' + selectedOfferForTest?.title" [modal]="true" class="custom-dialog">
            <div *ngIf="selectedOfferForTest" class="p-1">
                
                <!-- Current Selection Info Bar -->
                <div *ngIf="selectedOfferForTest" class="mb-6 mx-2 p-4 rounded-2xl bg-slate-50 text-slate-800 flex items-center justify-between border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#063970] border border-slate-100">
                            <i [class]="selectedOfferForTest.typeSelection === 'ALEATOIRE' ? 'pi pi-refresh' : 'pi pi-bullseye'" class="text-lg"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Stratégie de sélection</span>
                            <span class="font-bold text-sm tracking-wide">
                                {{ selectedOfferForTest.typeSelection === 'ALEATOIRE' ? 'Choix Aléatoire' : 'Sélection Manuelle' }}
                            </span>
                        </div>
                    </div>
                    
                    <div *ngIf="selectedOfferForTest.selectedTestId" class="flex items-center gap-3 pr-2">
                        <div class="h-8 w-[1px] bg-slate-100"></div>
                        <div class="flex flex-col items-end">
                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Test Actif</span>
                            <span class="font-black text-[#063970] text-xs uppercase">{{ getTestTitleById(selectedOfferForTest.selectedTestId) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Strategy Selection (Premium Cards) -->
                <div class="grid grid-cols-2 gap-4 mb-8 px-2">
                    <div *ngIf="selectedOfferForTest" (click)="selectedOfferForTest.typeSelection = 'ALEATOIRE'; updateOfferSelection()" 
                         [ngClass]="{'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20': selectedOfferForTest.typeSelection === 'ALEATOIRE'}"
                         class="cursor-pointer p-5 rounded-2xl border-2 border-slate-100 transition-all hover:border-blue-200 group relative overflow-hidden">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
                                <i class="pi pi-refresh text-xl"></i>
                            </div>
                            <div>
                                <h6 class="font-black text-slate-800 m-0">Choix Aléatoire</h6>
                                <p class="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1 opacity-70">Rotation automatique</p>
                            </div>
                        </div>
                    </div>

                    <div *ngIf="selectedOfferForTest" (click)="selectedOfferForTest.typeSelection = 'MANUEL'; updateOfferSelection()" 
                         [ngClass]="{'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20': selectedOfferForTest.typeSelection === 'MANUEL'}"
                         class="cursor-pointer p-5 rounded-2xl border-2 border-slate-100 transition-all hover:border-indigo-200 group relative overflow-hidden">

                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-600 transition-transform group-hover:scale-110">
                                <i class="pi pi-bullseye text-xl"></i>
                            </div>
                            <div>
                                <h6 class="font-black text-slate-800 m-0">Test Spécifique</h6>
                                <p class="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1 opacity-70">Sélection manuelle</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tests List Header with Add Button -->
                <div class="flex items-center justify-between mb-4 px-2">
                    <h5 class="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 m-0">
                        <i class="pi pi-list text-blue-500"></i>
                        Liste des tests associés
                    </h5>
                </div>

                <p-table [value]="associatedTests()" [tableStyle]="{ 'min-width': '100%' }" class="p-fluid">
                    <ng-template #header>
                        <tr class="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest border-0">
                            <th style="width: 4rem" *ngIf="selectedOfferForTest && selectedOfferForTest.typeSelection === 'MANUEL'" class="bg-transparent"></th>
                            <th class="bg-transparent">Titre du Test</th>
                            <th style="width: 8rem" class="bg-transparent text-center">Durée</th>
                            <th style="width: 9rem" class="bg-transparent text-right pr-4">Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr>
                            <td [attr.colspan]="selectedOfferForTest.typeSelection === 'MANUEL' ? 4 : 3" class="text-center p-8 text-slate-400 italic">
                                <div class="flex flex-col items-center gap-2">
                                    <i class="pi pi-inbox text-3xl opacity-20"></i>
                                    <span>Aucun test associé ou chargement...</span>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template #body let-t>
                        <tr *ngIf="selectedOfferForTest" [ngClass]="{'bg-indigo-50/40': selectedOfferForTest.selectedTestId === t.id && selectedOfferForTest.typeSelection === 'MANUEL'}"
                            class="border-b border-slate-50 transition-colors">
                            <td *ngIf="selectedOfferForTest && selectedOfferForTest.typeSelection === 'MANUEL'" class="text-center">
                                <p-radiobutton [value]="t.id" [(ngModel)]="selectedOfferForTest.selectedTestId" (onClick)="updateOfferSelection()" />
                            </td>
                            <td>
                                <div class="flex flex-col">
                                    <span class="font-bold text-slate-800 text-sm">{{ t.titre }}</span>
                                    <span class="text-[10px] text-slate-400 line-clamp-1 italic">{{ t.description }}</span>
                                </div>
                            </td>
                            <td class="text-center">
                                <p-tag [value]="t.dureeMinutes + ' min'" severity="info" [rounded]="true" 
                                       styleClass="bg-slate-100 text-slate-600 border-none text-[10px] px-3 py-1 font-black" />
                            </td>
                            <td>
                                <div class="flex justify-end gap-1">
                                    <p-button icon="pi pi-eye" [text]="true" [rounded]="true" severity="info" (onClick)="previewTest(t)" 
                                              pTooltip="Prévisualiser" tooltipPosition="top" />
                                    <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" (onClick)="deleteTestFromOffer(t)" 
                                              pTooltip="Détacher de l'offre" tooltipPosition="top" />
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr>
                            <td [attr.colspan]="selectedOfferForTest.typeSelection === 'MANUEL' ? 4 : 3" class="text-center py-10">
                                <div class="flex flex-col items-center gap-2 opacity-30">
                                    <i class="pi pi-folder-open text-4xl"></i>
                                    <span class="text-xs font-bold uppercase tracking-widest">Aucun test associé</span>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
<ng-template #footer>
    <div class="flex items-center justify-end w-full px-2">
        <p-button 
            label="Associer un test" 
            icon="pi pi-plus" 
            [text]="true" 
            styleClass="text-slate-400 font-bold hover:text-slate-600"
            (onClick)="openAssignTest()"
        />
    </div>
</ng-template>
        </p-dialog>

        <!-- Test Choice Dialog -->
        <p-dialog [(visible)]="addTestChoiceDialog" [style]="{ width: '750px' }" header="Ajouter un test technique" [modal]="true">
            <div class="grid grid-cols-3 gap-4 py-4">
                <div (click)="openAssignTestFromChoice()" [class.opacity-50]="isGeneratingQuickIA" [class.pointer-events-none]="isGeneratingQuickIA"
                     class="cursor-pointer p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/20 transition-all flex flex-col items-center gap-4 group">
                    <div class="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
                        <i class="pi pi-list text-2xl"></i>
                    </div>
                    <div class="text-center">
                        <span class="font-black text-slate-800 text-sm block">Déjà créé</span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Associer existant</span>
                    </div>
                </div>

                <div (click)="openNewTestWizard()" [class.opacity-50]="isGeneratingQuickIA" [class.pointer-events-none]="isGeneratingQuickIA"
                     class="cursor-pointer p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all flex flex-col items-center gap-4 group">
                    <div class="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110">
                        <i class="pi pi-pencil text-2xl"></i>
                    </div>
                    <div class="text-center">
                        <span class="font-black text-slate-800 text-sm block">Nouveau test</span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Créer de zéro</span>
                    </div>
                </div>

                <div (click)="generateQuickTestIA()" [class.opacity-50]="isGeneratingQuickIA" [class.pointer-events-none]="isGeneratingQuickIA"
                     class="cursor-pointer p-6 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50/20 transition-all flex flex-col items-center gap-4 group relative">
                    <div class="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-110">
                        <i class="pi pi-bolt text-2xl" *ngIf="!isGeneratingQuickIA"></i>
                        <i class="pi pi-spinner pi-spin text-2xl" *ngIf="isGeneratingQuickIA"></i>
                    </div>
                    <div class="text-center">
                        <span class="font-black text-slate-800 text-sm block">Générer avec IA</span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Création automatique</span>
                    </div>
                </div>
            </div>
        </p-dialog>

        <!-- WIZARD: Nouveau Test (Same as Gestion Test) -->
        <p-dialog [(visible)]="testWizardDialog"
            [style]="{'width':'860px','max-width':'95vw'}"
            [header]="test.id ? 'Modifier le test' : 'Créer un nouveau test'"
            [modal]="true" [draggable]="false" class="p-fluid">
            <ng-template #content>
                <!-- Step indicator: Premium SIGA Navy Style -->
                <div class="flex items-center justify-center mb-10 pt-2 pb-6">
                    <div class="flex items-center relative gap-4">
                        <!-- Step 1 -->
                        <div class="flex flex-col items-center gap-2 z-10">
                            <div class="flex items-center justify-center w-10 h-10 rounded-full font-black text-sm transition-all duration-300 shadow-sm"
                                [style]="wizardStep===1?'background:#063970;color:white;transform:scale(1.1)':wizardStep>1?'background:#22c55e;color:white':'background:#f3f4f6;color:#9ca3af'">
                                <i *ngIf="wizardStep>1" class="pi pi-check text-xs"></i>
                                <span *ngIf="wizardStep<=1">1</span>
                            </div>
                            <span class="text-[11px] font-black uppercase tracking-widest transition-colors duration-300" 
                                  [style]="wizardStep===1?'color:#063970':'color:#9ca3af'">Informations du test</span>
                        </div>

                        <!-- Connector -->
                        <div class="w-24 h-[2px] mb-6 transition-colors duration-300" 
                             [style]="wizardStep>1?'background:#22c55e':'background:#f3f4f6'"></div>

                        <!-- Step 2 -->
                        <div class="flex flex-col items-center gap-2 z-10">
                            <div class="flex items-center justify-center w-10 h-10 rounded-full font-black text-sm transition-all duration-300 shadow-sm"
                                [style]="wizardStep===2?'background:#063970;color:white;transform:scale(1.1)':'background:#f3f4f6;color:#9ca3af'">
                                <span>2</span>
                            </div>
                            <span class="text-[11px] font-black uppercase tracking-widest transition-colors duration-300" 
                                  [style]="wizardStep===2?'color:#063970':'color:#9ca3af'">Exercices &amp; Questions</span>
                        </div>
                    </div>
                </div>

                <!-- ÉTAPE 1 -->
                <div *ngIf="wizardStep===1" class="flex flex-col gap-6 pt-4 w-full">
                    <div class="w-full">
                        <label class="block font-bold text-slate-800 mb-2">Titre du test</label>
                        <input type="text" pInputText [(ngModel)]="test.titre" autofocus placeholder="Ex : Test Angular Fondamentaux" [fluid]="true" />
                        <small class="text-red-500 font-bold mt-1 block" *ngIf="submitted&&!test.titre">Le titre est requis.</small>
                    </div>
                    <div class="w-full">
                        <label class="block font-bold text-slate-800 mb-2">Description</label>
                        <textarea pTextarea [(ngModel)]="test.description" rows="4" placeholder="Description du contenu du test" [fluid]="true"></textarea>
                        <small class="text-red-500 font-bold mt-1 block" *ngIf="submitted&&!test.description">La description est requise.</small>
                    </div>
                    <div class="grid grid-cols-2 gap-6 w-full">
                        <div class="flex flex-col">
                            <label class="block font-bold text-slate-800 mb-2">Durée (minutes)</label>
                            <p-inputnumber [(ngModel)]="test.dureeMinutes" [min]="5" [max]="240" [showButtons]="true" placeholder="60" [fluid]="true" />
                        </div>
                        <div class="flex flex-col" *ngIf="!selectedOfferForTest">
                            <label class="block font-bold text-slate-800 mb-2">Offre de stage</label>
                            <p-select [(ngModel)]="test.offerIds" [options]="offers()" optionLabel="title" optionValue="id" 
                                placeholder="Choisir une offre (Optionnel)" appendTo="body" [fluid]="true" [showClear]="true" />
                            <small class="text-blue-500 italic mt-1 font-bold">Le test peut être lié à une offre à la fois via ce menu.</small>
                        </div>
                        <div class="flex flex-col" *ngIf="selectedOfferForTest">
                            <label class="block font-bold text-slate-400 mb-2">Offre associée</label>
                            <div class="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 font-bold text-sm">
                                <i class="pi pi-briefcase mr-2 text-blue-500"></i>
                                {{ selectedOfferForTest.title }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ÉTAPE 2 -->
                <div *ngIf="wizardStep===2" class="flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <h6 class="m-0 font-bold text-gray-800">
                            <i class="pi pi-list-check mr-2" style="color:#063970"></i>
                            Exercices du test
                            <span class="ml-2 text-sm font-normal text-gray-500">({{ exercicesPrep.length }})</span>
                        </h6>
                        <p-button label="Ajouter un exercice" icon="pi pi-plus" size="small"
                            [style]="{'background-color':'#063970','border-color':'#063970'}"
                            (click)="openAddExerciceDialog()" />
                    </div>

                    <!-- Empty state -->
                    <div *ngIf="exercicesPrep.length===0"
                        class="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400">
                        <i class="pi pi-inbox text-4xl mb-3"></i>
                        <p class="text-sm font-medium m-0">Aucun exercice ajouté pour l'instant.</p>
                        <p class="text-xs m-0 mt-1">Cliquez sur "Ajouter un exercice" pour commencer.</p>
                    </div>

                    <!-- List -->
                    <div *ngFor="let ex of exercicesPrep; let exIdx=index"
                        class="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <!-- Header row -->
                        <div class="flex items-center gap-3 p-4 cursor-pointer select-none"
                            style="background:linear-gradient(to right,#f8faff,#fff)"
                            (click)="ex.expanded=!ex.expanded">
                            <div class="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold shrink-0"
                                style="background:#063970">{{ exIdx+1 }}</div>
                            <div class="flex-1 min-w-0">
                                <div class="font-semibold text-gray-800 truncate">{{ getExLabel(ex) }}</div>
                                <div class="text-xs text-gray-500 mt-0.5">
                                    {{ ex.questions.length }} question(s)
                                </div>
                            </div>
                            <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" size="small"
                                pTooltip="Supprimer" tooltipPosition="left"
                                (click)="$event.stopPropagation(); removeExercice(exIdx)" />
                            <i [class]="ex.expanded?'pi pi-chevron-down text-gray-400':'pi pi-chevron-right text-gray-400'"></i>
                        </div>

                        <!-- Questions panel -->
                        <div *ngIf="ex.expanded" class="border-t border-gray-100 p-4 bg-gray-50">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-sm font-semibold text-gray-700">
                                    <i class="pi pi-question-circle mr-1 text-BLUE-500"></i>Questions
                                </span>
                                <p-button label="Ajouter une question" icon="pi pi-plus" [text]="true" size="small"
                                    [style]="{'color':'#063970'}" (click)="openAddQuestionDialog(exIdx)" />
                            </div>
                            <div *ngIf="ex.questions.length===0"
                                class="text-center py-3 text-gray-400 text-sm italic">
                                Aucune question. Cliquez sur "Ajouter une question".
                            </div>
                            <div *ngFor="let q of ex.questions; let qIdx=index"
                                class="flex items-start gap-3 p-3 mb-2 bg-white rounded-lg border border-gray-100">
                                <span class="text-xs font-mono text-gray-400 mt-1 w-4">{{ qIdx+1 }}.</span>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap mb-1">
                                        <p-tag [value]="getQType(q)" severity="secondary" />
                                    </div>
                                    <div class="text-sm text-gray-800 font-medium">{{ getQLabel(q) }}</div>
                                    <!-- Propositions -->
                                    <div *ngIf="getQPropositions(q).length > 0" class="mt-1 text-xs text-gray-500 italic">
                                        <span *ngFor="let p of getQPropositions(q); let last = last">
                                            {{ p }}<span *ngIf="!last"> · </span>
                                        </span>
                                    </div>
                                    <!-- Réponse Correcte -->
                                    <div *ngIf="getQCorrectAnswer(q)" class="flex items-start gap-1 mt-1">
                                        <i class="pi pi-check-circle text-green-600 text-[10px] mt-1 shrink-0"></i>
                                        <span class="text-xs text-green-700 font-semibold">{{ getQCorrectAnswer(q) }}</span>
                                    </div>
                                </div>
                                <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" size="small"
                                    (click)="removeQuestion(exIdx,qIdx)" />
                            </div>
                        </div>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <div class="flex items-center justify-end gap-3 p-2">
                    <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="hideWizardDialog()" styleClass="text-slate-500 font-bold" />
                    
                    <!-- Étape 1 Footer -->
                    <p-button *ngIf="wizardStep===1" label="Enregistrer" icon="pi pi-check" [outlined]="true"
                        styleClass="border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                        pTooltip="Créer le test sans exercice" tooltipPosition="top"
                        (click)="saveWizard()" />
                    
                    <p-button *ngIf="wizardStep===1" label="Suivant : Exercices" icon="pi pi-arrow-right" iconPos="right"
                        styleClass="bg-[#063970] border-none font-bold px-6 py-3"
                        (click)="nextStep()" />

                    <!-- Étape 2 Footer -->
                    <p-button *ngIf="wizardStep===2" label="Précédent" icon="pi pi-arrow-left" [outlined]="true"
                         styleClass="border-slate-200 text-slate-700 font-bold" (click)="wizardStep=1" />

                    <p-button *ngIf="wizardStep===2" label="Enregistrer" icon="pi pi-check"
                        styleClass="bg-[#063970] border-none font-bold px-8"
                        (click)="saveWizard()" />
                </div>
            </ng-template>
        </p-dialog>

        <!-- SUB-DIALOG: Ajouter un Exercice -->
        <p-dialog [(visible)]="addExerciceDialog" [style]="{'width':'540px'}"
            header="Ajouter un exercice" [modal]="true" class="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-5 pt-2">
                    <div>
                        <label class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-4">Mode d'ajout</label>
                        <div class="grid grid-cols-2 gap-4">
                            <!-- New Exercise Card -->
                            <div (click)="exMode='new'" 
                                 [class]="exMode==='new' ? 'border-[#063970] bg-blue-50/30 ring-1 ring-[#063970]/30' : 'border-slate-100 bg-white hover:border-blue-200'"
                                 class="cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group">
                                <div [class]="exMode==='new' ? 'bg-[#063970] text-white shadow-lg shadow-blue-900/10' : 'bg-slate-50 text-slate-400'"
                                     class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                    <p-radiobutton name="exMode" value="new" [(ngModel)]="exMode" />
                                </div>
                                <div class="flex flex-col min-w-0">
                                    <span class="font-black text-slate-800 text-sm whitespace-nowrap">Nouvel exercice</span>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Créer un inédit</span>
                                </div>
                            </div>

                            <!-- Existing Exercise Card -->
                            <div (click)="exMode='existing'" 
                                 [class]="exMode==='existing' ? 'border-[#063970] bg-blue-50/30 ring-1 ring-[#063970]/30' : 'border-slate-100 bg-white hover:border-blue-200'"
                                 class="cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group">
                                <div [class]="exMode==='existing' ? 'bg-[#063970] text-white shadow-lg shadow-blue-900/10' : 'bg-slate-50 text-slate-400'"
                                     class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                    <p-radiobutton name="exMode" value="existing" [(ngModel)]="exMode" />
                                </div>
                                <div class="flex flex-col min-w-0">
                                    <span class="font-black text-slate-800 text-sm whitespace-nowrap">Exercice existant</span>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Réutiliser existant</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div *ngIf="exMode==='new'" class="w-full">
                        <label class="block font-bold mb-2">Titre de l'exercice</label>
                        <input type="text" pInputText [(ngModel)]="exTitre" placeholder="Ex : Composants Angular" [fluid]="true" />
                        <small class="text-red-500" *ngIf="submittedEx&&!exTitre.trim()">Le titre est requis.</small>
                    </div>
                    <div *ngIf="exMode==='existing'" class="w-full">
                        <label class="block font-bold mb-2">Choisir un exercice existant</label>
                        <p-select [(ngModel)]="exExistingId" [options]="exercices()" optionLabel="titre" optionValue="id"
                            placeholder="Sélectionner un exercice" appendTo="body" [filter]="true" filterBy="titre" [fluid]="true" />
                        <small class="text-red-500" *ngIf="submittedEx&&!exExistingId">Veuillez sélectionner un exercice.</small>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="addExerciceDialog=false" />
                <p-button label="Ajouter à ce test" icon="pi pi-check"
                    [style]="{'background-color':'#063970','border-color':'#063970'}"
                    (click)="confirmAddExercice()" />
            </ng-template>
        </p-dialog>

        <!-- SUB-DIALOG: Ajouter une Question -->
        <p-dialog [(visible)]="addQuestionDialog" [style]="{'width':'640px'}"
            header="Ajouter une question" [modal]="true" class="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-5 pt-2">
                    <div>
                        <label class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-4">Mode d'ajout</label>
                        <div class="grid grid-cols-2 gap-4">
                            <!-- New Question Card -->
                            <div (click)="qMode='new'" 
                                 [class]="qMode==='new' ? 'border-[#063970] bg-blue-50/30 ring-1 ring-[#063970]/30' : 'border-slate-100 bg-white hover:border-blue-200'"
                                 class="cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group">
                                <div [class]="qMode==='new' ? 'bg-[#063970] text-white shadow-lg shadow-blue-900/10' : 'bg-slate-50 text-slate-400'"
                                     class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                    <p-radiobutton name="qMode" value="new" [(ngModel)]="qMode" />
                                </div>
                                <div class="flex flex-col min-w-0">
                                    <span class="font-black text-slate-800 text-sm whitespace-nowrap">Nouvelle question</span>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Créer une inédite</span>
                                </div>
                            </div>

                            <!-- Existing Question Card -->
                            <div (click)="qMode='existing'" 
                                 [class]="qMode==='existing' ? 'border-[#063970] bg-blue-50/30 ring-1 ring-[#063970]/30' : 'border-slate-100 bg-white hover:border-blue-200'"
                                 class="cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group">
                                <div [class]="qMode==='existing' ? 'bg-[#063970] text-white shadow-lg shadow-blue-900/10' : 'bg-slate-50 text-slate-400'"
                                     class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                    <p-radiobutton name="qMode" value="existing" [(ngModel)]="qMode" />
                                </div>
                                <div class="flex flex-col min-w-0">
                                    <span class="font-black text-slate-800 text-sm whitespace-nowrap">Question existante</span>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Réutiliser existante</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Nouvelle question -->
                    <div *ngIf="qMode==='new'" class="flex flex-col gap-4 w-full">
                        <div class="w-full">
                            <label class="block font-bold mb-2">Énoncé</label>
                            <input type="text" pInputText [(ngModel)]="qEnonce" placeholder="Poser la question..." [fluid]="true" />
                            <small class="text-red-500" *ngIf="submittedQ&&!qEnonce.trim()">L'énoncé est requis.</small>
                        </div>
                        <div class="w-full">
                            <label class="block font-bold mb-2">Type de question</label>
                            <p-select [(ngModel)]="qType" [options]="typeQuestions" optionLabel="label" optionValue="value"
                                placeholder="Choisir le type" appendTo="body" [fluid]="true" />
                            <small class="text-red-500" *ngIf="submittedQ&&!qType">Le type est requis.</small>
                        </div>
                        <!-- QCU / QCM -->
                        <div *ngIf="qType==='QCM'||qType==='QCU'">
                            <div class="flex justify-between items-center mb-2">
                                <label class="font-bold m-0 text-xs">Propositions</label>
                                <p-button icon="pi pi-plus" label="Ajouter" [text]="true" size="small" (click)="addProp()" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <div *ngFor="let p of props; let i=index; trackBy:trackIdx" class="flex items-center gap-2">
                                    <p-radiobutton *ngIf="qType==='QCU'" [name]="'r'+i" [value]="true" [(ngModel)]="p.isCorrect" (onClick)="onRadio(i)" />
                                    <p-checkbox *ngIf="qType==='QCM'" [binary]="true" [(ngModel)]="p.isCorrect" />
                                    <input type="text" pInputText [(ngModel)]="p.text" placeholder="Option {{i+1}}" class="w-full text-sm" />
                                    <p-button icon="pi pi-trash" severity="danger" [text]="true" (click)="removeProp(i)" [disabled]="props.length<=2" />
                                </div>
                            </div>
                        </div>
                        <!-- TRUE_FALSE -->
                        <div *ngIf="qType==='TRUE_FALSE'">
                            <label class="block font-bold mb-2">Réponse correcte</label>
                            <p-select [options]="trueFalseOpts" [(ngModel)]="qTrueFalse" optionLabel="label" optionValue="value"
                                placeholder="Choisir" appendTo="body" />
                        </div>
                        <!-- QUESTION_REPONSE -->
                        <div *ngIf="qType==='QUESTION_REPONSE'">
                            <label class="block font-bold mb-2">Réponse correcte attendue</label>
                            <textarea pTextarea [(ngModel)]="qReponseLibre" rows="3" placeholder="Tapez la réponse attendue..."></textarea>
                        </div>
                    </div>

                    <!-- Question existante -->
                    <div *ngIf="qMode==='existing'">
                        <label class="block font-bold mb-2 text-sm">Choisir une question existante</label>
                         <p-select [(ngModel)]="qExistingId" [options]="questions()" optionLabel="enonce" optionValue="id"
                            placeholder="Sélectionner une question" appendTo="body" [filter]="true" filterBy="enonce" [fluid]="true">
                            <ng-template #item let-q>
                                <div class="flex items-center gap-2">
                                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">{{ q.typeQuestion }}</span>
                                    <span class="text-sm truncate">{{ q.enonce }}</span>
                                </div>
                            </ng-template>
                        </p-select>

                        <!-- Preview section for Existing Question -->
                        <div *ngIf="qExistingId" class="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Aperçu de la question</div>
                            <div class="text-sm font-bold text-slate-800 mb-3">{{ getQLabel({mode:'existing', existingQuestionId: qExistingId, tempId: ''}) }}</div>
                            
                            <!-- Propositions Preview -->
                            <div *ngIf="getQPropositions({mode:'existing', existingQuestionId: qExistingId, tempId: ''}).length > 0" class="flex flex-col gap-2 mb-3">
                                <div *ngFor="let p of getQPropositions({mode:'existing', existingQuestionId: qExistingId, tempId: ''})" class="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                                    <i class="pi pi-circle text-[8px] text-slate-300"></i>
                                    <span class="text-xs text-slate-600 font-medium">{{ p }}</span>
                                </div>
                            </div>

                            <!-- Correct Answer Preview -->
                            <div class="flex items-center gap-2 text-green-600">
                                <i class="pi pi-check-circle text-xs font-bold"></i>
                                <span class="text-xs font-black uppercase tracking-wider">Réponse :</span>
                                <span class="text-xs font-bold">{{ getQCorrectAnswer({mode:'existing', existingQuestionId: qExistingId, tempId: ''}) }}</span>
                            </div>
                        </div>
                        <small class="text-red-500 mt-1 block font-bold" *ngIf="submittedQ&&!qExistingId">Veuillez sélectionner une question.</small>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <div class="flex items-center justify-end gap-3 p-2">
                    <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="addQuestionDialog=false" styleClass="text-slate-500 font-bold" />
                    <p-button label="Ajouter à l'exercice" icon="pi pi-check"
                        styleClass="bg-[#063970] border-none font-bold px-6"
                        (click)="confirmAddQuestion()" />
                </div>
            </ng-template>
        </p-dialog>

        <!-- Preview Dialog -->
        <app-test-candidate-preview 
            [visible]="previewVisible" 
            [test]="selectedTestForPreview" 
            (onClosePreview)="previewVisible = false" />

        <!-- Assign Existing Test Dialog -->
        <p-dialog [(visible)]="assignTestDialog" [style]="{ width: '500px' }" header="Associer un test existant" [modal]="true">
            <div class="mb-4">
                <p-iconfield>
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" placeholder="Rechercher un test..." class="w-full" (input)="filterAvailableTests($event)" />
                </p-iconfield>
            </div>
            
            <div class="max-h-[400px] overflow-auto border border-slate-100 rounded-xl">
                <div *ngFor="let t of filteredTests" 
                     class="p-4 flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group"
                     (click)="assignExistingTest(t)">
                    <div class="flex flex-col">
                        <span class="font-bold text-slate-800">{{ t.titre }}</span>
                        <span class="text-xs text-slate-400 capitalize">{{ t.dureeMinutes }} minutes</span>
                    </div>
                    <p-button icon="pi pi-plus" [rounded]="true" [text]="true" size="small" />
                </div>
                <div *ngIf="filteredTests.length === 0" class="p-8 text-center text-slate-400 italic">
                    Aucun test disponible trouvé
                </div>
            </div>
            
            <div class="mt-6 flex flex-col gap-3">
                <div class="relative py-4 flex items-center gap-2">
                    <div class="flex-grow border-t border-slate-100"></div>
                    <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">Ou créer un nouveau</span>
                    <div class="flex-grow border-t border-slate-100"></div>
                </div>
                <p-button label="Créer un nouveau test" icon="pi pi-pencil" [outlined]="true" severity="secondary" 
                          styleClass="w-full text-[10px] font-black uppercase tracking-widest"
                          (onClick)="openNewTestWizard(); assignTestDialog = false" />
            </div>
        </p-dialog>

        <!-- View Applications Dialog -->
        <p-dialog [(visible)]="viewApplicationsDialog" [style]="{ width: '650px' }" [header]="'Candidatures - ' + selectedOfferForApps?.title" [modal]="true">
            <div class="flex flex-col gap-3 py-2">
                <div *ngIf="filteredApplications.length > 0; else noApps" class="flex flex-col gap-3">
                    <div *ngFor="let app of filteredApplications" class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all duration-300 shadow-sm group">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-2xl bg-[#063970] text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-900/10 group-hover:scale-105 transition-transform">
                                {{ app.prenom?.charAt(0) }}{{ app.nom?.charAt(0) }}
                            </div>
                            <div class="flex flex-col">
                                <span class="font-black text-slate-800 tracking-tight">{{ app.prenom }} {{ app.nom }}</span>
                                <div class="flex items-center gap-2 mt-1">
                                    <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-wider">
                                        <i class="pi pi-bolt text-[8px]"></i>
                                        Score IA: {{ app.scoreAI || 0 }}%
                                    </div>
                                    <div *ngIf="app.approvedByAI" class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider">
                                        <i class="pi pi-check-circle text-[8px]"></i>
                                        Approuvé
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <p-tag [value]="getStatusLabel(app.etat || app.status)" [severity]="getStatusSeverity(app.etat || app.status)" styleClass="text-[9px] font-black uppercase px-3 py-1.5 rounded-lg" />
                            <p-button icon="pi pi-chevron-right" [text]="true" [rounded]="true" size="small" (onClick)="goToApplications()" />
                        </div>
                    </div>
                </div>
                <ng-template #noApps>
                    <div class="p-8 text-center text-slate-400 italic">Aucune candidature pour cette offre.</div>
                </ng-template>
            </div>
            <ng-template #footer>
                <div class="flex justify-between items-center w-full px-2">
                    <p-button label="Gérer toutes les candidatures" icon="pi pi-external-link" [text]="true" size="small" styleClass="text-xs font-bold text-blue-600" (onClick)="goToApplications()" />
                    <p-button label="Fermer" icon="pi pi-times" [text]="true" (click)="viewApplicationsDialog = false" />
                </div>
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
        <p-toast />
    `,
    providers: [MessageService, ConfirmationService]
})
export class OfferManagement implements OnInit {
    @ViewChild('dt') dt!: Table;

    // ─── Signals ────────────────────────────────────────────────
    offers: Signal<InternshipOffer[]>;
    tests: Signal<TechnicalTest[]>;
    exercices: Signal<Exercice[]>;
    questions: Signal<Question[]>;

    // ─── Offer Management State ─────────────────────────────────
    offer: Partial<InternshipOffer> = {};
    selectedOffers: InternshipOffer[] | null = null;
    offerDialog: boolean = false;
    submitted: boolean = false;
    statutOptions = [
        { label: 'Ouvert', value: 'OUVERT' },
        { label: 'Fermé', value: 'FERME' }
    ];

    // ─── Test Management State (Legacy/Quick) ───────────────────
    testDialog: boolean = false;
    newTest: Partial<TechnicalTest> = {};
    testSubmitted: boolean = false;
    isGeneratingQuickIA: boolean = false;

    // ─── Advanced Test Wizard State ─────────────────────────────
    testWizardDialog = false;
    wizardStep = 1;
    test: Partial<TechnicalTest> = {};
    exercicesPrep: ExercicePrep[] = [];

    // ─── Sub-dialogs State ──────────────────────────────────────
    addExerciceDialog = false;
    exMode: 'new' | 'existing' = 'new';
    exTitre = '';
    exExistingId: string | null = null;
    submittedEx = false;

    addQuestionDialog = false;
    qMode: 'new' | 'existing' = 'new';
    qEnonce = '';
    qType = 'QCU';
    qTrueFalse = 'Vrai';
    qReponseLibre = '';
    qExistingId: string | null = null;
    props: { text: string; isCorrect: boolean }[] = [];
    submittedQ = false;
    targetExIdx = -1;

    // ─── Main View/Select State ─────────────────────────────────
    selectedOfferForTest: InternshipOffer | null = null;
    viewTestsDialog: boolean = false;
    assignTestDialog: boolean = false;
    addTestChoiceDialog: boolean = false;
    associatedTests = signal<TechnicalTest[]>([]);
    filteredTests: TechnicalTest[] = [];
    previewVisible: boolean = false;
    selectedTestForPreview: TechnicalTest | null = null;

    // Applications
    applications: Signal<any[]>;
    viewApplicationsDialog: boolean = false;
    selectedOfferForApps: InternshipOffer | null = null;
    filteredApplications: any[] = [];

    // View Details
    viewOfferDialog = signal(false);
    selectedOfferForView: InternshipOffer | null = null;
    viewingOfferTests = signal<TechnicalTest[]>([]);
    showTestsDetail = signal(false);

    // ─── Options ────────────────────────────────────────────────
    typeQuestions = [
        { label: 'Choix unique (QCU)', value: 'QCU' },
        { label: 'Choix multiple (QCM)', value: 'QCM' },
        { label: 'Vrai/Faux', value: 'TRUE_FALSE' },
        { label: 'Question/Réponse', value: 'QUESTION_REPONSE' }
    ];
    trueFalseOpts = [{ label: 'Vrai', value: 'Vrai' }, { label: 'Faux', value: 'Faux' }];

    public internshipService = inject(InternshipService);
    private testService = inject(TestService);
    private exerciceService = inject(ExerciceService);
    private questionService = inject(QuestionService);
    private candidatureService = inject(CandidatureService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        this.tests = this.testService.getTests();
        this.offers = computed(() => {
            const rawOffers = this.internshipService.getOffers()();
            const testsList = this.tests();
            return rawOffers.map(offer => ({
                ...offer,
                testCount: testsList.filter(t => t.offerIds?.includes(offer.id)).length
            }));
        });
        this.exercices = this.exerciceService.getExercices();
        this.questions = this.questionService.getQuestions();
        this.applications = this.internshipService.getApplications();
    }

    ngOnInit() { }

    async viewOfferDetails(offer: InternshipOffer) {
        this.selectedOfferForView = offer;
        this.viewingOfferTests.set([]);
        this.showTestsDetail.set(false);
        this.viewOfferDialog.set(true);

        try {
            const tests = await this.testService.getTestsByOffer(offer.id);
            this.viewingOfferTests.set(tests);
        } catch (err) {
            console.error('Error fetching tests for view', err);
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.offer = { statut: 'OUVERT', typeSelection: 'ALEATOIRE' };
        this.submitted = false;
        this.offerDialog = true;
    }

    editOffer(offer: InternshipOffer) {
        this.offer = {
            ...offer,
            dateDebut: (offer.dateDebut ? new Date(offer.dateDebut) : undefined) as any,
            dateFin: (offer.dateFin ? new Date(offer.dateFin) : undefined) as any
        };
        this.offerDialog = true;
    }

    deleteOffer(offer: InternshipOffer) {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer ' + offer.title + ' ?',
            header: 'Confirmer',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await this.internshipService.deleteOffer(offer.id);
                    this.messageService.add({
                        severity: 'success', summary: 'Succès', detail: 'Offre supprimée', life: 3000
                    });
                } catch (err) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression' });
                }
            }
        });
    }

    deleteSelectedOffers() {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer les offres sélectionnées ?',
            header: 'Confirmer',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const promises = this.selectedOffers?.map(o => this.internshipService.deleteOffer(o.id)) || [];
                    await Promise.all(promises);
                    this.selectedOffers = null;
                    this.messageService.add({
                        severity: 'success', summary: 'Succès', detail: 'Offres supprimées', life: 3000
                    });
                } catch (err) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression groupée' });
                }
            }
        });
    }

    hideDialog() {
        this.offerDialog = false;
        this.submitted = false;
    }

    saveOffer() {
        this.submitted = true;
        if (this.offer.title?.trim() && this.offer.details?.trim()) {
            const offerData: any = {
                ...this.offer,
                typeSelection: this.offer.typeSelection || 'ALEATOIRE',
                techs: this.offer.competencesRequises ? this.offer.competencesRequises.split(',').map((s: string) => s.trim()) : [],
                dateDebut: (this.offer.dateDebut as any) instanceof Date ? (this.offer.dateDebut as any).toISOString().split('T')[0] : this.offer.dateDebut,
                dateFin: (this.offer.dateFin as any) instanceof Date ? (this.offer.dateFin as any).toISOString().split('T')[0] : this.offer.dateFin,
                badge: 'Ouvert', cta: 'Postuler'
            };

            if (this.offer.id) {
                this.internshipService.updateOffer(offerData);
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Offre mise à jour', life: 3000 });
            } else {
                this.internshipService.addOffer(offerData);
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Offre créée', life: 3000 });
            }
            this.offerDialog = false;
            this.offer = {};
        }
    }
    async viewTests(offer: InternshipOffer) {
        this.selectedOfferForTest = offer;
        this.associatedTests.set([]);
        this.viewTestsDialog = true;

        try {
            // Refresh offer data to get latest selection state from server
            const refreshedOffer = await this.internshipService.getOfferById(offer.id);
            if (refreshedOffer) {
                this.selectedOfferForTest = refreshedOffer;
            }

            // Load associated tests
            const data = await this.testService.getTestsByOffer(offer.id);
            this.associatedTests.set(data);

            if (this.selectedOfferForTest && this.selectedOfferForTest.typeSelection === 'ALEATOIRE' && !this.selectedOfferForTest.selectedTestId && data.length > 0) {
                await this.updateOfferSelection(false);
            }
        } catch (err) {
            console.error('Error loading tests/offer', err);
        }
    }

    getTestTitleById(testId: string): string {
        return this.associatedTests().find(t => t.id === testId)?.titre || 'N/A';
    }

    async saveQuickTest() {
        this.testSubmitted = true;
        if (this.newTest.titre?.trim() && this.newTest.description?.trim()) {
            const savedQuickTest = await this.testService.addTest({
                titre: this.newTest.titre,
                description: this.newTest.description,
                dureeMinutes: this.newTest.dureeMinutes || 60,
                offerIds: this.newTest.offerIds || []
            });

            const currentCount = this.selectedOfferForTest!.testCount || 0;
            const nextCount = currentCount + 1;

            // Updated offer object
            const updatedOffer = {
                ...this.selectedOfferForTest!,
                testCount: nextCount
            };

            // Optimistic update
            await this.internshipService.updateOffer(updatedOffer);
            this.selectedOfferForTest!.testCount = nextCount;

            if (this.selectedOfferForTest!.typeSelection === 'ALEATOIRE') {
                await this.updateOfferSelection(false);
            }

            this.messageService.add({
                severity: 'success',
                summary: 'Test Créé',
                detail: 'Un nouveau test a été ajouté à ' + this.selectedOfferForTest?.title,
                life: 3000
            });

            this.testDialog = false;
            this.newTest = {};
        }
    }

    async generateQuickTestIA() {
        if (!this.selectedOfferForTest || !this.selectedOfferForTest.id) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucune offre sélectionnée.', life: 3000 });
            return;
        }

        this.messageService.add({ severity: 'info', summary: 'Génération', detail: 'L\'IA génère votre test, merci de patienter...', life: 5000 });
        this.isGeneratingQuickIA = true;
        try {
            await this.testService.generateFromOffre(this.selectedOfferForTest.id);

            // Re-fetch exercices and questions so they appear when user previews the generated test
            this.exerciceService.fetchExercices();
            this.questionService.fetchQuestions();

            const currentCount = this.selectedOfferForTest.testCount || 0;
            const nextCount = currentCount + 1;

            const updatedOffer = {
                ...this.selectedOfferForTest,
                testCount: nextCount
            };

            await this.internshipService.updateOffer(updatedOffer);
            this.selectedOfferForTest.testCount = nextCount;

            // Update associated tests local state if view is active
            const newTests = await this.testService.getTestsByOffer(this.selectedOfferForTest.id);
            this.associatedTests.set(newTests); // Sync with new tests directly if needed, or rely on existing state

            if (this.selectedOfferForTest.typeSelection === 'ALEATOIRE') {
                await this.updateOfferSelection(false);
            }

            this.messageService.add({
                severity: 'success',
                summary: 'Test Généré',
                detail: 'Un nouveau test a été généré par l\'IA et ajouté à ' + this.selectedOfferForTest.title,
                life: 3000
            });

            this.testDialog = false;
            this.addTestChoiceDialog = false; // Close the choice dialog
            this.newTest = {};
        } catch (err) {
            console.error('Erreur lors de la génération IA', err);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la génération du test par IA.', life: 3000 });
        } finally {
            this.isGeneratingQuickIA = false;
        }
    }

    openAddTestChoice(offer: InternshipOffer) {
        this.selectedOfferForTest = offer;
        this.addTestChoiceDialog = true;
    }

    openAssignTestFromChoice() {
        this.addTestChoiceDialog = false;
        this.openAssignTest();
    }

    openNewTestWizard() {
        this.test = {
            dureeMinutes: 60,
            offerIds: this.selectedOfferForTest ? [this.selectedOfferForTest.id] : []
        };
        this.wizardStep = 1;
        this.submitted = false;
        this.addTestChoiceDialog = false;
        this.testWizardDialog = true;
    }

    previewTest(test: TechnicalTest) {
        this.selectedTestForPreview = test;
        this.previewVisible = true;
    }

    async updateOfferSelection(showToast: boolean = true) {
        if (!this.selectedOfferForTest) return;

        try {
            if (this.selectedOfferForTest.typeSelection === 'ALEATOIRE') {
                const res = await this.internshipService.getRandomTest(this.selectedOfferForTest.id);
                if (res && res.id) {
                    this.selectedOfferForTest.selectedTestId = res.id.toString();
                } else {
                    this.selectedOfferForTest.selectedTestId = undefined;
                }
                if (showToast) {
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Test aléatoire sélectionné' });
                }
            } else if (this.selectedOfferForTest.typeSelection === 'MANUEL' && this.selectedOfferForTest.selectedTestId) {
                await this.internshipService.chooseTest(this.selectedOfferForTest.id, this.selectedOfferForTest.selectedTestId);
                if (showToast) {
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Test manuel sélectionné' });
                }
            }

            // Sync with backend via the main update endpoint
            await this.internshipService.updateOffer({ ...this.selectedOfferForTest });
        } catch (err) {
            console.error('Error updating offer selection', err);
            if (showToast) {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la mise à jour du test' });
            }
        }
    }

    deleteTestFromOffer(test: TechnicalTest) {
        if (!this.selectedOfferForTest) return;

        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment détacher ce test de cette offre ?',
            header: 'Confirmer le détachement',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    // Filter out this offer from the test's associations
                    const updatedOfferIds = (test.offerIds || []).filter(id => id !== this.selectedOfferForTest!.id);

                    // Update the test on backend (only removing this offer ID)
                    await this.testService.updateTest({
                        ...test,
                        offerIds: updatedOfferIds
                    });

                    // Update UI - Counter -1
                    const updatedOffer = {
                        ...this.selectedOfferForTest!,
                        testCount: Math.max(0, (this.selectedOfferForTest!.testCount || 0) - 1)
                    };

                    // Update global signal (for main table)
                    await this.internshipService.updateOffer(updatedOffer);

                    // Update local object for the dialog counter
                    this.selectedOfferForTest!.testCount = updatedOffer.testCount;

                    // Update local associated tests list (remove it from view)
                    this.associatedTests.update(tests => tests.filter(at => at.id !== test.id));

                    if (this.selectedOfferForTest!.typeSelection === 'ALEATOIRE') {
                        await this.updateOfferSelection(false);
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: `"${test.titre}" détaché de l'offre`,
                        life: 3000
                    });
                } catch (err) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Échec du détachement du test'
                    });
                }
            }
        });
    }

    openAssignTest() {
        if (!this.selectedOfferForTest) return;

        const allTests = this.testService.getTests()();
        this.filteredTests = allTests.filter((t: TechnicalTest) => !t.offerIds.includes(this.selectedOfferForTest!.id));
        this.assignTestDialog = true;
    }

    filterAvailableTests(event: Event) {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        const allTests = this.testService.getTests()();
        this.filteredTests = allTests.filter((t: TechnicalTest) =>
            !t.offerIds.includes(this.selectedOfferForTest!.id) &&
            (t.titre.toLowerCase().includes(query) || t.description.toLowerCase().includes(query))
        );
    }

    async assignExistingTest(test: TechnicalTest) {
        if (!this.selectedOfferForTest) return;

        const newOfferIds = [...(test.offerIds || [])];
        if (newOfferIds.includes(this.selectedOfferForTest.id)) {
            this.assignTestDialog = false;
            return;
        }

        newOfferIds.push(this.selectedOfferForTest.id);

        // --- INSTANT UI FEEDBACK ---
        const updatedTest = { ...test, offerIds: newOfferIds };

        // Calculate next count
        const currentCount = this.selectedOfferForTest.testCount || 0;
        const nextCount = currentCount + 1;

        // 1. Remove from selection list immediately 
        this.filteredTests = this.filteredTests.filter(t => t.id !== test.id);

        // 2. Add to associated tests list for the current modal view
        const currentAssociated = this.associatedTests();
        if (!currentAssociated.find(at => at.id === test.id)) {
            this.associatedTests.update(tests => [...tests, updatedTest]);
        }

        // 3. Update the main table counter instantly via Signal
        // 1. Update Test Association FIRST (Persistence)
        await this.testService.updateTest(updatedTest);

        // 2. Update Offer count SECOND (UI Sync)
        const updatedOffer = {
            ...this.selectedOfferForTest,
            testCount: nextCount
        };

        // Propagate changes to signals (Optimistic)
        await this.internshipService.updateOffer(updatedOffer);

        // Ensure local reference is updated for subsequent adds in same dialog session
        this.selectedOfferForTest.testCount = nextCount;

        if (this.selectedOfferForTest.typeSelection === 'ALEATOIRE') {
            await this.updateOfferSelection(false);
        }

        this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: `Le test "${test.titre}" a été associé.`,
            life: 2000
        });

        // Close dialog
        this.assignTestDialog = false;
    }

    // ─── Helpers (matching TestManagement) ───────────────────────
    getOfferName(offerId: string): string {
        return this.offers().find((o: InternshipOffer) => o.id === offerId)?.title ?? 'N/A';
    }
    getQuestionById(id: string): Question | undefined {
        return this.questions().find(q => q.id === id);
    }

    getQCorrectAnswer(q: QuestionPrep): string {
        if (q.mode === 'new') {
            const type = q.typeQuestion;
            if (type === 'QCU' || type === 'QCM') {
                const corrects = (q.propositions || []).filter(p => p.isCorrect).map(p => p.text).filter(t => t.trim());
                return corrects.length ? corrects.join(' · ') : '';
            } else if (type === 'TRUE_FALSE') {
                return q.selectedTrueFalse || '';
            } else if (type === 'QUESTION_REPONSE') {
                return q.reponseLibre ? q.reponseLibre.substring(0, 80) + (q.reponseLibre.length > 80 ? '…' : '') : '';
            }
        } else {
            const eq = this.getQuestionById(q.existingQuestionId!);
            if (eq) return (eq.reponsesCorrectes || []).join(' · ');
        }
        return '';
    }

    getQPropositions(q: QuestionPrep): string[] {
        if (q.mode === 'new') {
            return (q.propositions || []).map(p => p.text).filter(t => t.trim() !== '');
        } else {
            const eq = this.getQuestionById(q.existingQuestionId!);
            return eq ? (eq.propositions || []) : [];
        }
    }

    getExLabel(ex: ExercicePrep): string {
        if (ex.mode === 'new') return ex.titre || '(sans titre)';
        return this.exercices().find(e => e.id === ex.existingExerciceId)?.titre ?? 'Exercice inconnu';
    }
    getQLabel(q: QuestionPrep): string {
        if (q.mode === 'new') return q.enonce || '(sans énoncé)';
        return this.getQuestionById(q.existingQuestionId!)?.enonce ?? 'Question inconnue';
    }
    getQType(q: QuestionPrep): string {
        if (q.mode === 'new') return q.typeQuestion ?? '';
        return this.getQuestionById(q.existingQuestionId!)?.typeQuestion ?? '';
    }

    // ─── Wizard Methods ──────────────────────────────────────────
    hideWizardDialog() {
        this.testWizardDialog = false;
        this.test = {};
        this.exercicesPrep = [];
    }

    nextStep() {
        this.submitted = true;
        // Offer is optional
        if (this.test.titre?.trim() && this.test.description?.trim()) {
            this.wizardStep = 2;
            this.submitted = false;
        }
    }

    async saveWizard() {
        this.submitted = true;
        if (this.test.titre?.trim() && this.test.description?.trim()) {
            try {
                const savedTest = await this.testService.addTest({
                    titre: this.test.titre!,
                    description: this.test.description!,
                    dureeMinutes: this.test.dureeMinutes || 60,
                    offerIds: this.test.offerIds || []
                });

                const newTestId = savedTest.id;

                for (const exPrep of this.exercicesPrep) {
                    let exId = exPrep.existingExerciceId;
                    if (exPrep.mode === 'new') {
                        const newExId = await this.exerciceService.addExercice({
                            titre: exPrep.titre!,
                            testId: newTestId
                        });
                        exId = newExId;
                    }

                    // Save nested questions
                    for (const q of exPrep.questions) {
                        if (q.mode === 'new') {
                            const newQ: any = { enonce: q.enonce!, typeQuestion: q.typeQuestion!, exerciceId: exId };
                            if (q.typeQuestion === 'QCU' || q.typeQuestion === 'QCM') {
                                newQ.propositions = (q.propositions || []).map((p: any) => p.text);
                                newQ.reponsesCorrectes = (q.propositions || []).filter((p: any) => p.isCorrect).map((p: any) => p.text);
                            } else if (q.typeQuestion === 'TRUE_FALSE') {
                                newQ.propositions = ['Vrai', 'Faux'];
                                newQ.reponsesCorrectes = [q.selectedTrueFalse || 'Vrai'];
                            } else {
                                newQ.propositions = [];
                                newQ.reponsesCorrectes = [q.reponseLibre || ''];
                            }
                            await this.questionService.addQuestion(newQ);
                        } else {
                            const existingQ = this.getQuestionById(q.existingQuestionId!);
                            if (existingQ && exId) {
                                const currentExIds = existingQ.exerciceIds || [];
                                const updatedExIds = currentExIds.includes(exId) ? currentExIds : [...currentExIds, exId];
                                await this.questionService.updateQuestion({ ...existingQ, exerciceIds: updatedExIds });
                            }
                        }
                    }
                }

                this.exerciceService.fetchExercices();
                this.questionService.fetchQuestions();

                // Update UI - Count
                if (this.selectedOfferForTest) {
                    const currentCount = this.selectedOfferForTest.testCount || 0;
                    const nextCount = currentCount + 1;

                    const updatedOffer = {
                        ...this.selectedOfferForTest,
                        testCount: nextCount
                    };

                    // Update signal for main table
                    await this.internshipService.updateOffer(updatedOffer);

                    // Update local reference
                    this.selectedOfferForTest.testCount = nextCount;

                    // Update associated tests list if it is active
                    this.associatedTests.update(tests => [...tests, savedTest]);

                    if (this.selectedOfferForTest.typeSelection === 'ALEATOIRE') {
                        await this.updateOfferSelection(false);
                    }
                }

                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Test créé avec succès', life: 3000 });
                this.hideWizardDialog();
            } catch (err) {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la création du test' });
            }
        }
    }

    // ─── Exercise Dialog ────────────────────────────────────────
    openAddExerciceDialog() {
        this.exMode = 'new';
        this.exTitre = '';
        this.exExistingId = null;
        this.submittedEx = false;
        this.addExerciceDialog = true;
    }

    confirmAddExercice() {
        this.submittedEx = true;
        if (this.exMode === 'new' && !this.exTitre.trim()) return;
        if (this.exMode === 'existing' && !this.exExistingId) return;

        let autoQuestions: QuestionPrep[] = [];
        if (this.exMode === 'existing' && this.exExistingId) {
            const qs = this.questionService.getQuestionsByExercice(this.exExistingId);
            autoQuestions = qs.map(q => ({
                tempId: Math.random().toString(36).substring(7),
                mode: 'existing',
                existingQuestionId: q.id
            }));
        }

        this.exercicesPrep.push({
            tempId: Math.random().toString(36).substring(7),
            mode: this.exMode,
            titre: this.exTitre,
            existingExerciceId: this.exExistingId!,
            questions: autoQuestions,
            expanded: true
        });
        this.addExerciceDialog = false;
    }

    removeExercice(idx: number) {
        this.exercicesPrep.splice(idx, 1);
    }

    // ─── Question Dialog ────────────────────────────────────────
    openAddQuestionDialog(exIdx: number) {
        this.targetExIdx = exIdx;
        this.qMode = 'new';
        this.qEnonce = '';
        this.qType = 'QCU';
        this.qExistingId = null;
        this.props = [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false }
        ];
        this.submittedQ = false;
        this.addQuestionDialog = true;
    }

    confirmAddQuestion() {
        this.submittedQ = true;
        if (this.qMode === 'new' && !this.qEnonce.trim()) return;
        if (this.qMode === 'existing' && !this.qExistingId) return;

        const newQ: QuestionPrep = {
            tempId: Math.random().toString(36).substring(7),
            mode: this.qMode,
            enonce: this.qEnonce,
            typeQuestion: this.qType as any,
            existingQuestionId: this.qExistingId!,
            propositions: [...this.props],
            selectedTrueFalse: this.qTrueFalse,
            reponseLibre: this.qReponseLibre
        };

        this.exercicesPrep[this.targetExIdx].questions.push(newQ);
        this.addQuestionDialog = false;
    }

    removeQuestion(exIdx: number, qIdx: number) {
        this.exercicesPrep[exIdx].questions.splice(qIdx, 1);
    }

    addProp() {
        this.props.push({ text: '', isCorrect: false });
    }

    removeProp(idx: number) {
        this.props.splice(idx, 1);
    }

    onRadio(idx: number) {
        this.props.forEach((p: { text: string; isCorrect: boolean }, i: number) => p.isCorrect = (i === idx));
    }

    trackIdx(index: number) {
        return index;
    }

    getApplicationCount(offerTitle: string): number {
        return (this.applications() || []).filter(app => app.offerTitle === offerTitle).length;
    }

    async viewApplications(offer: InternshipOffer) {
        this.selectedOfferForApps = offer;
        this.filteredApplications = [];
        this.viewApplicationsDialog = true;
        
        try {
            const data = await this.candidatureService.getByOffre(parseInt(offer.id));
            this.filteredApplications = data;
            this.cdr.detectChanges(); // Fix NG0100: ExpressionChangedAfterItHasBeenCheckedError
        } catch (err) {
            console.error('Error fetching filtered applications', err);
            // Fallback to local filtering if server fails
            this.filteredApplications = (this.applications() || []).filter(app => app.offerTitle === offer.title);
        }
    }

    getStatusLabel(status: string) {
        switch (status) {
            case 'PENDING':
            case 'EN_ATTENTE': return 'En attente';
            case 'INTERVIEW': return 'Entretien';
            case 'ACCEPTED':
            case 'ACCEPTEE': return 'Accepté';
            case 'REJECTED':
            case 'REFUSEE': return 'Refusé';
            default: return status;
        }
    }

    truncateTitle(title: string): string {
        if (!title) return '';
        const words = title.split(' ');
        if (words.length <= 4) return title;
        return words.slice(0, 4).join(' ') + '...';
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'ACCEPTED':
            case 'ACCEPTEE': return 'success';
            case 'REJECTED':
            case 'REFUSEE': return 'danger';
            case 'PENDING':
            case 'EN_ATTENTE': return 'warn';
            case 'INTERVIEW': return 'info';
            default: return 'secondary';
        }
    }

    getScoreColor(score: number | undefined) {
        if (!score) return '#94a3b8';
        if (score >= 80) return '#22c55e';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    }

    goToApplications() {
        this.viewApplicationsDialog = false;
        this.router.navigate(['/pages/application-management']);
    }

    isExpired(dateFin: any): boolean {
        if (!dateFin) return false;
        const end = new Date(dateFin);
        const now = new Date();
        return end < now;
    }
}
