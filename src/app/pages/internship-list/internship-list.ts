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

import { TopbarWidget } from '../landing/components/topbarwidget.component';
import { FooterWidget } from '../landing/components/footerwidget';

@Component({
    selector: 'app-internship-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, InputTextModule, IconFieldModule, InputIconModule, DialogModule, FileUploadModule, ToastModule, FormsModule, RippleModule, TopbarWidget, FooterWidget],
    providers: [MessageService],
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

                            <button *ngIf="!getApplicationStatus(offer.title)" pButton pRipple [label]="offer.highlight ? 'Postuler maintenant' : 'Postuler'" 
                                    [class]="offer.highlight ? '!bg-transparent !text-white !border-2 !border-white hover:!bg-white/10' : 'bg-[#063970] dark:bg-blue-400 text-white dark:text-surface-900 border-none hover:bg-blue-900 dark:hover:bg-blue-300'"
                                    class="mt-auto w-full font-bold rounded-2xl py-4 transition-all text-lg"
                                    (click)="openApplyDialog(offer)"></button>
                        </div>
                    </div>
                </div>

                <footer-widget />
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
export class InternshipList implements OnInit {
    offers!: Signal<InternshipOffer[]>;
    applications!: Signal<InternshipApplication[]>;
    
    applyDialog = false;
    selectedOffer: any = null;
    isSubmitting = false;
    
    applicationForm = {
        firstName: '',
        lastName: '',
        cvName: '',
        letterName: ''
    };

    constructor(
        private internshipService: InternshipService,
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
        setTimeout(() => {
            this.internshipService.apply({
                offerTitle: this.selectedOffer.title,
                firstName: this.applicationForm.firstName,
                lastName: this.applicationForm.lastName,
                cvName: this.applicationForm.cvName,
                letterName: this.applicationForm.letterName
            });
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Candidature envoyée !', life: 3000 });
            this.isSubmitting = false;
            this.applyDialog = false;
        }, 1500);
    }
}
