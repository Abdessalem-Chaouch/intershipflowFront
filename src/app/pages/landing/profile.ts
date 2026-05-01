import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { ProfileService, ProfileResponseDto, UpdateProfileRequest, UpdatePasswordRequest } from '@/app/services/profile.service';
import { UserService } from '@/app/services/user.service';
import { InternshipService, InternshipApplication } from '@/app/services/internship.service';
import { TopbarWidget } from './components/topbarwidget.component';
import { FooterWidget } from './components/footerwidget';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-landing-profile',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        PasswordModule,
        AvatarModule,
        FileUploadModule,
        TextareaModule,
        TopbarWidget,
        FooterWidget,
        TagModule
    ],
    template: `
        <div class="bg-slate-50/50 dark:bg-surface-950 min-h-screen flex flex-col font-sans">
            <topbar-widget />
            
            <div class="flex-grow pt-24 pb-20">
                <!-- Hero Header Background -->
                <div class="h-64 w-full bg-gradient-to-b from-[#031b35] via-[#063970] to-[#e2e8f0] dark:to-surface-950 relative overflow-hidden">
                    <div class="absolute inset-0 opacity-[0.1]">
                        <div class="absolute top-0 left-0 w-full h-full" style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0); background-size: 32px 32px;"></div>
                    </div>
                </div>

                <div class="max-w-7xl mx-auto px-6 lg:px-20 -mt-32 relative z-10">
                    <div class="flex flex-col lg:flex-row gap-8">
                        
                        <!-- Left Column: Profile Card -->
                        <div class="w-full lg:w-1/3">
                            <div class="bg-white dark:bg-surface-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-surface-800 overflow-hidden sticky top-32">
                                <div class="p-8 flex flex-col items-center">
                                    <!-- Avatar Section -->
                                    <div class="relative group mb-6">
                                        <div class="w-40 h-40 rounded-[2rem] overflow-hidden border-4 border-white dark:border-surface-800 shadow-2xl relative transition-transform duration-500 group-hover:scale-[1.02]">
                                            <img *ngIf="profile()?.photoUrl; else noPhoto" 
                                                 [src]="profile()?.photoUrl" 
                                                 class="w-full h-full object-cover" 
                                                 alt="Profile photo" />
                                            <ng-template #noPhoto>
                                                <div class="w-full h-full bg-[#063970] flex items-center justify-center text-white text-5xl font-black">
                                                    {{ profile()?.firstName?.charAt(0) }}{{ profile()?.lastName?.charAt(0) }}
                                                </div>
                                            </ng-template>
                                            
                                            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer backdrop-blur-[2px]" (click)="fileInput.click()">
                                                <div class="flex flex-col items-center gap-2">
                                                    <i class="pi pi-camera text-white text-2xl"></i>
                                                    <span class="text-white text-[10px] font-bold uppercase tracking-widest">Modifier</span>
                                                </div>
                                            </div>
                                        </div>
                                        <input #fileInput type="file" class="hidden" (change)="onFileSelected($event)" accept="image/*">
                                        
                                        <button *ngIf="profile()?.photoUrl" 
                                                (click)="deletePhoto()" 
                                                class="absolute -top-1 -right-1 w-8 h-8 bg-white dark:bg-surface-800 text-red-500 rounded-xl flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors border border-slate-100 dark:border-surface-700">
                                            <i class="pi pi-trash text-xs"></i>
                                        </button>
                                    </div>

                                    <div class="text-center mb-8">
                                        <h2 class="text-2xl font-black text-[#063970] dark:text-white mb-2">
                                            {{ profile()?.firstName }} {{ profile()?.lastName }}
                                        </h2>
                                        <div class="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#063970] dark:text-blue-300 text-[10px] font-black uppercase tracking-widest border border-blue-100/50 dark:border-blue-800/50">
                                            <span class="w-2 h-2 rounded-full bg-[#063970] dark:bg-blue-400 mr-2 animate-pulse"></span>
                                            {{ profile()?.role }}
                                        </div>
                                    </div>

                                    <!-- Quick Info Grid -->
                                    <div class="w-full space-y-3">
                                        <div class="group p-4 rounded-2xl bg-slate-50 dark:bg-surface-800/50 border border-slate-100 dark:border-surface-800 hover:border-[#063970]/30 transition-all duration-300">
                                            <div class="flex items-center gap-4">
                                                <div class="w-10 h-10 rounded-xl bg-white dark:bg-surface-800 flex items-center justify-center text-[#063970] dark:text-blue-400 shadow-sm">
                                                    <i class="pi pi-envelope text-sm"></i>
                                                </div>
                                                <div class="overflow-hidden">
                                                    <p class="text-[10px] font-bold text-slate-400 dark:text-surface-500 uppercase tracking-wider m-0">Email</p>
                                                    <p class="text-sm font-bold text-slate-700 dark:text-surface-200 m-0 truncate">{{ profile()?.email }}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="group p-4 rounded-2xl bg-slate-50 dark:bg-surface-800/50 border border-slate-100 dark:border-surface-800 hover:border-[#063970]/30 transition-all duration-300">
                                            <div class="flex items-center gap-4">
                                                <div class="w-10 h-10 rounded-xl bg-white dark:bg-surface-800 flex items-center justify-center text-[#063970] dark:text-blue-400 shadow-sm">
                                                    <i class="pi pi-id-card text-sm"></i>
                                                </div>
                                                <div>
                                                    <p class="text-[10px] font-bold text-slate-400 dark:text-surface-500 uppercase tracking-wider m-0">CIN</p>
                                                    <p class="text-sm font-bold text-slate-700 dark:text-surface-200 m-0">{{ profile()?.cin || '---' }}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="group p-4 rounded-2xl bg-slate-50 dark:bg-surface-800/50 border border-slate-100 dark:border-surface-800 hover:border-[#063970]/30 transition-all duration-300">
                                            <div class="flex items-center gap-4">
                                                <div class="w-10 h-10 rounded-xl bg-white dark:bg-surface-800 flex items-center justify-center text-[#063970] dark:text-blue-400 shadow-sm">
                                                    <i class="pi pi-phone text-sm"></i>
                                                </div>
                                                <div>
                                                    <p class="text-[10px] font-bold text-slate-400 dark:text-surface-500 uppercase tracking-wider m-0">Téléphone</p>
                                                    <p class="text-sm font-bold text-slate-700 dark:text-surface-200 m-0">{{ profile()?.phone || '---' }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="bg-slate-50/50 dark:bg-surface-800/30 p-6 border-t border-slate-100 dark:border-surface-800">
                                    <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-surface-500 uppercase tracking-widest">
                                        <span>Membre depuis</span>
                                        <span class="text-slate-600 dark:text-surface-300">Avril 2024</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column: Forms -->
                        <div class="w-full lg:w-2/3 space-y-8">
                            
                            <!-- Personal Details Card -->
                            <div class="bg-white dark:bg-surface-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-surface-800 p-8 lg:p-12">
                                <div class="flex items-center gap-4 mb-10">
                                    <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#063970] dark:text-blue-400">
                                        <i class="pi pi-user text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-2xl font-black text-[#063970] dark:text-white m-0">Informations Personnelles</h3>
                                        <p class="text-sm text-slate-400 dark:text-surface-500 m-0">Gérez vos détails publics et vos coordonnées</p>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div class="flex flex-col gap-2">
                                        <label class="text-[11px] font-black text-slate-400 dark:text-surface-500 uppercase tracking-[0.15em] ml-1">Prénom</label>
                                        <input pInputText [(ngModel)]="updateReq.firstName" 
                                               class="w-full !rounded-2xl !py-4 !px-6 !bg-slate-50 dark:!bg-surface-800 !border-transparent focus:!border-[#063970] dark:focus:!border-blue-500 !transition-all !font-semibold text-slate-700 dark:text-surface-100" />
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label class="text-[11px] font-black text-slate-400 dark:text-surface-500 uppercase tracking-[0.15em] ml-1">Nom</label>
                                        <input pInputText [(ngModel)]="updateReq.lastName" 
                                               class="w-full !rounded-2xl !py-4 !px-6 !bg-slate-50 dark:!bg-surface-800 !border-transparent focus:!border-[#063970] dark:focus:!border-blue-500 !transition-all !font-semibold text-slate-700 dark:text-surface-100" />
                                    </div>
                                    <div class="flex flex-col gap-2 md:col-span-2">
                                        <label class="text-[11px] font-black text-slate-400 dark:text-surface-500 uppercase tracking-[0.15em] ml-1">Adresse Email</label>
                                        <input pInputText [(ngModel)]="updateReq.email" type="email"
                                               class="w-full !rounded-2xl !py-4 !px-6 !bg-slate-50 dark:!bg-surface-800 !border-transparent focus:!border-[#063970] dark:focus:!border-blue-500 !transition-all !font-semibold text-slate-700 dark:text-surface-100" />
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label class="text-[11px] font-black text-slate-400 dark:text-surface-500 uppercase tracking-[0.15em] ml-1">CIN</label>
                                        <input pInputText [(ngModel)]="updateReq.cin" 
                                               class="w-full !rounded-2xl !py-4 !px-6 !bg-slate-50 dark:!bg-surface-800 !border-transparent focus:!border-[#063970] dark:focus:!border-blue-500 !transition-all !font-semibold text-slate-700 dark:text-surface-100" />
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label class="text-[11px] font-black text-slate-400 dark:text-surface-500 uppercase tracking-[0.15em] ml-1">Téléphone</label>
                                        <input pInputText [(ngModel)]="updateReq.phone" 
                                               class="w-full !rounded-2xl !py-4 !px-6 !bg-slate-50 dark:!bg-surface-800 !border-transparent focus:!border-[#063970] dark:focus:!border-blue-500 !transition-all !font-semibold text-slate-700 dark:text-surface-100" />
                                    </div>
                                    <div class="flex flex-col gap-2 md:col-span-2">
                                        <label class="text-[11px] font-black text-slate-400 dark:text-surface-500 uppercase tracking-[0.15em] ml-1">Adresse Résidentielle</label>
                                        <input pInputText [(ngModel)]="updateReq.address" 
                                               class="w-full !rounded-2xl !py-4 !px-6 !bg-slate-50 dark:!bg-surface-800 !border-transparent focus:!border-[#063970] dark:focus:!border-blue-500 !transition-all !font-semibold text-slate-700 dark:text-surface-100" />
                                    </div>
                                    <div class="flex flex-col gap-2 md:col-span-2">
                                        <label class="text-[11px] font-black text-slate-400 dark:text-surface-500 uppercase tracking-[0.15em] ml-1">Bio / Présentation</label>
                                        <textarea pTextarea [(ngModel)]="updateReq.bio" rows="4"
                                               class="w-full !rounded-3xl !py-4 !px-6 !bg-slate-50 dark:!bg-surface-800 !border-transparent focus:!border-[#063970] dark:focus:!border-blue-500 !transition-all !font-semibold text-slate-700 dark:text-surface-100 resize-none"></textarea>
                                    </div>
                                </div>
                                <div class="flex justify-end mt-10">
                                    <button pButton label="Sauvegarder les modifications" 
                                            icon="pi pi-check-circle" 
                                            [loading]="loadingProfile"
                                            (click)="saveProfile()"
                                            class="!rounded-2xl !py-4 !px-10 !bg-[#063970] dark:!bg-blue-600 !border-none !font-bold !shadow-xl !shadow-[#063970]/20 hover:!scale-[1.02] active:!scale-95 transition-all"></button>
                                </div>
                            </div>

                            <!-- Security Card -->
                            <div class="bg-white dark:bg-surface-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-surface-800 p-8 lg:p-12">
                                <div class="flex items-center gap-4 mb-10">
                                    <div class="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                                        <i class="pi pi-shield text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-2xl font-black text-[#063970] dark:text-white m-0">Sécurité du Compte</h3>
                                        <p class="text-sm text-slate-400 dark:text-surface-500 m-0">Protégez votre compte avec un mot de passe robuste</p>
                                    </div>
                                </div>

                                <div class="space-y-6">
                                    <div class="flex flex-col gap-2">
                                        <label class="text-[11px] font-black text-slate-400 dark:text-surface-500 uppercase tracking-[0.15em] ml-1">Mot de passe actuel</label>
                                        <p-password [(ngModel)]="passwordReq.oldPassword" [toggleMask]="true" [feedback]="false"
                                                    styleClass="w-full" inputStyleClass="w-full !rounded-2xl !py-4 !px-6 !bg-slate-50 dark:!bg-surface-800 !border-transparent focus:!border-[#063970] dark:focus:!border-blue-500 !transition-all !font-semibold text-slate-700 dark:text-surface-100" />
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div class="flex flex-col gap-2">
                                            <label class="text-[11px] font-black text-slate-400 dark:text-surface-500 uppercase tracking-[0.15em] ml-1">Nouveau mot de passe</label>
                                            <p-password [(ngModel)]="passwordReq.newPassword" [toggleMask]="true"
                                                        styleClass="w-full" inputStyleClass="w-full !rounded-2xl !py-4 !px-6 !bg-slate-50 dark:!bg-surface-800 !border-transparent focus:!border-[#063970] dark:focus:!border-blue-500 !transition-all !font-semibold text-slate-700 dark:text-surface-100" />
                                        </div>
                                        <div class="flex flex-col gap-2">
                                            <label class="text-[11px] font-black text-slate-400 dark:text-surface-500 uppercase tracking-[0.15em] ml-1">Confirmer le mot de passe</label>
                                            <p-password [(ngModel)]="confirmPassword" [toggleMask]="true" [feedback]="false"
                                                        styleClass="w-full" inputStyleClass="w-full !rounded-2xl !py-4 !px-6 !bg-slate-50 dark:!bg-surface-800 !border-transparent focus:!border-[#063970] dark:focus:!border-blue-500 !transition-all !font-semibold text-slate-700 dark:text-surface-100" />
                                        </div>
                                    </div>
                                </div>
                                <div class="flex justify-end mt-10">
                                    <button pButton label="Mettre à jour la sécurité" 
                                            icon="pi pi-lock" 
                                            [loading]="loadingPassword"
                                            (click)="changePassword()"
                                            class="!rounded-2xl !py-4 !px-10 !bg-slate-100 dark:!bg-surface-800 !text-[#063970] dark:!text-blue-300 !border-none !font-bold hover:!bg-slate-200 dark:hover:!bg-surface-700 transition-all"></button>
                                </div>
                            </div>

                            <!-- My Applications Section (Stagiaire only) -->
                            <div *ngIf="profile()?.role === 'STAGIAIRE'" class="bg-white dark:bg-surface-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-surface-800 p-8 lg:p-12">
                                <div class="flex items-center gap-4 mb-10">
                                    <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                                        <i class="pi pi-briefcase text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-2xl font-black text-[#063970] dark:text-white m-0">Mes Candidatures</h3>
                                        <p class="text-sm text-slate-400 dark:text-surface-500 m-0">Suivez l'état de vos demandes de stage</p>
                                    </div>
                                </div>

                                <div class="space-y-4">
                                    <div *ngIf="applications().length === 0" class="text-center py-12 bg-slate-50 dark:bg-surface-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-surface-700">
                                        <i class="pi pi-inbox text-4xl text-slate-300 mb-4 block"></i>
                                        <p class="text-slate-500 dark:text-surface-400 font-bold">Vous n'avez pas encore postulé à des offres.</p>
                                        <button pButton label="Découvrir les offres" (click)="router.navigate(['/internship-list'])" class="p-button-text p-button-sm mt-2"></button>
                                    </div>

                                    <div *ngFor="let app of applications()" class="p-6 bg-slate-50 dark:bg-surface-800/50 rounded-3xl border border-slate-100 dark:border-surface-800 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#063970]/30 transition-all group">
                                        <div class="flex items-center gap-5 w-full md:w-auto">
                                            <div class="w-14 h-14 rounded-2xl bg-white dark:bg-surface-800 flex items-center justify-center text-[#063970] dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform">
                                                <i class="pi pi-file-o text-xl"></i>
                                            </div>
                                            <div>
                                                <h4 class="text-lg font-black text-slate-800 dark:text-white m-0 tracking-tight">{{ app.offerTitle }}</h4>
                                                <div class="flex items-center gap-3 mt-1">
                                                    <span class="text-[10px] font-bold text-slate-400 dark:text-surface-500 uppercase tracking-widest flex items-center gap-1">
                                                        <i class="pi pi-calendar text-[10px]"></i> {{ app.date | date:'dd MMM yyyy' }}
                                                    </span>
                                                    <span class="w-1 h-1 rounded-full bg-slate-200 dark:bg-surface-700"></span>
                                                    <span class="text-[10px] font-bold text-slate-400 dark:text-surface-500 uppercase tracking-widest">ID: #{{ app.id }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                            <div *ngIf="app.dureeStage" class="hidden sm:flex items-center gap-2 text-[10px] font-bold text-[#063970] dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl border border-blue-100/50 dark:border-blue-800/50">
                                                <i class="pi pi-clock text-[10px]"></i>
                                                {{ internshipService.formatDuration(app.dureeStage) }}
                                            </div>
                                            <p-tag [value]="app.status" [severity]="getStatusSeverity(app.status)" styleClass="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest" />
                                            <button pButton icon="pi pi-eye" class="p-button-rounded p-button-text p-button-secondary" (click)="router.navigate(['/internship-list'])" pTooltip="Voir l'offre"></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer-widget />
            <p-toast />
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            .p-password input {
                width: 100%;
            }
            .p-inputtext:focus {
                box-shadow: none !important;
            }
            .p-password-panel {
                border-radius: 1.5rem;
                padding: 1.5rem;
                background: white;
                box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.1);
            }
            .dark .p-password-panel {
                background: #1e293b;
                border: 1px solid #334155;
            }
            .p-password-icon, 
            .p-password-toggle-mask,
            .p-password i {
                cursor: pointer !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                color: #94a3b8 !important;
                padding: 0.5rem;
                margin-right: 0.5rem;
                border-radius: 50%;
                z-index: 10;
            }
            .p-password-icon:hover, 
            .p-password-toggle-mask:hover,
            .p-password i:hover {
                color: #063970 !important;
                background: rgba(6, 57, 112, 0.05);
                transform: scale(1.1);
            }
            .dark .p-password-icon:hover,
            .dark .p-password-toggle-mask:hover,
            .dark .p-password i:hover {
                color: #60a5fa !important;
                background: rgba(96, 165, 250, 0.1);
            }
        }
    `],
    providers: [MessageService]
})
export class LandingProfile implements OnInit {
    profile = signal<ProfileResponseDto | null>(null);
    updateReq: UpdateProfileRequest = {};
    passwordReq: UpdatePasswordRequest = {};
    confirmPassword = '';
    
