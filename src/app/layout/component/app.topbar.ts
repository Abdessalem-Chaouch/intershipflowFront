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
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" [routerLink]="currentUser()?.role === 'User' ? '/landing' : '/'">
                
                <img src="sigaLogo.png" alt="SIGA Logo" style="height: 25px; width: auto; object-fit: contain;"/>
            
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
                    
                    
                    <div class="flex items-center gap-2 ml-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-full transition-colors" (click)="userMenu.toggle($event)">
                        <span class="hidden xl:block text-sm font-semibold text-primary px-2 whitespace-nowrap">
                            {{ currentUser()?.firstName }} {{ currentUser()?.lastName }}
                        </span>
                        <div class="relative">
                            <p-avatar 
                                [image]="currentUser()?.photoUrl"
                                [label]="!currentUser()?.photoUrl ? ((currentUser()?.firstName?.charAt(0) ?? '') + (currentUser()?.lastName?.charAt(0) ?? '')) : ''"
                                icon="pi pi-user" 
                                styleClass="cursor-pointer border-2 border-primary text-white bg-primary shadow-sm hover:scale-110 transition-transform" 
                                shape="circle">
                            </p-avatar>
                            <p-menu #userMenu [model]="userMenuItems()" [popup]="true" appendTo="body" styleClass="w-56 mt-2 shadow-xl border-blue-50 dark:bg-[#021427] dark:border-blue-900"></p-menu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar implements OnInit {
    layoutService = inject(LayoutService);
    userService = inject(UserService);
    stageService = inject(StageService);
    router = inject(Router);

    currentUser = this.userService.currentUser;
    userMenuItems = this.userService.userMenuItems;
    activeStage = signal<Stage | null>(null);
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
                
                // Si le dernier stage n'est pas terminé (VALIDE ou NON_VALIDE), on l'affiche comme actif
                const nonActiveStates: (string | undefined)[] = [EtatStage.VALIDE, EtatStage.NON_VALIDE];
                
                if (!nonActiveStates.includes(latestStage.etat)) {
                    this.activeStage.set(latestStage);
                    
                    if (latestStage.etat === EtatStage.ACCEPTE && latestStage.dateDebut) {
                        this.startCountdown(latestStage.dateDebut);
                    }
                } else {
                    this.activeStage.set(null);
                }
            } else {
                this.activeStage.set(null);
            }
        } catch (err) {
            this.activeStage.set(null);
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
        return etat || '';
    }

    getStageSeverity(etat: EtatStage | undefined) {
        switch (etat) {
            case EtatStage.EN_COURS: return 'info';
            case EtatStage.ATT_VALIDATION_ENCADRANT: return 'warn';
            case EtatStage.VALIDE: return 'success';
            case EtatStage.NON_VALIDE: return 'danger';
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
