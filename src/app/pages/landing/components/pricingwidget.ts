import { Component, ElementRef, ViewChild, NgZone, OnInit, OnDestroy, AfterViewInit, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InternshipService, InternshipApplication, InternshipOffer } from '@/app/services/internship.service';
import { CandidatureService } from '@/app/services/candidature.service';

@Component({
    selector: 'pricing-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule, DialogModule, FileUploadModule, InputTextModule, ToastModule, TagModule, TableModule, FormsModule],
    providers: [MessageService, CandidatureService],
    styles: [`
        .stage-card {
            flex: 0 0 calc(100% - 2rem);
            scroll-snap-align: center;
            transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.3s ease;
        }
        @media (min-width: 1024px) {
            .stage-card {
                flex: 0 0 calc(33.333% - 1.35rem);
            }
        }
        .stage-card:hover {
            transform: translateY(-8px) scale(1.01);
            box-shadow: 0 30px 40px -15px rgba(6, 57, 112, 0.15);
        }
        
        .scroll-container {
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        .scroll-container::-webkit-scrollbar {
            display: none;
        }

        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.4s ease;
            background-color: #cbd5e1;
        }
        .dot.active {
            width: 28px;
            border-radius: 5px;
            background-color: #063970;
        }
        :global(.dark) .dot.active {
            background-color: #60a5fa;
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
        <div id="stage" class="py-16 px-6 lg:px-20 my-2 md:my-10 bg-slate-50 dark:bg-[#021427] transition-colors relative border border-transparent dark:border-blue-900/30 rounded-3xl lg:mx-20">
            <div class="text-center mb-16">
                <div class="text-[#063970] dark:text-blue-300 font-bold mb-4 text-5xl transition-colors">Offres de Stage</div>
                <span class="text-gray-500 dark:text-blue-100/70 text-xl block max-w-2xl mx-auto transition-colors">Rejoignez l'équipe SIGA et développez vos compétences au sein d'une entreprise leader en solutions informatiques.</span>
            </div>

            <div class="relative">
                <!-- Scrollable Container -->
                <div #scrollContainer 
                     (scroll)="onScroll()"
                     class="scroll-container flex flex-row gap-8 overflow-x-auto pb-8 snap-x p-4"
                     [style.scroll-behavior]="isSmooth ? 'smooth' : 'auto'">
                    
                    <!-- Triple clones to ensure infinite feel in both directions -->
                    <div *ngFor="let offer of extendedOffers" 
                         [ngClass]="offer.highlight ? 'bg-[#063970] dark:bg-blue-600 border-2 border-white/20 shadow-xl' : 'bg-white dark:bg-[#063970] border border-gray-100 dark:border-blue-800/40 shadow-md'"
                         class="stage-card p-10 flex flex-col rounded-3xl cursor-pointer transition-all">
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
                        <p [ngClass]="offer.highlight ? 'text-blue-100' : 'text-gray-600 dark:text-blue-100/70'" class="leading-relaxed mb-8 text-lg">{{offer.desc}}</p>
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
                                <span class="text-xs font-semibold text-gray-500 dark:text-blue-200/60 uppercase tracking-wider">État de votre candidature</span>
                                <p-tag [value]="status" [severity]="getStatusSeverity(status)" styleClass="w-full text-lg py-4 rounded-2xl shadow-sm" />
                            </div>
                        </div>
                        <div *ngIf="!getApplicationStatus(offer.title)" class="mt-auto flex gap-3">
                            <button pButton pRipple icon="pi pi-info-circle"
                                    [class]="offer.highlight ? '!bg-white/10 !text-white !border-white/30' : '!bg-slate-100 !text-slate-600 dark:!bg-slate-800' "
                                    class="p-4 rounded-2xl border-none font-bold transition-all"
                                    pTooltip="Plus d'infos"
                                    (click)="openDetailsDialog(offer)"></button>

                            <button pButton pRipple [label]="offer.cta" 
                                    [class]="offer.highlight ? '!bg-transparent !text-white !border-2 !border-white hover:!bg-white/10' : 'bg-[#063970] dark:bg-blue-400 text-white dark:text-surface-900 border-none hover:bg-blue-900 dark:hover:bg-blue-300'"
                                    class="flex-1 font-bold rounded-2xl py-4 transition-all text-lg"
                                    (click)="openApplyDialog(offer)"></button>
                        </div>
                    </div>

                </div>

                <!-- Slide Dots Indicators -->
                <div class="flex justify-center gap-2 mt-6">
                    <div *ngFor="let dot of originalOffers; let i = index" 
                         (click)="scrollToItem(i)"
                         class="dot bg-blue-200 dark:bg-blue-900/40" 
                         [class.active]="i === currentDotIndex">
                    </div>
                </div>
            </div>

            <div class="mt-14 p-10 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 transition-colors shadow-sm">
                <div class="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h4 class="text-2xl font-bold text-[#063970] dark:text-blue-300 mb-3">Pour candidater, envoyez votre CV à :</h4>
                        <p class="text-gray-600 dark:text-blue-100/70 text-xl font-medium">contact&#64;siga.com.tn</p>
                    <button pButton pRipple label="Toutes les offres" (click)="navigateToAllOffers()" icon="pi pi-external-link" iconPos="right" class="bg-[#063970] dark:bg-blue-500 text-white dark:text-white border-none font-bold rounded-2xl px-10 py-4 hover:bg-blue-900 dark:hover:bg-blue-400 transition-all shadow-lg hover:shadow-xl hover:translate-y-[-2px] text-lg"></button>
                </div>
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
                                       placeholder="Votre nom" class="w-full pl-10 h-12 border-slate-200 rounded-xl focus:ring-slate-800" />
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
                                    <span class="text-sm font-bold text-slate-700">Durée : 3 - 6 mois</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-map-marker text-red-500 font-bold"></i>
                                    <span class="text-sm font-bold text-slate-700">Lieu : Tunis, SIGA HQ</span>
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
export class PricingWidget implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    private timer: any;
    currentDotIndex = 0;
    isSmooth = true;
    
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

    originalOffers: InternshipOffer[] = [];
    extendedOffers: InternshipOffer[] = [];

    applications!: Signal<InternshipApplication[]>;

    constructor(
        private ngZone: NgZone,
        private internshipService: InternshipService,
        private candidatureService: CandidatureService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit() {
        this.startAutoPlay();
        this.applications = this.internshipService.getApplications();
        this.originalOffers = this.internshipService.getOffers()();
        this.extendedOffers = [...this.originalOffers, ...this.originalOffers, ...this.originalOffers];
    }

    navigateToAllOffers() {
        this.router.navigate(['/internship-list']);
    }

    ngAfterViewInit() {
        setTimeout(() => {
            const container = this.scrollContainer.nativeElement;
            this.isSmooth = false;
            const width = this.getCardWidthWithGap();
            container.scrollLeft = this.originalOffers.length * width;
            setTimeout(() => this.isSmooth = true, 50);
        }, 100);
    }

    ngOnDestroy() {
        if (this.timer) clearInterval(this.timer);
    }

    getApplicationStatus(title: string): string | null {
        const app = this.applications().find(a => a.offerTitle === title);
        return app ? app.status : null;
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
            // Optionally refresh state if needed
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

    getStatusSeverity(status: string) {
        switch (status) {
            case 'ACCEPTEE': return 'success';
            case 'REFUSEE': return 'danger';
            case 'EN_ATTENTE': return 'warn';
            default: return 'info';
        }
    }

    startAutoPlay() {
        this.ngZone.runOutsideAngular(() => {
            this.timer = setInterval(() => {
                this.ngZone.run(() => {
                    this.autoScroll();
                });
            }, 5000);
        });
    }

    autoScroll() {
        if (!this.scrollContainer) return;
        const container = this.scrollContainer.nativeElement;
        const width = this.getCardWidthWithGap();
        container.scrollBy({ left: width, behavior: 'smooth' });
        setTimeout(() => this.handleInfiniteJump(), 800);
    }

    handleInfiniteJump() {
        if (!this.scrollContainer) return;
        const container = this.scrollContainer.nativeElement;
        const width = this.getCardWidthWithGap();
        const totalItemsWidth = this.originalOffers.length * width;

        if (container.scrollLeft >= totalItemsWidth * 2) {
            this.isSmooth = false;
            container.scrollLeft -= totalItemsWidth;
            setTimeout(() => this.isSmooth = true, 50);
        } else if (container.scrollLeft < width) {
            this.isSmooth = false;
            container.scrollLeft += totalItemsWidth;
            setTimeout(() => this.isSmooth = true, 50);
        }
    }

    getCardWidthWithGap() {
        if (!this.scrollContainer) return 0;
        const container = this.scrollContainer.nativeElement;
        return container.scrollWidth / this.extendedOffers.length;
    }

    scrollToItem(index: number) {
        this.resetTimer();
        const container = this.scrollContainer.nativeElement;
        const width = this.getCardWidthWithGap();
        const target = (this.originalOffers.length + index) * width;
        container.scrollTo({ left: target, behavior: 'smooth' });
    }

    onScroll() {
        if (!this.scrollContainer) return;
        const container = this.scrollContainer.nativeElement;
        const width = this.getCardWidthWithGap();
        const totalItemsWidth = this.originalOffers.length * width;
        const offset = container.scrollLeft % totalItemsWidth;
        this.currentDotIndex = Math.round(offset / width) % this.originalOffers.length;
        if (Math.abs(container.scrollLeft - (totalItemsWidth * 2)) < 5 || container.scrollLeft < 5) {
             this.handleInfiniteJump();
        }
    }

    resetTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.startAutoPlay();
        }
    }
}
