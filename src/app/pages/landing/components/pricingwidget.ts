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

@Component({
    selector: 'pricing-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule, DialogModule, FileUploadModule, InputTextModule, ToastModule, TagModule, TableModule, FormsModule],
    providers: [MessageService],
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
                        <button *ngIf="!getApplicationStatus(offer.title)" pButton pRipple [label]="offer.cta" 
                                [class]="offer.highlight ? '!bg-transparent !text-white !border-2 !border-white hover:!bg-white/10' : 'bg-[#063970] dark:bg-blue-400 text-white dark:text-surface-900 border-none hover:bg-blue-900 dark:hover:bg-blue-300'"
                                class="mt-auto w-full font-bold rounded-2xl py-4 transition-all text-lg"
                                (click)="openApplyDialog(offer)"></button>
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

        <!-- Application Dialog -->
        <p-dialog [(visible)]="applyDialog" [modal]="true" [header]="'Postuler pour : ' + selectedOffer?.title" [style]="{ width: '450px' }" class="p-fluid">
            <ng-template pTemplate="content">
                <div class="flex flex-col gap-4 py-4"> 
                    <div class="field">
                        <label for="firstName" class="block font-bold mb-2">Prénom</label>
                        <input id="firstName" type="text" pInputText [(ngModel)]="applicationForm.firstName" placeholder="Votre prénom" />
                    </div>
                    <div class="field">
                        <label for="lastName" class="block font-bold mb-2">Nom</label>
                        <input id="lastName" type="text" pInputText [(ngModel)]="applicationForm.lastName" placeholder="Votre nom" />
                    </div>
                    
                    <div class="field">
                        <label class="block font-bold mb-2">Curriculum Vitae (CV)</label>
                        <p-fileUpload mode="basic" [name]="'cv'" chooseLabel="Choisir CV" icon="pi pi-upload" 
                                      (onSelect)="onFileSelect($event, 'cv')" accept=".pdf,.doc,.docx" [maxFileSize]="5000000" />
                        <small class="text-gray-500 mt-1" *ngIf="applicationForm.cvName">{{applicationForm.cvName}}</small>
                    </div>

                    <div class="field">
                        <label class="block font-bold mb-2">Lettre de motivation</label>
                        <p-fileUpload mode="basic" [name]="'letter'" chooseLabel="Choisir Lettre" icon="pi pi-file" 
                                      (onSelect)="onFileSelect($event, 'letter')" accept=".pdf,.doc,.docx" [maxFileSize]="5000000" />
                        <small class="text-gray-500 mt-1" *ngIf="applicationForm.letterName">{{applicationForm.letterName}}</small>
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="footer">
                <p-button label="Annuler" text (onClick)="applyDialog = false" />
                <p-button label="Envoyer ma candidature" [disabled]="!isFormValid()" (onClick)="submitApplication()" [loading]="isSubmitting" [style]="{ 'background-color': '#063970', 'border-color': '#063970' }" />
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
    selectedOffer: any = null;
    isSubmitting = false;
    
    applicationForm = {
        firstName: '',
        lastName: '',
        cvName: '',
        letterName: ''
    };

    originalOffers: InternshipOffer[] = [];
    extendedOffers: InternshipOffer[] = [];

    applications!: Signal<InternshipApplication[]>;

    constructor(
        private ngZone: NgZone,
        private internshipService: InternshipService,
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
        this.applicationForm = { firstName: '', lastName: '', cvName: '', letterName: '' };
        this.applyDialog = true;
    }

    onFileSelect(event: any, type: 'cv' | 'letter') {
        const file = event.files[0];
        if (file) {
            if (type === 'cv') this.applicationForm.cvName = file.name;
            else this.applicationForm.letterName = file.name;
        }
    }

    isFormValid() {
        return this.applicationForm.firstName.trim() && 
               this.applicationForm.lastName.trim() && 
               this.applicationForm.cvName && 
               this.applicationForm.letterName;
    }

    submitApplication() {
        this.isSubmitting = true;
        
        // Simulate API call
        setTimeout(() => {
            this.internshipService.apply({
                offerTitle: this.selectedOffer.title,
                firstName: this.applicationForm.firstName,
                lastName: this.applicationForm.lastName,
                cvName: this.applicationForm.cvName,
                letterName: this.applicationForm.letterName
            });
            
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Votre candidature a été envoyée avec succès !',
                life: 3000
            });
            
            this.isSubmitting = false;
            this.applyDialog = false;
        }, 1500);
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
