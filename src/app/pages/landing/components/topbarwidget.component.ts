import { Component, HostListener, OnInit, inject, computed, signal } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '@/app/layout/component/app.floatingconfigurator';
import { CommonModule } from '@angular/common';
import { UserService } from '@/app/services/user.service';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { InternshipService, InternshipOffer } from '@/app/services/internship.service';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'topbar-widget',
    standalone: true,
    imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule, AppFloatingConfigurator, CommonModule, MenuModule, AvatarModule, DialogModule, TooltipModule, TagModule],
    template: `
        <div class="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between w-full py-5 px-6 lg:px-20 transition-all duration-300"
             [ngClass]="{
                'bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(6,57,112,0.12)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.4)] border-b border-transparent dark:bg-[#021427]/95': isScrolled,
                'bg-transparent': !isScrolled
             }">

            <!-- Logo -->
            <a class="flex items-center cursor-pointer shrink-0 gap-2"
               (click)="router.navigate(['/landing'], { fragment: 'home' })">
                <span class="font-extrabold text-4xl tracking-widest text-[#063970] dark:text-blue-300 hover:scale-105 transition-all">SIGA</span>
            </a>

            <!-- Mobile hamburger -->
            <a pButton [text]="true" severity="secondary" [rounded]="true" pRipple
               class="lg:hidden!"
               pStyleClass="@next"
               enterFromClass="hidden"
               leaveToClass="hidden"
               [hideOnOutsideClick]="true">
                <i class="pi pi-bars text-3xl! text-[#063970] dark:text-blue-300"></i>
            </a>

            <!-- Nav links + buttons -->
            <div class="items-center bg-white lg:bg-transparent grow justify-end hidden lg:flex absolute lg:static w-full left-0 top-full px-6 lg:px-0 z-20 rounded-border shadow-lg lg:shadow-none py-4 lg:py-0 transition-colors dark:bg-[#021427] lg:dark:bg-transparent">
                <ul class="list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-10 mr-25">
                    <li><a (click)="router.navigate(['/landing'], { fragment: 'home' })" pRipple class="px-0 py-2 font-semibold text-lg text-[#063970] dark:text-blue-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" style="cursor: pointer;">Accueil</a></li>
                    <li><a (click)="router.navigate(['/landing'], { fragment: 'apropos' })" pRipple class="px-0 py-2 font-semibold text-lg text-[#063970] dark:text-blue-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" style="cursor: pointer;">À Propos</a></li>
                    <li><a (click)="router.navigate(['/landing'], { fragment: 'produits' })" pRipple class="px-0 py-2 font-semibold text-lg text-[#063970] dark:text-blue-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" style="cursor: pointer;">Produits</a></li>
                    <li><a (click)="router.navigate(['/landing'], { fragment: 'pricing' })" pRipple class="px-0 py-2 font-semibold text-lg text-[#063970] dark:text-blue-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" style="cursor: pointer;">Offres de Stage</a></li>
                    <li><a (click)="router.navigate(['/landing'], { fragment: 'contact' })" pRipple class="px-0 py-2 font-semibold text-lg text-[#063970] dark:text-blue-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" style="cursor: pointer;">Contact</a></li>
                    
                    <!-- Added to main list for mobile visibility -->
                    <li *ngIf="currentUser()?.role === 'Stagiaire'|| currentUser()?.role === 'User'">
                        <a (click)="showAppliedDialog()" pRipple class="px-0 py-2 font-semibold text-lg text-[#063970] dark:text-blue-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" style="cursor: pointer;">
                            Mes candidatures
                        </a>
                    </li>
                    <li *ngIf="currentUser()">
                        <a (click)="navigateToProfile()" pRipple class="px-0 py-2 font-semibold text-lg text-[#063970] dark:text-blue-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" style="cursor: pointer;">
                            Mon Profil
                        </a>
                    </li>
                </ul>
                
                <app-floating-configurator [float]="false"/>&nbsp;&nbsp;&nbsp;
                
                <!-- Auth Section -->
                <div class="flex items-center gap-4 border-t lg:border-t-0 border-surface-200 dark:border-blue-800/40 pt-6 lg:pt-0 mt-4 lg:mt-0">
                    
                    <ng-container *ngIf="!currentUser()">
                        <button pButton pRipple label="Connexion" routerLink="/auth/login" [outlined]="true" [rounded]="true" class="font-semibold text-base border-2 px-6 py-3 text-[#063970] dark:text-blue-300 border-[#063970] dark:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" style="background: transparent;"></button>
                        <button pButton pRipple label="S'inscrire" routerLink="/auth/register" [rounded]="true" class="font-semibold text-base border-none px-6 py-3 text-white bg-[#063970] dark:bg-blue-500 hover:bg-blue-900 dark:hover:bg-blue-400 transition-colors"></button>
                    </ng-container>

                    <div *ngIf="currentUser()" 
                         class="flex items-center gap-2 ml-4 bg-[#063970]/5 dark:bg-blue-400/5 rounded-full pl-3 pr-1 py-1 border border-[#063970]/10 dark:border-blue-400/10 cursor-pointer hover:bg-[#063970]/10 dark:hover:bg-blue-400/10 transition-all duration-300"
                         (click)="userMenu.toggle($event)">
                        <span class="hidden xl:block text-sm font-semibold text-[#063970] dark:text-blue-200 whitespace-nowrap">
                            {{ currentUser()?.firstName }} {{ currentUser()?.lastName }}
                        </span>
                        <div class="relative">
                            <p-avatar 
                                [label]="(currentUser()?.firstName?.charAt(0) ?? '') + (currentUser()?.lastName?.charAt(0) ?? '')"
                                icon="pi pi-user" 
                                styleClass="border-2 border-[#063970] dark:border-blue-500 text-white bg-[#063970] dark:bg-blue-500 shadow-md hover:scale-110 transition-transform" 
                                size="large" 
                                shape="circle">
                            </p-avatar>
                            <p-menu #userMenu [model]="userMenuItems()" [popup]="true" appendTo="body" styleClass="w-56 mt-2 shadow-xl border-blue-50 dark:border-blue-900 dark:bg-[#063970]"></p-menu>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Applied Offers Dialog -->
        <p-dialog [(visible)]="appliedDialogVisible" 
                  [modal]="true" 
                  [draggable]="false"
                  [dismissableMask]="true"
                  header="Mes candidatures"
                  styleClass="modern-dialog"
                  [style]="{ width: 'min(800px, 95vw)' }">
            
            <div class="flex flex-col gap-4 py-4">
                <div *ngIf="appliedOffers().length === 0" class="text-center py-10 text-gray-400 dark:text-blue-200/30">
                    <i class="pi pi-inbox text-5xl mb-4 block opacity-20"></i>
                    <p>Vous n'avez pas encore postulé à des offres.</p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    <div *ngFor="let offer of appliedOffers()" 
                         class="p-5 border border-slate-100 dark:border-blue-800/40 bg-slate-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-between group hover:border-[#063970] dark:hover:border-blue-400 transition-all">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-xl bg-white dark:bg-blue-900/40 flex items-center justify-center text-[#063970] dark:text-blue-300 shadow-sm transition-transform group-hover:scale-110">
                                <i class="pi pi-briefcase text-xl"></i>
                            </div>
                            <div>
                                <h6 class="m-0 font-bold text-slate-800 dark:text-blue-50">{{ offer.title }}</h6>
                                <p class="m-0 text-xs text-slate-400 dark:text-blue-200/50 font-medium uppercase tracking-wider mt-1">{{ offer.location }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <p-tag *ngIf="getApplicationStatus(offer.id) as status" 
                                   [value]="status" 
                                   [severity]="getStatusSeverity(status)" 
                                   styleClass="text-[10px] font-black uppercase" />
                            <p-button icon="pi pi-eye" [text]="true" [rounded]="true" (click)="viewOffer(offer)" pTooltip="Voir détails" styleClass="dark:!text-blue-300" />
                        </div>
                    </div>
                </div>
            </div>
        </p-dialog>

        <!-- Details Dialog (Simplified from InternshipList) -->
        <p-dialog [(visible)]="detailsDialog" 
                  [modal]="true" 
                  [draggable]="false"
                  [resizable]="false"
                  [dismissableMask]="true"
                  styleClass="modern-dialog"
                  [style]="{ width: 'min(700px, 95vw)' }">
            
            <ng-template pTemplate="header">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-[#063970] dark:text-blue-300 flex items-center justify-center text-2xl shadow-sm">
                        <i class="pi pi-briefcase"></i>
                    </div>
                    <div>
                        <h5 class="m-0 text-2xl font-black text-slate-800 dark:text-blue-50 tracking-tight">{{ selectedOffer?.title }}</h5>
                        <p-tag [value]="selectedOffer?.badge" 
                               severity="success" 
                               styleClass="text-[10px] font-black uppercase mt-1 px-3" />
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="content">
                <div class="flex flex-col gap-8 py-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="flex flex-col gap-4">
                            <h6 class="text-xs font-black text-slate-400 dark:text-blue-200/40 uppercase tracking-widest flex items-center gap-2">
                                <i class="pi pi-align-left"></i> Mission du stage
                            </h6>
                            <p class="text-slate-600 dark:text-blue-100/70 leading-relaxed font-medium">
                                {{ selectedOffer?.details || selectedOffer?.desc }}
                            </p>
                        </div>
                        <div class="flex flex-col gap-6">
                            <div class="bg-slate-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-slate-100 dark:border-blue-800/40 flex flex-col gap-4">
                                <h6 class="text-xs font-black text-slate-400 dark:text-blue-200/40 uppercase tracking-widest flex items-center gap-2">
                                    <i class="pi pi-code"></i> Stack Technique
                                </h6>
                                <div class="flex flex-wrap gap-2">
                                    <p-tag *ngFor="let tech of selectedOffer?.techs" [value]="tech" 
                                           styleClass="!bg-white dark:!bg-blue-900/40 !text-slate-700 dark:!text-blue-100 !border !border-slate-200 dark:!border-blue-800/40 !font-bold py-2 px-3 rounded-xl shadow-sm" />
                                </div>
                            </div>
                            <div class="flex flex-col gap-4 px-2">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-map-marker text-red-500 dark:text-red-400 font-bold"></i>
                                    <span class="text-sm font-bold text-slate-700 dark:text-blue-100/80">Lieu : {{ selectedOffer?.location }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="footer">
                <div class="flex items-center justify-between w-full p-4 border-t border-slate-50 dark:border-blue-800/40 bg-slate-50/50 dark:bg-blue-900/20 rounded-b-3xl">
                    <p-button label="Fermer" [text]="true" severity="secondary" (onClick)="detailsDialog = false" styleClass="dark:!text-blue-200/60" />
                    <p-tag *ngIf="getApplicationStatus(selectedOffer?.id || '') as status" 
                           [value]="status" 
                           [severity]="getStatusSeverity(status)" 
                           styleClass="px-4 py-2 font-black uppercase" />
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class TopbarWidget implements OnInit {
    isScrolled = false;

    public userService = inject(UserService);
    public router = inject(Router);
    private internshipService = inject(InternshipService);

    currentUser = this.userService.currentUser;
    userMenuItems = this.userService.userMenuItems;
    applications = this.internshipService.getApplications();

    appliedDialogVisible = false;
    detailsDialog = false;
    selectedOffer: InternshipOffer | null = null;
    appliedOffers = signal<InternshipOffer[]>([]);

    constructor() { }

    ngOnInit() {
        this.updateScrollState();
    }

    getApplicationStatus(offerId: string): string | null {
        const app = this.applications().find(a => a.offerId === offerId);
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

    @HostListener('window:scroll')
    onWindowScroll() {
        this.updateScrollState();
    }

    async showAppliedDialog() {
        try {
            this.internshipService.fetchApplications();
            const offers = await this.internshipService.getAppliedOffres();
            this.appliedOffers.set(offers);
            this.appliedDialogVisible = true;
        } catch (err) {
            console.error('Error fetching applied offers:', err);
        }
    }

    viewOffer(offer: InternshipOffer) {
        this.selectedOffer = offer;
        this.detailsDialog = true;
    }

    navigateToProfile() {
        const user = this.currentUser();
        if (user?.role === 'User') {
            this.router.navigate(['/landing/profile']);
        } else {
            this.router.navigate(['/pages/profile']);
        }
    }

    private updateScrollState() {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        this.isScrolled = scrollY > 50;
    }
}
