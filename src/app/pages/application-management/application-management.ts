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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InternshipApplication, InternshipService, InternshipOffer } from '../../services/internship.service';
import { User, UserService } from '../../services/user.service';
import { CandidatureService, CandidatureResponseDto } from '../../services/candidature.service';
import { AffectationService, EncadrantDTO } from '../../services/affectation.service';
import { TestAttemptService, TestAttemptResponse } from '../../services/test-attempt.service';
import { DocumentStageService } from '../../services/document-stage.service';

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
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService, UserService, CandidatureService, AffectationService, TestAttemptService, DocumentStageService],
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
                        <th class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4 text-center">Score Test</th>
                        <th class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4 text-center">Résultat Test</th>
                        <th pSortableColumn="encadrantId" class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4 text-center">Encadrant <p-sortIcon field="encadrantId" /></th>
                        <th pSortableColumn="status" class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4 text-center">Statut <p-sortIcon field="status" /></th>
                        <th class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4 text-center ">Actions</th>
                        <th class="text-slate-500 text-[11px] font-bold uppercase tracking-widest py-4 text-center">Supprimer</th>
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
                                <p-button icon="pi pi-file-pdf" [rounded]="true" [text]="true" severity="info" size="small"
                                    [pTooltip]="app.cvName && app.cvName !== 'N/A' ? 'Télécharger: ' + app.cvName : 'CV non disponible'"
                                    tooltipPosition="bottom"
                                    [disabled]="!app.cvNodeId"
                                    (onClick)="downloadDocument(app.cvNodeId!, app.cvName)" />
                                <p-button icon="pi pi-envelope" [rounded]="true" [text]="true" severity="secondary" size="small"
                                    [pTooltip]="app.letterName && app.letterName !== 'N/A' ? 'Télécharger: ' + app.letterName : 'Lettre non disponible'"
                                    tooltipPosition="bottom"
                                    [disabled]="!app.lettreNodeId"
                                    (onClick)="downloadDocument(app.lettreNodeId!, app.letterName)" />
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
                            <div class="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 border text-slate-700 font-bold text-xs" *ngIf="testScoresMap()[app.id]">
                                {{ testScoresMap()[app.id] }}%
                            </div>
                            <span *ngIf="!testScoresMap()[app.id]" class="text-[10px] text-slate-300">N/A</span>
                        </td>
                        <td class="text-center">
                            <p-button label="Voir" icon="pi pi-eye" [text]="true" size="small" (onClick)="showTestResults(app)" styleClass="text-xs" />
                        </td>
                        <td class="text-center">
                            <div class="flex flex-col items-center gap-1">
                                <span class="text-xs font-bold text-slate-700 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 flex items-center" *ngIf="app.utilisateurId && encadrantMap[app.utilisateurId]">
                                    <i class="pi pi-user mr-1 text-[10px]"></i> {{ encadrantMap[app.utilisateurId].encadrantNom }}
                                    <p-button icon="pi pi-spin pi-cog" [text]="true" [rounded]="true" size="small" pTooltip="Gérer l'affectation" tooltipPosition="top" (onClick)="openAssignDialog(app)" styleClass="ml-1 w-5 h-5 p-0" />
                                </span>
                                <p-button *ngIf="app.status === 'ACCEPTEE' && (!app.utilisateurId || !encadrantMap[app.utilisateurId])" 
                                    label="Affecter" icon="pi pi-plus-circle" [text]="true" size="small" 
                                    styleClass="text-[10px] font-bold text-orange-600 p-0" (onClick)="openAssignDialog(app)" />
                                <span *ngIf="app.status !== 'ACCEPTEE' && (!app.utilisateurId || !encadrantMap[app.utilisateurId])" class="text-[10px] text-slate-300 italic">Non spécifié</span>
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
                        <td class="text-center">
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="confirmDelete(app)" pTooltip="Supprimer" tooltipPosition="center" />
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Dialog d'affectation d'encadrant -->
        <p-dialog [(visible)]="assignmentDialog" [style]="{width: '450px'}" header="Affectation Encadrant" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-4 py-2">
                    <div class="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-2">
                        <div class="flex flex-col">
                            <span class="text-xs text-blue-600 font-bold uppercase tracking-wider">Candidat :</span>
                            <span class="font-black text-slate-800 text-lg">{{selectedApp?.firstName}} {{selectedApp?.lastName}}</span>
                        </div>
                    </div>

                    <div *ngIf="assignedEncadrantDTO" class="flex flex-col gap-3 animate-fadein">
                        <label class="text-sm font-bold text-slate-700">Encadrant Actuel</label>
                        <div class="flex items-center justify-between p-3 bg-white border border-green-200 rounded-xl">
                            <div class="flex items-center gap-3">
                                <i class="pi pi-check-circle text-green-500 text-xl"></i>
                                <span class="font-bold text-slate-800">{{ assignedEncadrantDTO.encadrantNom }}</span>
                            </div>
                            <p-button icon="pi pi-user-minus" severity="danger" [text]="true" pTooltip="Désaffecter" tooltipPosition="top" (onClick)="detachSupervisor()" />
                        </div>
                    </div>

                    <div *ngIf="!assignedEncadrantDTO" class="flex flex-col gap-2 animate-fadein">
                        <label for="supervisor" class="text-sm font-bold text-slate-700">Choisir un nouvel encadrant</label>
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
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <div class="flex justify-end gap-2 p-4 border-t border-slate-50">
                    <p-button label="Annuler" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="assignmentDialog = false" />
                    <p-button *ngIf="!assignedEncadrantDTO" label="Confirmer l'affectation" icon="pi pi-check" (onClick)="confirmAssignment()" [disabled]="!selectedSupervisorId" [loading]="loading()" />
                </div>
            </ng-template>
        </p-dialog>

        <!-- Dialog des resultats de test -->
        <p-dialog [(visible)]="testResultsDialog" [style]="{width: '800px'}" header="Resultats des Tests" [modal]="true" [draggable]="false">
            <div class="flex flex-col gap-0" style="max-height: 78vh; overflow-y: auto; padding: 0.25rem;">

                <!-- Candidate info banner -->
                <div *ngIf="selectedAppForTest" class="flex items-center gap-4 p-4 bg-gradient-to-r from-[#063970] to-[#1e4b8a] text-white rounded-xl mb-4">
                    <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-sm border border-white/20">
                        {{selectedAppForTest.firstName.charAt(0)}}{{selectedAppForTest.lastName.charAt(0)}}
                    </div>
                    <div class="flex flex-col">
                        <span class="font-black text-base">{{selectedAppForTest.firstName}} {{selectedAppForTest.lastName}}</span>
                        <span class="text-blue-200 text-xs font-medium">{{selectedAppForTest.offerTitle}}</span>
                    </div>
                </div>

                <!-- No results -->
                <div *ngIf="selectedTestResults.length === 0" class="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                    <i class="pi pi-file-edit text-4xl"></i>
                    <p class="text-sm font-medium">Aucun test passe pour cette candidature</p>
                </div>

                <!-- Attempt cards -->
                <div *ngFor="let attempt of selectedTestResults; let ai = index" class="mb-6 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">

                    <!-- Attempt summary header -->
                    <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-slate-50 border-b border-slate-100">
                        <div class="flex items-center gap-3">
                            <div class="w-7 h-7 rounded-full bg-[#063970] text-white flex items-center justify-center text-[10px] font-black">{{ai + 1}}</div>
                            <div class="flex flex-col">
                                <span class="text-xs font-black text-slate-600 uppercase tracking-wider">Tentative {{ai + 1}}</span>
                                <span class="text-[11px] text-slate-400 font-medium">
                                    <i class="pi pi-clock mr-1"></i>{{attempt.datePassage | date:'dd/MM/yyyy HH:mm:ss'}}
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex flex-col items-center">
                                <span class="text-[9px] text-slate-400 font-black uppercase tracking-wider">Score</span>
                                <span class="text-2xl font-black leading-none" [ngStyle]="{'color': getScoreColor(attempt.score)}">{{attempt.score}}%</span>
                            </div>
                            <p-tag [severity]="attempt.passed ? 'success' : 'danger'"
                                   [value]="attempt.passed ? 'REUSSI' : 'ECHOUE'"
                                   styleClass="font-black px-3 py-1 rounded-xl text-xs" />
                        </div>
                    </div>

                    <!-- Questions detail -->
                    <div class="divide-y divide-slate-50 bg-white">
                        <div *ngFor="let rep of attempt.reponses; let qi = index" class="px-5 py-4">
                            <div class="flex items-start gap-3">
                                <!-- Correct/wrong dot -->
                                <div class="flex-none mt-0.5 w-6 h-6 rounded-full flex items-center justify-center font-black"
                                     [ngClass]="rep.correcte ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'">
                                    <i class="pi" [ngClass]="rep.correcte ? 'pi-check' : 'pi-times'" style="font-size:0.6rem"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <!-- Question text -->
                                    <p class="m-0 text-sm font-bold text-slate-800 mb-3">Q{{qi + 1}}. {{rep.questionText}}</p>

                                    <!-- Propositions -->
                                    <div *ngIf="rep.propositions.length" class="flex flex-col gap-1.5 mb-3">
                                        <div *ngFor="let prop of rep.propositions"
                                             class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border"
                                             [ngClass]="rep.bonnesReponses.includes(prop) && rep.reponsesDonnees.includes(prop) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                        (!rep.bonnesReponses.includes(prop) && rep.reponsesDonnees.includes(prop)) ? 'bg-red-50 border-red-200 text-red-600' :
                                                        (rep.bonnesReponses.includes(prop) && !rep.reponsesDonnees.includes(prop)) ? 'bg-emerald-50/50 border-emerald-100 text-emerald-500' :
                                                        'bg-white border-slate-100 text-slate-500'">
                                            <i class="pi text-[10px]"
                                               [ngClass]="rep.bonnesReponses.includes(prop) ? 'pi-check-circle' :
                                                          (rep.reponsesDonnees.includes(prop) ? 'pi-times-circle' : 'pi-circle')"></i>
                                            <span class="flex-1">{{prop}}</span>
                                            <span *ngIf="rep.reponsesDonnees.includes(prop)" class="font-black text-[9px] uppercase tracking-wider opacity-60">Ma reponse</span>
                                            <span *ngIf="rep.bonnesReponses.includes(prop)" class="font-black text-[9px] uppercase tracking-wider text-emerald-600">Correcte</span>
                                        </div>
                                    </div>

                                    <!-- Free text answer -->
                                    <div *ngIf="!rep.propositions.length" class="flex flex-col gap-2 mb-3">
                                        <div class="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Reponse donnee</span>
                                            {{rep.reponsesDonnees.join(', ') || '(vide)'}}
                                        </div>
                                        <div *ngIf="rep.bonnesReponses.length" class="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                                            <span class="text-[9px] font-black text-emerald-600 uppercase tracking-wider block mb-1">Bonne reponse</span>
                                            {{rep.bonnesReponses.join(', ')}}
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
                <p-button label="Fermer" icon="pi pi-times" (onClick)="testResultsDialog = false" [outlined]="true" />
            </ng-template>
        </p-dialog>

        <p-confirmDialog />
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
    assignedEncadrantDTO: EncadrantDTO | null = null;
    encadrantMap: { [utilisateurId: string]: EncadrantDTO } = {};

    // Test Results
    testResultsDialog: boolean = false;
    selectedTestResults: TestAttemptResponse[] = [];
    selectedAppForTest: InternshipApplication | null = null;
    testScoresMap = signal<{[key: string]: number}>({});

    private cdr = inject(ChangeDetectorRef);

    constructor(
        public internshipService: InternshipService,
        private userService: UserService,
        private candidatureService: CandidatureService,
        private affectationService: AffectationService,
        private testAttemptService: TestAttemptService,
        private documentStageService: DocumentStageService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
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
            
            // Fetch test scores and encadrants safely
            const scores: {[key: string]: number} = {};
            const newEncadrantMap = { ...this.encadrantMap };
            
            await Promise.allSettled(mapped.map(async (app) => {
                try {
                    const results = await this.testAttemptService.getByCandidature(parseInt(app.id));
                    if (results && results.length > 0) {
                        const latest = results.reduce((prev: any, current: any) => (prev.id > current.id) ? prev : current);
                        scores[app.id] = latest.score;
                    }
                } catch (e) {
                    console.warn(`Could not fetch test results for candidature ${app.id}`);
                }
                
                if (app.utilisateurId) {
                    try {
                        const enc = await this.affectationService.getEncadrant(app.utilisateurId);
                        if (enc) newEncadrantMap[app.utilisateurId] = enc;
                    } catch (e) {}
                }
            }));
            
            this.testScoresMap.set(scores);
            setTimeout(() => {
                this.encadrantMap = newEncadrantMap;
            });
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
            cvName: dto.cvName || dto.cvNodeId || 'N/A',
            cvNodeId: dto.cvNodeId || '',
            letterName: dto.lettreMotivationName || dto.lettreMotivationNodeId || 'N/A',
            lettreNodeId: dto.lettreMotivationNodeId || '',
            status: (dto.etat === 'ACCEPTEE' || dto.etat === 'REFUSEE' || dto.etat === 'EN_ATTENTE') ? dto.etat as any : 'EN_ATTENTE',
            date: new Date(),
            iaScore: dto.scoreAI,
            iaApproved: dto.approvedByAI,
            encadrantId: user ? user.encadrantId : undefined,
            utilisateurId: dto.utilisateurId?.toString()
        };
    }

    downloadDocument(nodeId: string, fileName: string) {
        if (!nodeId || nodeId === 'N/A') return;
        this.documentStageService.downloadFile(nodeId, fileName);
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

    confirmDelete(app: InternshipApplication) {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer la candidature de ${app.firstName} ${app.lastName} ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-info-circle',
            accept: async () => {
                this.loading.set(true);
                try {
                    await this.candidatureService.delete(parseInt(app.id));
                    await this.loadApplications();
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Candidature supprimée avec succès' });
                } catch (err) {
                    console.error('Erreur lors de la suppression', err);
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression' });
                } finally {
                    this.loading.set(false);
                }
            }
        });
    }

    async openAssignDialog(app: InternshipApplication) {
        this.selectedApp = app;
        this.selectedSupervisorId = null;
        this.assignedEncadrantDTO = null;

        let enc = null;
        if (app.utilisateurId) {
            try {
                enc = await this.affectationService.getEncadrant(app.utilisateurId);
            } catch (err) {}
        }

        setTimeout(() => {
            this.assignedEncadrantDTO = enc;
            this.assignmentDialog = true;
        });
    }

    async detachSupervisor() {
        if (!this.selectedApp || !this.selectedApp.utilisateurId || !this.assignedEncadrantDTO) return;
        try {
            await this.affectationService.desaffecter(this.selectedApp.utilisateurId, this.assignedEncadrantDTO.encadrantId);
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Désaffectation réussie', life: 3000 });
            this.assignedEncadrantDTO = null;
            if (this.selectedApp.utilisateurId) {
                delete this.encadrantMap[this.selectedApp.utilisateurId];
            }
        } catch(err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la désaffectation', life: 3000 });
        }
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
            
            const enc = await this.affectationService.getEncadrant(stagiaireId);
            if (enc) {
                this.encadrantMap[stagiaireId] = enc;
            }
            this.assignmentDialog = false;
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de l'affectation" });
        }
    }

    async showTestResults(app: InternshipApplication) {
        this.selectedAppForTest = app;
        this.selectedTestResults = [];
        this.loading.set(true);
        try {
            this.selectedTestResults = await this.testAttemptService.getByCandidature(parseInt(app.id));
            this.testResultsDialog = true;
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de récupérer les résultats' });
        } finally {
            this.loading.set(false);
        }
    }
}
