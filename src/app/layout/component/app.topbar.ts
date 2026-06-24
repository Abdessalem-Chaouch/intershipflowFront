import { Component, inject, computed, OnInit, signal, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '@/app/layout/service/layout.service';
import { UserService } from '@/app/services/user.service';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { StageService, Stage, EtatStage } from '@/app/services/stage.service';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, MenuModule, AvatarModule, TagModule],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()" style="position: relative; z-index: 10;">
                <i class="pi pi-bars" style="font-size: 1.75rem;"></i>
            </button>
            <a class="layout-topbar-logo" [routerLink]="currentUser()?.role === 'User' ? '/landing' : '/'" style="margin-left: 0.5rem; position: relative; z-index: 1;">
                <img src="sigaLogo3_cropped.png" alt="SIGA Logo" style="height: 1.8rem; width: auto; object-fit: contain; transition: transform 0.2s ease;" class="hover:scale-105"/>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <!-- Internship Info for Stagiaire -->
            <ng-container *ngIf="currentUser()?.role === 'Stagiaire'">
                <!-- Active Stage (In Progress or others) -->
                <div *ngIf="activeStage() && activeStage()?.etat !== 'ACCEPTE'" class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10 mr-4">
                    <div class="flex flex-col">
                        <span class="text-[9px] font-bold text-primary/60 uppercase leading-tight">Stage Actuel</span>
                        <span class="text-xs font-bold text-primary truncate max-w-[130px]">{{ activeStage()?.titreOffre }}</span>
                    </div>
                    <p-tag [value]="getStageLabel(activeStage()?.etat)" 
                           [severity]="getStageSeverity(activeStage()?.etat)" 
                           styleClass="text-[8px] font-black" />
                </div>

                <!-- Countdown for Accepted Stage -->
                <div *ngIf="activeStage() && activeStage()?.etat === 'ACCEPTE'" 
                     class="hidden md:flex items-center gap-3 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 mr-4 shadow-sm animate-fadein">
                    <div class="flex flex-col">
                        <span class="text-[9px] font-black text-slate-400 uppercase leading-tight tracking-widest">Démarrage dans</span>
                        <span class="text-xs font-black text-[#063970] dark:text-blue-400 font-mono tracking-tighter">{{ countdown() }}</span>
                    </div>
                    <div class="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <div class="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#063970] rounded-xl shadow-lg shadow-[#063970]/20">
                        <i class="pi pi-verified text-[11px] text-white"></i>
                        <span class="text-[10px] font-black text-white uppercase tracking-wider">Accepté</span>
                    </div>
                </div>
                
                <!-- No Active Stage -->
                <div *ngIf="!activeStage()" class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#063970]/5 rounded-xl border border-[#063970]/10 mr-4 transition-all hover:bg-[#063970]/10">
                    <i class="pi pi-info-circle text-[#063970] text-[10px]"></i>
                    <span class="text-[10px] font-black text-[#063970] uppercase tracking-widest">Aucun stage en cours</span>
                </div>
            </ng-container>

            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <div class="relative" style="display:none;">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    
                    
                    <div #userTrigger class="flex items-center gap-2 ml-4 bg-primary/5 dark:bg-blue-400/5 rounded-full pl-4 pr-1 py-1 border border-primary/10 dark:border-blue-400/10 cursor-pointer hover:bg-primary/10 transition-all duration-300 min-w-[200px] justify-between" (click)="userMenu.toggle($event)">
                        <span class="hidden xl:block text-sm font-bold text-primary dark:text-blue-200 whitespace-nowrap px-2">
                            {{ currentUser()?.firstName }} {{ currentUser()?.lastName }}
                        </span>
                        <div class="relative flex items-center">
                            <p-avatar 
                                [image]="currentUser()?.photoUrl"
                                [label]="!currentUser()?.photoUrl ? ((currentUser()?.firstName?.charAt(0) ?? '') + (currentUser()?.lastName?.charAt(0) ?? '')) : ''"
                                icon="pi pi-user" 
                                styleClass="cursor-pointer border-2 border-primary text-white bg-primary shadow-sm hover:scale-110 transition-transform" 
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
    </div>`,
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
            padding: 1.25rem 1rem 0.5rem !important;
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
            box-shadow: 0 4px 12px rgba(6, 57, 112, 0.05);
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
            border-color: rgba(255, 255, 255, 0.06) !important;
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
export class AppTopbar implements OnInit {
    layoutService = inject(LayoutService);
    userService = inject(UserService);
    stageService = inject(StageService);
    router = inject(Router);

    currentUser = this.userService.currentUser;
    userMenuItems = this.userService.userMenuItems;
    activeStage = this.stageService.activeStage;
    countdown = signal<string>('');
    private timer: any;

    ngOnInit() {
        if (this.currentUser()?.role === 'Stagiaire') {
            this.loadActiveStage();
        }
    }

    async loadActiveStage() {
        try {
            // Utiliser getMesStages pour obtenir l'historique et identifier le stage le plus récent
            const stages = await this.stageService.getMesStages();
            if (stages && stages.length > 0) {
                // Trier par ID décroissant pour avoir le dernier créé
                const latestStage = [...stages].sort((a, b) => (b.id || 0) - (a.id || 0))[0];
                
                // Si le dernier stage n'est pas terminé (VALIDE, NON_VALIDE ou ANNULE), on l'affiche comme actif
                const nonActiveStates: (string | undefined)[] = [EtatStage.VALIDE, EtatStage.NON_VALIDE, EtatStage.ANNULE];
                
                if (!nonActiveStates.includes(latestStage.etat)) {
                    this.stageService.activeStage.set(latestStage);
                    
                    if (latestStage.etat === EtatStage.ACCEPTE && latestStage.dateDebut) {
                        this.startCountdown(latestStage.dateDebut);
                    }
                } else {
                    this.stageService.activeStage.set(null);
                }
            } else {
                this.stageService.activeStage.set(null);
            }
        } catch (err) {
            this.stageService.activeStage.set(null);
        }
    }

    startCountdown(dateDebut: string) {
        if (this.timer) clearInterval(this.timer);
        
        const targetDate = new Date(dateDebut).getTime();
        this.updateCountdown(targetDate);
        
        this.timer = setInterval(() => {
            this.updateCountdown(targetDate);
        }, 1000);
    }

    updateCountdown(targetDate: number) {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            this.countdown.set('Démarrage...');
            if (this.timer) clearInterval(this.timer);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        this.countdown.set(`${days}j ${hours}h ${minutes}m ${seconds}s`);
    }

    ngOnDestroy() {
        if (this.timer) clearInterval(this.timer);
    }

    getStageLabel(etat: EtatStage | undefined): string {
        if (etat === EtatStage.ATT_VALIDATION_ENCADRANT) return "En attente de validation de l'encadrant";
        if (etat === EtatStage.ANNULE) return "Stage annulé";
        return etat || '';
    }

    getStageSeverity(etat: EtatStage | undefined) {
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

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }
}
