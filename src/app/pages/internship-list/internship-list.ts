import { Component, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { RippleModule } from 'primeng/ripple';
import { InternshipService, InternshipOffer, InternshipApplication } from '@/app/services/internship.service';
import { CandidatureService } from '@/app/services/candidature.service';

import { TopbarWidget } from '../landing/components/topbarwidget.component';
import { FooterWidget } from '../landing/components/footerwidget';

@Component({
    selector: 'app-internship-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, InputTextModule, IconFieldModule, InputIconModule, DialogModule, FileUploadModule, ToastModule, FormsModule, RippleModule, TopbarWidget, FooterWidget],
    providers: [MessageService, CandidatureService],
    styles: [`
        .stage-card {
            transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.3s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .stage-card:hover {
            transform: translateY(-8px) scale(1.01);
            box-shadow: 0 30px 40px -15px rgba(6, 57, 112, 0.15);
        }
        
        @keyframes pulse-badge {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.06); filter: brightness(1.3); box-shadow: 0 0 15px rgba(255,255,255,0.4); }
        }
        @keyframes shimmer-badge {
            0% { transform: translateX(-150%) rotate(45deg); }
            100% { transform: translateX(200%) rotate(45deg); }
        }
        .badge-pulse {
            position: relative;
            overflow: hidden;
            animation: pulse-badge 3s ease-in-out infinite;
            display: inline-block;
        }
        .badge-pulse::after {
            content: "";
            position: absolute;
            top: -50%;
            left: -100%;
            width: 50%;
            height: 200%;
            background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
            transform: rotate(45deg);
            animation: shimmer-badge 4s infinite 1s;
        }
        ::ng-deep .modern-dialog {
            border-radius: 2rem !important;
            overflow: hidden;
            border: none !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        }
        ::ng-deep .modern-dialog .p-dialog-header {
            padding: 2rem 2rem 1rem 2rem !important;
            background: white !important;
        }
        ::ng-deep .modern-dialog .p-dialog-content {
            padding: 0 2rem 2rem 2rem !important;
            background: white !important;
        }
        ::ng-deep .modern-dialog .p-inputtext {
            transition: all 0.2s ease;
        }
        ::ng-deep .modern-dialog .p-inputtext:focus {
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
        }
    `],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div class="landing-wrapper overflow-hidden">
                <topbar-widget />

                <div class="px-6 lg:px-20 py-24 bg-slate-50 dark:bg-[#021427] min-h-screen">
                    <div class="text-center mb-16">
                        <h1 class="text-[#063970] dark:text-blue-300 font-bold mb-4 text-5xl">Gérer vos opportunités</h1>
                        <p class="text-gray-500 dark:text-blue-100/70 text-xl block max-w-2xl mx-auto">Explorez nos offres de stages détaillées et postulez en quelques clics.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div *ngFor="let offer of offers()" 
                             [ngClass]="offer.highlight ? 'bg-[#063970] dark:bg-blue-600 border-2 border-white/20 shadow-xl' : 'bg-white dark:bg-[#063970] border border-gray-100 dark:border-blue-800/40 shadow-md'"
                             class="stage-card p-10 rounded-3xl cursor-pointer transition-all">
                            
                            <div class="flex items-center justify-between mb-8">
                                <div [ngClass]="offer.highlight ? 'text-white' : 'text-[#063970] dark:text-blue-50'" class="text-2xl font-bold">{{offer.title}}</div>
                                <span 
                                    class="text-xs font-semibold py-1 px-3 rounded-full"
                                    [ngClass]="[
                                        offer.highlight ? 'badge-pulse bg-white/20 text-white' : '',
                                        !offer.highlight ? 'bg-green-100 dark:bg-green-400/20 text-green-700 dark:text-green-300' : ''
                                    ]">
                                    {{offer.badge}}
                                </span>
                            </div>

                            <div class="flex items-center gap-4 mb-6">
                                <div class="flex items-center gap-2 text-sm" [ngClass]="offer.highlight ? 'text-blue-200' : 'text-gray-500'">
                                    <i class="pi pi-map-marker"></i>
                                    {{offer.location}}
                                </div>
                                <div class="flex items-center gap-2 text-sm" [ngClass]="offer.highlight ? 'text-blue-200' : 'text-gray-500'">
                                    <i class="pi pi-calendar"></i>
                                    {{offer.duration}}
                                </div>
                            </div>

                            <p [ngClass]="offer.highlight ? 'text-blue-100' : 'text-gray-600 dark:text-blue-100/70'" class="leading-relaxed mb-8 text-lg">
                                {{offer.details || offer.desc}}
                            </p>

                            <ul class="list-none p-0 flex flex-col gap-4 mb-10">
                                <li *ngFor="let tech of offer.techs" 
                                    [ngClass]="offer.highlight ? 'text-white' : 'text-gray-700 dark:text-blue-100/80'"
                                    class="flex items-center gap-3">
                                    <i class="pi pi-check-circle text-xl" [ngClass]="offer.highlight ? 'text-white' : 'text-[#063970] dark:text-blue-400'"></i>
                                    <span>{{tech}}</span>
                                </li>
                            </ul>

                            <div *ngIf="getApplicationStatus(offer.title) as status" class="mt-auto">
                                <div class="flex flex-col gap-2">
                                    <span class="text-xs font-semibold" [ngClass]="offer.highlight ? 'text-blue-200/60' : 'text-gray-500 dark:text-blue-200/60'" class="uppercase tracking-wider">État de votre candidature</span>
                                    <p-tag [value]="status" [severity]="getStatusSeverity(status)" styleClass="w-full text-lg py-4 rounded-2xl shadow-sm" />
                                </div>
                            </div>

                            <div *ngIf="!getApplicationStatus(offer.title)" class="mt-auto flex gap-3">
                                <button pButton pRipple icon="pi pi-info-circle"
                                        [class]="offer.highlight ? '!bg-white/10 !text-white !border-white/30' : '!bg-slate-100 !text-slate-600 dark:!bg-slate-800' "
                                        class="p-4 rounded-2xl border-none font-bold transition-all"
                                        pTooltip="Plus d'infos"
                                        (click)="openDetailsDialog(offer)"></button>

                                <button pButton pRipple [label]="offer.highlight ? 'Postuler maintenant' : 'Postuler'" 
                                        [class]="offer.highlight ? '!bg-transparent !text-white !border-2 !border-white hover:!bg-white/10' : 'bg-[#063970] dark:bg-blue-400 text-white dark:text-surface-900 border-none hover:bg-blue-900 dark:hover:bg-blue-300'"
                                        class="flex-1 font-bold rounded-2xl py-4 transition-all text-lg"
                                        (click)="openApplyDialog(offer)"></button>
                            </div>
                        </div>
                    </div>
                </div>

                <footer-widget />
            </div>
        </div>

        <!-- Application Dialog Modernisé -->
        <p-dialog [(visible)]="applyDialog" 
                  [modal]="true" 
                  [draggable]="false"
                  [resizable]="false"
                  [dismissableMask]="true"
                  styleClass="modern-dialog"
                  [style]="{ width: 'min(550px, 95vw)' }">
            
            <ng-template pTemplate="header">
                <div class="flex flex-col gap-1">
                    <h5 class="m-0 text-2xl font-black text-slate-800 tracking-tight">Postuler à l'offre</h5>
                    <p class="text-xs text-slate-400 font-medium uppercase tracking-widest">{{ selectedOffer?.title }}</p>
                </div>
            </ng-template>

            <ng-template pTemplate="content">
                <div class="flex flex-col gap-6 py-6 px-2">
                    <!-- Section Infos Perso -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label for="firstName" class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Prénom</label>
                            <div class="relative">
                                <input id="firstName" type="text" pInputText [(ngModel)]="applicationForm.firstName" 
                                       placeholder="Votre prénom" class="w-full pl-10 h-12 border-slate-200 rounded-xl focus:ring-slate-800" />
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="lastName" class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nom</label>
                            <div class="relative">
                                <input id="lastName" type="text" pInputText [(ngModel)]="applicationForm.lastName" 
                                       placeholder="votre nom" class="w-full pl-10 h-12 border-slate-200 rounded-xl focus:ring-slate-800" />
                            </div>
                        </div>
                    </div>
                    
                    <div class="h-px bg-slate-100 my-2"></div>

                    <!-- Section Documents -->
                    <div class="flex flex-col gap-5">
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Curriculum Vitae (PDF)</label>
                            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#063970] transition-colors group">
                                <div class="w-12 h-12 rounded-xl bg-blue-100 text-[#063970] flex items-center justify-center text-xl shadow-sm">
                                    <i class="pi pi-file-pdf"></i>
                                </div>
                                <div class="flex-1 overflow-hidden">
                                    <p class="text-sm font-bold text-slate-800 truncate mb-0">{{ applicationForm.cvFile ? applicationForm.cvFile.name : 'Aucun fichier sélectionné' }}</p>
                                    <p class="text-[10px] text-slate-400 font-medium">Format PDF max. 5Mo</p>
                                </div>
                                <p-fileUpload mode="basic" [name]="'cv'" chooseLabel="Choisir" 
                                              (onSelect)="onFileSelect($event, 'cv')" accept=".pdf" [maxFileSize]="5000000"
                                              styleClass="p-button-sm p-button-outlined shadow-none" />
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Lettre de Motivation</label>
                            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#063970] transition-colors group">
                                <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shadow-sm">
                                    <i class="pi pi-file"></i>
                                </div>
                                <div class="flex-1 overflow-hidden">
                                    <p class="text-sm font-bold text-slate-800 truncate mb-0">{{ applicationForm.letterFile ? applicationForm.letterFile.name : 'Aucun fichier sélectionné' }}</p>
                                    <p class="text-[10px] text-slate-400 font-medium">Format PDF/Word max. 5Mo</p>
                                </div>
                                <p-fileUpload mode="basic" [name]="'letter'" chooseLabel="Choisir" 
                                              (onSelect)="onFileSelect($event, 'letter')" accept=".pdf,.doc,.docx" [maxFileSize]="5000000"
                                              styleClass="p-button-sm p-button-outlined shadow-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="footer">
                <div class="flex items-center justify-between w-full p-4 border-t border-slate-50 bg-slate-50/50 rounded-b-3xl">
                    <p-button label="Plus tard" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="applyDialog = false" />
                    <p-button label="Envoyer ma candidature" 
                             icon="pi pi-send"
                             [disabled]="!isFormValid() || isSubmitting" 
                             (onClick)="submitApplication()" 
                             [loading]="isSubmitting" 
                             styleClass="!bg-slate-800 !border-none !rounded-xl !px-6 !py-3 !font-bold" />
                </div>
            </ng-template>
        </p-dialog>

        <!-- Details Dialog Moderne -->
        <p-dialog [(visible)]="detailsDialog" 
                  [modal]="true" 
                  [draggable]="false"
                  [resizable]="false"
                  [dismissableMask]="true"
                  styleClass="modern-dialog"
                  [style]="{ width: 'min(700px, 95vw)' }">
            
            <ng-template pTemplate="header">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-blue-50 text-[#063970] flex items-center justify-center text-2xl shadow-sm">
                        <i class="pi pi-briefcase"></i>
                    </div>
                    <div>
                        <h5 class="m-0 text-2xl font-black text-slate-800 tracking-tight">{{ selectedOffer?.title }}</h5>
                        <p-tag [value]="selectedOffer?.badge" severity="success" styleClass="text-[10px] font-black uppercase mt-1 px-3" />
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="content">
                <div class="flex flex-col gap-8 py-6">
                    <!-- Grid Content -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Left: Description -->
                        <div class="flex flex-col gap-4">
                            <h6 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <i class="pi pi-align-left"></i> Mission du stage
                            </h6>
                            <p class="text-slate-600 leading-relaxed font-medium">
                                {{ selectedOffer?.desc }}
                                <br><br>
                                En tant que stagiaire chez SIGA, vous intégrerez une équipe dynamique de développeurs experts. Vous participerez activement au cycle de vie complet de nos projets, de l'analyse des besoins jusqu'au déploiement.
                            </p>
                        </div>

                        <!-- Right: Techs & Details -->
                        <div class="flex flex-col gap-6">
                            <div class="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col gap-4">
                                <h6 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <i class="pi pi-code"></i> Stack Technique
                                </h6>
                                <div class="flex flex-wrap gap-2">
                                    <p-tag *ngFor="let tech of selectedOffer?.techs" [value]="tech" 
                                           styleClass="!bg-white !text-slate-700 !border !border-slate-200 !font-bold py-2 px-3 rounded-xl shadow-sm" />
                                </div>
                            </div>

                            <div class="flex flex-col gap-4 px-2">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-clock text-blue-500 font-bold"></i>
                                    <span class="text-sm font-bold text-slate-700">Durée : {{ selectedOffer?.duration }}</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-map-marker text-red-500 font-bold"></i>
                                    <span class="text-sm font-bold text-slate-700">Lieu : {{ selectedOffer?.location }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 bg-[#063970]/5 rounded-3xl border border-[#063970]/10 border-dashed">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#063970] shadow-sm">
                                <i class="pi pi-users"></i>
                            </div>
                            <span class="text-sm font-bold text-[#063970]">Stage pré-embauche : Opportunité de recrutement à la fin du stage.</span>
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="footer">
                <div class="flex items-center justify-between w-full p-4 border-t border-slate-50 bg-slate-50/50 rounded-b-3xl">
                    <p-button label="Fermer" [text]="true" severity="secondary" (onClick)="detailsDialog = false" />
                    <p-button label="Postuler à ce stage" 
                             icon="pi pi-arrow-right"
                             iconPos="right"
                             (onClick)="detailsDialog = false; openApplyDialog(selectedOffer)" 
                             styleClass="!bg-[#063970] !border-none !rounded-xl !px-6 !py-3 !font-bold" />
                </div>
            </ng-template>
        </p-dialog>

        <p-toast />
    `
})
export class InternshipList implements OnInit {
    offers!: Signal<InternshipOffer[]>;
    applications!: Signal<InternshipApplication[]>;
    
    applyDialog = false;
    detailsDialog = false;
    selectedOffer: any = null;
    isSubmitting = false;
    
    applicationForm = {
        firstName: '',
        lastName: '',
        cvFile: null as File | null,
        letterFile: null as File | null
    };

    constructor(
        private internshipService: InternshipService,
        private candidatureService: CandidatureService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.offers = this.internshipService.getOffers();
        this.applications = this.internshipService.getApplications();
    }

    onGlobalFilter(table: any, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getApplicationStatus(title: string): string | null {
        const app = this.applications().find(a => a.offerTitle === title);
        return app ? app.status : null;
    }

    getStatusSeverity(status: string) {
        switch (status) {
            case 'ACCEPTEE': return 'success';
            case 'REFUSEE': return 'danger';
            case 'EN_ATTENTE': return 'warn';
            default: return 'info';
        }
    }

    openApplyDialog(offer: any) {
        this.selectedOffer = offer;
        this.applicationForm = { firstName: '', lastName: '', cvFile: null, letterFile: null };
        this.applyDialog = true;
    }

    openDetailsDialog(offer: any) {
        this.selectedOffer = offer;
        this.detailsDialog = true;
    }

    onFileSelect(event: any, type: 'cv' | 'letter') {
        const file = event.files[0];
        if (file) {
            if (type === 'cv') this.applicationForm.cvFile = file;
            else this.applicationForm.letterFile = file;
        }
    }

    isFormValid() {
        return this.applicationForm.firstName.trim() && 
               this.applicationForm.lastName.trim() && 
               this.applicationForm.cvFile && 
               this.applicationForm.letterFile;
    }

    async submitApplication() {
        if (!this.selectedOffer) return;
        
        this.isSubmitting = true;
        try {
            await this.candidatureService.create(
                parseInt(this.selectedOffer.id),
                this.applicationForm.lastName,
                this.applicationForm.firstName,
                this.applicationForm.cvFile!,
                this.applicationForm.letterFile!
            );
            
            this.messageService.add({ 
                severity: 'success', 
                summary: 'Candidature envoyée', 
                detail: `Votre dossier pour "${this.selectedOffer.title}" a été transmis avec succès.`, 
                life: 5000 
            });
            
            this.applyDialog = false;
            // Optionally refresh applications if service has a list
            this.internshipService.fetchOffers(); 
        } catch (err) {
            console.error('Submit Error:', err);
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Erreur', 
                detail: 'Une erreur est survenue lors de l\'envoi de votre candidature.', 
                life: 5000 
            });
        } finally {
            this.isSubmitting = false;
        }
    }
}