    loadingProfile = false;
    loadingPassword = false;
    selectedFile: File | null = null;

    private profileService = inject(ProfileService);
    private userService = inject(UserService);
    public internshipService = inject(InternshipService);
    private messageService = inject(MessageService);
    public router = inject(Router);

    applications = computed(() => {
        const apps = this.internshipService.getApplications()();
        const allOffers = this.internshipService.getOffers()();
        return apps.map(app => {
            const offer = allOffers.find(o => o.id === app.offerId);
            return {
                ...app,
                dureeStage: offer?.dureeStage
            };
        });
    });

    ngOnInit() {
        this.loadProfile();
        this.internshipService.fetchApplications();
    }

    loadProfile() {
        this.profileService.getProfile().subscribe({
            next: (data) => {
                if (data.photoUrl && !data.photoUrl.startsWith('http')) {
                    data.photoUrl = `http://localhost:8081/profile/photo/${data.photoUrl}`;
                }
                this.profile.set(data);
                this.updateReq = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    cin: data.cin,
                    phone: data.phone,
                    address: data.address,
                    bio: data.bio
                };

                // Sync with UserService
                const curr = this.userService.currentUser();
                if (curr) {
                    this.userService.currentUser.set({ ...curr, photoUrl: data.photoUrl });
                }
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger le profil' });
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.saveProfile();
        }
    }

    async saveProfile() {
        this.loadingProfile = true;
        try {
            const updated = await this.profileService.updateProfile(this.updateReq, this.selectedFile || undefined);
            
            if (updated.photoUrl && !updated.photoUrl.startsWith('http')) {
                updated.photoUrl = `http://localhost:8081/profile/photo/${updated.photoUrl}`;
            }
            
            this.profile.set(updated);
            this.selectedFile = null;
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Profil mis à jour' });
            
            const currentUser = this.userService.currentUser();
            if (currentUser) {
                this.userService.currentUser.set({
                    ...currentUser,
                    firstName: updated.firstName,
                    lastName: updated.lastName,
                    email: updated.email,
                    photoUrl: updated.photoUrl
                });
            }
        } catch (err: any) {
            console.error('Update error:', err);
            let detail = 'Échec de la mise à jour';
            
            // Handle CIN already exists error
            const errorMessage = err.error?.message || err.message || '';
            if (errorMessage.toLowerCase().includes('cin')) {
                detail = 'Ce numéro de CIN est déjà utilisé par un autre utilisateur';
            } else if (errorMessage.toLowerCase().includes('email')) {
                detail = 'Cet email est déjà utilisé';
            }
            
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail });
        } finally {
            this.loadingProfile = false;
        }
    }

    deletePhoto() {
        this.profileService.deleteProfilePhoto().subscribe({
            next: () => {
                if (this.profile()) {
                    this.profile.set({ ...this.profile()!, photoUrl: undefined });
                }
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Photo supprimée' });
            }
        });
    }

    changePassword() {
        if (this.passwordReq.newPassword !== this.confirmPassword) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Les mots de passe ne correspondent pas' });
            return;
        }

        if (!this.passwordReq.oldPassword || !this.passwordReq.newPassword) {
            this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez remplir tous les champs' });
            return;
        }

        this.loadingPassword = true;
        this.profileService.updatePassword(this.passwordReq).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Mot de passe mis à jour' });
                this.passwordReq = {};
                this.confirmPassword = '';
                this.loadingPassword = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Ancien mot de passe incorrect' });
                this.loadingPassword = false;
            }
        });
    }

    getStatusSeverity(status: string) {
        switch (status) {
            case 'ACCEPTEE': return 'success';
            case 'REFUSEE': return 'danger';
            case 'EN_ATTENTE': return 'warn';
            default: return 'info';
        }
    }
}
