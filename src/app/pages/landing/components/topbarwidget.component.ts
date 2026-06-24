import { Component, HostListener, OnInit, inject, computed, signal, ChangeDetectorRef } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '@/app/layout/component/app.floatingconfigurator';
import { CommonModule } from '@angular/common';
import { UserService, User } from '@/app/services/user.service';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { InternshipService, InternshipOffer, InternshipApplication } from '@/app/services/internship.service';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { StageService, Stage, EtatStage } from '@/app/services/stage.service';
import { AffectationService } from '@/app/services/affectation.service';

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

                    <div #userTrigger *ngIf="currentUser()" 
                         class="flex items-center gap-2 ml-4 bg-[#063970]/5 dark:bg-blue-400/5 rounded-full pl-3 pr-1 py-1 border border-[#063970]/10 dark:border-blue-400/10 cursor-pointer hover:bg-[#063970]/10 dark:hover:bg-blue-400/10 transition-all duration-300 min-w-[200px] justify-between"
                         (click)="userMenu.toggle($event)">
                        <span class="hidden xl:block text-sm font-bold text-[#063970] dark:text-blue-200 whitespace-nowrap px-2">
                            {{ currentUser()?.firstName }} {{ currentUser()?.lastName }}
                        </span>
                        <div class="relative flex items-center">
                            <p-avatar 
                                [label]="(currentUser()?.firstName?.charAt(0) ?? '') + (currentUser()?.lastName?.charAt(0) ?? '')"
                                icon="pi pi-user" 
                                styleClass="border-2 border-[#063970] dark:border-blue-500 text-white bg-[#063970] dark:bg-blue-500 shadow-sm hover:scale-110 transition-transform" 
                                size="large" 
                                shape="circle">
                            </p-avatar>
                            <p-menu #userMenu 
                                    [model]="userMenuItems()" 
                                    [popup]="true" 
                                    styleClass="user-menu-custom"
                                    [style]="{ width: userTrigger.offsetWidth + 'px' }"></p-menu>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Applied Offers Dialog (Mes Candidatures) -->
        <p-dialog [(visible)]="appliedDialogVisible" 
                  [modal]="true" 
                  [draggable]="false"
                  [dismissableMask]="true"
                  styleClass="modern-dialog premium-candidatures-dialog"
                  [style]="{ width: 'min(850px, 95vw)' }">
            
            <ng-template pTemplate="header">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-[#063970] text-white flex items-center justify-center shadow-lg shadow-[#063970]/20">
                        <i class="pi pi-briefcase text-xl"></i>
                    </div>
                    <div>
                        <h4 class="m-0 text-2xl font-black text-[#063970] dark:text-blue-300 tracking-tight">Mes Candidatures</h4>
                        <p class="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Suivi de vos dossiers de stage</p>
                    </div>
                </div>
            </ng-template>
            
            <div class="flex flex-col gap-6 py-6 px-2">
                <!-- Empty State -->
                <div *ngIf="appliedOffers().length === 0" class="text-center py-16 bg-slate-50 dark:bg-blue-900/10 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-blue-800/20">
                    <div class="w-24 h-24 bg-white dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <i class="pi pi-inbox text-5xl text-slate-200 dark:text-blue-800/40"></i>
                    </div>
                    <h5 class="text-xl font-bold text-slate-800 dark:text-blue-100 m-0">Aucune candidature trouvée</h5>
                    <p class="text-slate-400 dark:text-blue-200/40 mt-2 font-medium">Vous n'avez pas encore postulé à nos offres de stage.</p>
                </div>

                <!-- Applications List -->
                <div class="grid grid-cols-1 gap-6">
                    <div *ngFor="let offer of appliedOffers()" 
                         class="relative overflow-hidden p-6 bg-white dark:bg-[#06111d] border border-slate-100 dark:border-blue-800/20 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-[#063970]/30 transition-all duration-500 group">
                        
                        <!-- Header Line -->
                        <div class="flex items-start justify-between mb-6">
                            <div class="flex items-center gap-5">
                                <div class="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-blue-900/20 flex items-center justify-center text-[#063970] dark:text-blue-300 shadow-inner group-hover:bg-[#063970] group-hover:text-white transition-all duration-500">
                                    <i class="pi pi-bookmark text-2xl"></i>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <h5 class="m-0 text-xl font-black text-slate-800 dark:text-white tracking-tight group-hover:text-[#063970] transition-colors">
                                        {{ offer.title }}
                                    </h5>
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-0.5 bg-slate-100 dark:bg-blue-900/40 text-[9px] font-black text-slate-500 dark:text-blue-300 rounded uppercase tracking-wider">
                                            {{ offer.location }}
                                        </span>
                                        <span class="w-1 h-1 rounded-full bg-slate-200"></span>
                                        <span class="text-[10px] font-bold text-slate-400">Postulé récemment</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col items-end gap-3">
                                <p-tag *ngIf="getApplicationStatus(offer.id) as status" 
                                       [value]="status" 
                                       [severity]="getStatusSeverity(status)" 
                                       styleClass="px-4 py-2 text-[10px] font-black uppercase rounded-xl shadow-sm" />
                                <p-button icon="pi pi-ellipsis-h" [text]="true" [rounded]="true" (click)="viewOffer(offer)" pTooltip="Voir l'offre complète" styleClass="!w-10 !h-10 !p-0 hover:!bg-blue-50 dark:hover:!bg-blue-900/20" />
                            </div>
                        </div>

                        <!-- Rejection Reason Section -->
                        <div *ngIf="getApplication(offer.id) as app" class="animate-fadein">
                            <div *ngIf="app.status === 'REFUSEE' && app.raisonRefus" 
                                 class="mt-4 p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl">
                                <div class="flex items-start gap-3">
                                    <div class="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                                        <i class="pi pi-info-circle text-red-600 dark:text-red-400"></i>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <span class="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Raison du refus</span>
                                        <p class="m-0 text-sm font-medium text-red-700 dark:text-red-200/80 leading-relaxed italic">
                                            "{{ app.raisonRefus }}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Elegant Stage Info Section -->
                        <div *ngIf="getStageForOffer(offer.id) as stage" 
                             class="mt-2 pt-6 border-t border-slate-50 dark:border-blue-800/10 animate-fadein">
                            
                            <div class="inline-flex items-center gap-2 px-3 py-1 mb-6 bg-[#063970]/5 dark:bg-[#063970]/20 border border-[#063970]/10 rounded-lg">
                                <i class="pi pi-sparkles text-[10px] text-[#063970] dark:text-blue-400"></i>
                                <span class="text-[9px] font-black text-[#063970] dark:text-blue-300 uppercase tracking-widest">Informations du stage actif</span>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <!-- Status & Mentor -->
                                <div class="col-span-1 p-4 bg-slate-50/50 dark:bg-blue-900/10 rounded-2xl border border-slate-50 dark:border-blue-800/10 flex flex-col gap-3">
                                    <div>
                                        <span class="text-[9px] font-bold text-slate-400 dark:text-blue-200/40 uppercase block mb-1">Encadrant Affecté</span>
                                        <div class="flex items-center gap-2">
                                            <div class="w-7 h-7 rounded-full bg-[#063970] flex items-center justify-center text-white text-[9px] font-black" *ngIf="stage.encadrantId || stage.encadrantNom || $any(stage).encadrantFirstName">
                                                {{ (stage.encadrantNom || $any(stage).encadrantFirstName || getSupervisorName(stage.encadrantId, stage) || 'E').charAt(0).toUpperCase() }}
                                            </div>
                                            <span *ngIf="stage.encadrantId || stage.encadrantNom || $any(stage).encadrantFirstName" class="text-xs font-bold text-slate-700 dark:text-blue-100">
                                                {{ stage.encadrantNom || ($any(stage).encadrantFirstName ? ($any(stage).encadrantFirstName + ' ' + ($any(stage).encadrantLastName || '')) : getSupervisorName(stage.encadrantId, stage)) }}
                                            </span>
                                            <p-tag *ngIf="!stage.encadrantId && !stage.encadrantNom && !$any(stage).encadrantFirstName" value="En attente" severity="secondary" styleClass="text-[9px] font-black uppercase px-2" />
                                        </div>
                                    </div>
                                    <div>
                                        <span class="text-[9px] font-bold text-slate-400 dark:text-blue-200/40 uppercase block mb-1">État actuel</span>
                                        <p-tag [value]="stage.etat" [severity]="getStageSeverity(stage.etat)" styleClass="text-[9px] font-black uppercase px-2" />
                                    </div>
                                </div>

                                <!-- Timeline Info -->
                                <div class="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                                    <div class="p-4 bg-emerald-50/30 dark:bg-emerald-900/5 rounded-2xl border border-emerald-100/30 flex flex-col justify-center">
                                        <span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2 flex items-center gap-1">
                                            <i class="pi pi-calendar-plus text-[10px]"></i> Date de début
                                        </span>
                                        <span class="text-sm font-black text-slate-700 dark:text-white">
                                            {{ stage.dateDebut | date:'dd MMMM yyyy' }}
                                        </span>
                                    </div>
                                    <div class="p-4 bg-rose-50/30 dark:bg-rose-900/5 rounded-2xl border border-rose-100/30 flex flex-col justify-center">
                                        <span class="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase mb-2 flex items-center gap-1">
                                            <i class="pi pi-calendar-minus text-[10px]"></i> Date de fin
                                        </span>
                                        <span class="text-sm font-black text-slate-700 dark:text-white">
                                            {{ stage.dateFin | date:'dd MMMM yyyy' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
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

                    <!-- Stage Information Section -->
                    <div *ngIf="getStageForOffer(selectedOffer?.id || '') as stage" class="mt-4 pt-8 border-t border-slate-100 dark:border-blue-800/40">
                        <h6 class="text-xs font-black text-[#063970] dark:text-blue-300 uppercase tracking-widest flex items-center gap-2 mb-6">
                            <i class="pi pi-info-circle"></i> Détails de votre stage
                        </h6>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-800/20 shadow-sm">
                                <span class="text-[10px] font-bold text-slate-400 dark:text-blue-200/40 uppercase block mb-1">État du stage</span>
                                <p-tag [value]="stage.etat" [severity]="getStageSeverity(stage.etat)" styleClass="text-[10px] font-black uppercase" />
                            </div>
                            <div class="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-800/20 shadow-sm">
                                <span class="text-[10px] font-bold text-slate-400 dark:text-blue-200/40 uppercase block mb-1">Encadrant Affecté</span>
                                <div class="flex items-center gap-2">
                                    <i class="pi pi-user-edit text-[#063970] dark:text-blue-400"></i>
                                    <span *ngIf="(stage.encadrantNom && stage.encadrantNom !== 'N/A') || (stage.encadrantId && getSupervisorName(stage.encadrantId) !== 'N/A') || $any(stage).encadrantFirstName" class="text-sm font-bold text-slate-700 dark:text-blue-100">
                                        {{ ($any(stage).encadrantFirstName || $any(stage).encadrantLastName) ? (($any(stage).encadrantFirstName || '') + ' ' + ($any(stage).encadrantLastName || '')).trim() : (stage.encadrantNom || getSupervisorName(stage.encadrantId, stage)) }}
                                    </span>
                                    <p-tag *ngIf="(!stage.encadrantNom || stage.encadrantNom === 'N/A') && (!stage.encadrantId || getSupervisorName(stage.encadrantId) === 'N/A') && !$any(stage).encadrantFirstName" value="En attente d'affectation" severity="secondary" styleClass="text-[10px] font-black uppercase" />
                                </div>
                            </div>
                            <div class="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-800/20 shadow-sm">
                                <span class="text-[10px] font-bold text-slate-400 dark:text-blue-200/40 uppercase block mb-1">Date de début</span>
                                <span class="text-sm font-bold text-slate-700 dark:text-blue-100 flex items-center">
                                    <i class="pi pi-calendar-plus mr-2 text-green-500"></i>
                                    {{ stage.dateDebut | date:'dd MMMM yyyy' }}
                                </span>
                            </div>
                            <div class="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-800/20 shadow-sm">
                                <span class="text-[10px] font-bold text-slate-400 dark:text-blue-200/40 uppercase block mb-1">Date de fin</span>
                                <span class="text-sm font-bold text-slate-700 dark:text-blue-100 flex items-center">
                                    <i class="pi pi-calendar-minus mr-2 text-red-500"></i>
                                    {{ stage.dateFin | date:'dd MMMM yyyy' }}
                                </span>
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
    `,
    styles: [`
        /* Premium User Menu Styling */
        ::ng-deep .user-menu-custom {
            border-radius: 1.5rem !important;
            padding: 0.75rem !important;
            border: 1px solid rgba(6, 57, 112, 0.08) !important;
            box-shadow: 0 25px 50px -12px rgba(6, 57, 112, 0.2) !important;
            background: rgba(255, 255, 255, 0.98) !important;
            backdrop-filter: blur(15px);
            margin-top: 1rem !important;
        }

        ::ng-deep .app-dark .user-menu-custom {
            background: #0a1622 !important; /* Soft Dark */
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7) !important;
        }

        ::ng-deep .user-menu-custom .p-submenu-header {
            background: transparent !important;
            color: #94a3b8 !important;
            font-size: 0.7rem !important;
            font-weight: 900 !important;
            letter-spacing: 0.15em !important;
            padding: 1rem 1rem 0.5rem !important;
            text-transform: uppercase !important;
        }

        ::ng-deep .user-menu-custom .p-menuitem-link {
            border-radius: 1rem !important;
            padding: 0.85rem 1rem !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            margin: 0.25rem 0 !important;
            border: 1px solid transparent !important;
        }

        ::ng-deep .user-menu-custom .p-menuitem-link:hover {
            background: rgba(6, 57, 112, 0.04) !important;
            border-color: rgba(6, 57, 112, 0.05) !important;
            transform: translateX(4px) !important;
        }

        ::ng-deep .app-dark .user-menu-custom .p-menuitem-link:hover {
            background: rgba(59, 130, 246, 0.1) !important;
            border-color: rgba(59, 130, 246, 0.2) !important;
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
        }

        ::ng-deep .user-menu-custom .p-menuitem-text {
            font-weight: 700 !important;
            font-size: 0.9rem !important;
            color: #334155 !important;
        }

        ::ng-deep .app-dark .user-menu-custom .p-menuitem-text {
            color: #f1f5f9 !important; /* Off-white */
        }

        ::ng-deep .user-menu-custom .p-menuitem-icon {
            color: #063970 !important;
            font-size: 1.1rem !important;
            margin-right: 0.85rem !important;
        }

        ::ng-deep .app-dark .user-menu-custom .p-menuitem-icon {
            color: #60a5fa !important;
        }

        ::ng-deep .user-menu-custom .logout-item .p-menuitem-icon,
        ::ng-deep .user-menu-custom .logout-item .p-menuitem-text {
            color: #ef4444 !important;
        }

        ::ng-deep .user-menu-custom .p-menu-separator {
            border-top: 1px solid rgba(0, 0, 0, 0.04) !important;
            margin: 0.5rem 0 !important;
        }

        ::ng-deep .app-dark .user-menu-custom .p-menu-separator {
            border-color: rgba(255, 255, 255, 0.04) !important;
        }

        /* Animation d'entrée */
        ::ng-deep .p-connected-overlay-enter {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
        }

        ::ng-deep .p-connected-overlay-enter-active {
            opacity: 1;
            transform: translateY(0) scale(1);
            transition: opacity 250ms, transform 250ms cubic-bezier(0, 0, 0.2, 1);
        }

        ::ng-deep .p-connected-overlay-exit {
            opacity: 1;
        }

        ::ng-deep .user-menu-custom.p-menu {
            position: absolute !important;
            right: 0 !important;
            left: auto !important;
            top: 100% !important;
            margin-top: 0.75rem !important;
            z-index: 1001 !important;
        }


    `]
})
export class TopbarWidget implements OnInit {
    isScrolled = false;

    public userService = inject(UserService);
    public router = inject(Router);
    private internshipService = inject(InternshipService);
    private stageService = inject(StageService);
    private affectationService = inject(AffectationService);
    private cdr = inject(ChangeDetectorRef);

    currentUser = this.userService.currentUser;
    userMenuItems = this.userService.userMenuItems;
    applications = this.internshipService.getApplications();

    appliedDialogVisible = false;
    detailsDialog = false;
    selectedOffer: InternshipOffer | null = null;
    appliedOffers = signal<InternshipOffer[]>([]);
    mesStages = signal<Stage[]>([]);
    allUsers = signal<User[]>([]);
    mentorName: string | null = null;

    constructor() { }

    ngOnInit() {
        this.updateScrollState();
    }

    getApplicationStatus(offerId: string): string | null {
        const app = this.getApplication(offerId);
        if (!app) return null;

        // Force 'FINI' if there's a validated/invalidated stage for this offer
        const stage = this.mesStages().find(s => s.offreStageId.toString() === offerId);
        if (stage && (stage.etat === EtatStage.VALIDE || stage.etat === EtatStage.NON_VALIDE)) {
            return 'FINI';
        }

        return app.status;
    }

    getApplication(offerId: string): InternshipApplication | null {
        return this.applications().find(a => a.offerId === offerId) || null;
    }

    getStageForOffer(offerId: string): Stage | undefined {
        return this.mesStages().find(s => s.offreStageId.toString() === offerId);
    }

    getStageSeverity(etat: EtatStage) {
        switch (etat) {
            case EtatStage.VALIDE: return 'success';
            case EtatStage.NON_VALIDE: return 'danger';
            case EtatStage.EN_COURS: return 'info';
            case EtatStage.ATT_VALIDATION_ENCADRANT: return 'warn';
            default: return 'secondary';
        }
    }

    getStatusSeverity(status: string) {
        switch (status) {
            case 'ACCEPTEE': return 'success';
            case 'REFUSEE': return 'danger';
            case 'EN_ATTENTE': return 'warn';
            case 'FINI': return 'info';
            default: return 'info';
        }
    }

    @HostListener('window:scroll')
    onWindowScroll() {
        this.updateScrollState();
    }

    async showAppliedDialog() {
        console.log('Opening applied dialog...');
        try {
            this.appliedDialogVisible = true;
            this.cdr.detectChanges();

            this.internshipService.fetchApplications();
            const [offers, stages, basicUsers, encadrants, myMentor] = await Promise.all([
                this.internshipService.getAppliedOffres().catch(() => []),
                this.stageService.getMesStages().catch(() => []),
                this.userService.getUsers().catch(() => []),
                this.userService.getEncadrants().catch(() => []),
                this.affectationService.getEncadrant(this.userService.currentUser()?.id || '').catch(() => null)
            ]);

            if (myMentor) {
                this.mentorName = myMentor.encadrantNom ?? null;
            }

            // Merge users and encadrants, ensuring unique IDs
            const mergedUsers = [...basicUsers];
            encadrants.forEach(enc => {
                if (!mergedUsers.find(u => u.id === enc.id)) {
                    mergedUsers.push(enc);
                }
            });

            console.log('DEBUG - Stages for User:', stages);
            this.allUsers.set(mergedUsers);
            this.mesStages.set(stages);
            this.appliedOffers.set(offers);
            this.cdr.detectChanges();
        } catch (err) {
            console.error('Error fetching applied offers:', err);
        }
    }
    viewOffer(offer: InternshipOffer) {
        this.selectedOffer = offer;
        this.detailsDialog = true;
    }

    navigateToProfile() {
        this.router.navigate(['/landing/profile']);
    }

    getSupervisorName(id: string | undefined, stage?: any): string {
        if (stage?.encadrantFirstName || stage?.encadrantLastName) {
            return `${stage.encadrantFirstName ?? ''} ${stage.encadrantLastName ?? ''}`.trim();
        }
        if (!id || id === 'N/A') return 'N/A';
        const users = this.allUsers();

        const superv = users.find(u =>
            (u.id && u.id.toString().toLowerCase() === id.toString().toLowerCase()) ||
            (u.username && u.username.toLowerCase() === id.toLowerCase())
        );

        if (superv) {
            const name = `${superv.firstName || ''} ${superv.lastName || ''}`.trim();
            return name || superv.username || 'N/A';
        }
        return 'N/A';
    }

    private updateScrollState() {
        this.isScrolled = window.scrollY > 20;
    }
}


