import { Component, HostListener, OnInit, inject, computed } from '@angular/core';
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

@Component({
    selector: 'topbar-widget',
    standalone: true,
    imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule, AppFloatingConfigurator, CommonModule, MenuModule, AvatarModule],
    template: `
        <!-- We use ngClass to apply scrolled/at-top Tailwind classes dynamically including dark variants without needing raw CSS :host hacks -->
        <div class="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between w-full py-5 px-6 lg:px-20 transition-all duration-300"
             [ngClass]="{
                'bg-white/95 dark:bg-[#063970]/95 backdrop-blur-md shadow-[0_2px_20px_rgba(6,57,112,0.12)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] border-b border-transparent dark:border-blue-900/50': isScrolled,
                'bg-transparent': !isScrolled
             }">

            <!-- Logo -->
            <a class="flex items-center cursor-pointer shrink-0 gap-2"
               (click)="router.navigate(['/landing'], { fragment: 'home' })">
                <span class="font-extrabold text-4xl tracking-widest text-[#063970] dark:text-blue-200 hover:scale-105 transition-all">SIGA</span>
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
            <div class="items-center bg-white dark:bg-[#021427] lg:bg-transparent dark:lg:bg-transparent grow justify-end hidden lg:flex absolute lg:static w-full left-0 top-full px-6 lg:px-0 z-20 rounded-border shadow-lg lg:shadow-none py-4 lg:py-0 transition-colors">
                <ul class="list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-10 mr-25">
                    <li>
                        <a (click)="router.navigate(['/landing'], { fragment: 'home' })"
                           pRipple class="px-0 py-2 font-semibold text-lg text-[#063970] dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                           style="cursor: pointer;">
                            Accueil
                        </a>
                    </li>
                    <li>
                        <a (click)="router.navigate(['/landing'], { fragment: 'apropos' })"
                           pRipple class="px-0 py-2 font-semibold text-lg text-[#063970] dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                           style="cursor: pointer;">
                            À Propos
                        </a>
                    </li>
                    <li>
                        <a (click)="router.navigate(['/landing'], { fragment: 'produits' })"
                           pRipple class="px-0 py-2 font-semibold text-lg text-[#063970] dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                           style="cursor: pointer;">
                            Produits
                        </a>
                    </li>
                    <li>
                        <a (click)="router.navigate(['/landing'], { fragment: 'stage' })"
                           pRipple class="px-0 py-2 font-semibold text-lg text-[#063970] dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                           style="cursor: pointer;">
                            Offres de Stage
                        </a>
                    </li>
                    <li>
                        <a (click)="router.navigate(['/landing'], { fragment: 'contact' })"
                           pRipple class="px-0 py-2 font-semibold text-lg text-[#063970] dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                           style="cursor: pointer;">
                            Contact
                        </a>
                    </li>
                </ul>
                <app-floating-configurator [float]="false"/>&nbsp;&nbsp;&nbsp;
                <!-- Auth Section -->
                <div class="flex items-center gap-4 border-t lg:border-t-0 border-surface-200 dark:border-blue-900/50 pt-6 lg:pt-0 mt-4 lg:mt-0">
                    
                    <ng-container *ngIf="!currentUser()">
                        <button pButton pRipple
                                label="Connexion"
                                routerLink="/auth/login"
                                [outlined]="true"
                                [rounded]="true"
                                class="font-semibold text-base border-2 px-6 py-3 text-[#063970] border-[#063970] hover:bg-blue-50 dark:text-blue-300 dark:border-blue-300 dark:hover:bg-blue-900/20 transition-colors"
                                style="background: transparent;">
                        </button>
                        <button pButton pRipple
                                label="S'inscrire"
                                routerLink="/auth/register"
                                [rounded]="true"
                                class="font-semibold text-base border-none px-6 py-3 text-white bg-[#063970] hover:bg-blue-900 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400 transition-colors">
                        </button>
                    </ng-container>

                    <div *ngIf="currentUser()" 
                         class="flex items-center gap-2 ml-4 bg-[#063970]/5 dark:bg-blue-500/10 rounded-full pl-3 pr-1 py-1 border border-[#063970]/10 dark:border-blue-500/20 cursor-pointer hover:bg-[#063970]/10 dark:hover:bg-blue-500/20 transition-all duration-300"
                         (click)="userMenu.toggle($event)">
                        <span class="hidden xl:block text-sm font-semibold text-[#063970] dark:text-blue-100 whitespace-nowrap">
                            {{ currentUser()?.firstName }} {{ currentUser()?.lastName }}
                        </span>
                        <div class="relative">
                            <p-avatar 
                                [label]="(currentUser()?.firstName?.charAt(0) ?? '') + (currentUser()?.lastName?.charAt(0) ?? '')"
                                icon="pi pi-user" 
                                styleClass="border-2 border-[#063970] dark:border-blue-400 text-white bg-[#063970] dark:bg-blue-600 shadow-md hover:scale-110 transition-transform" 
                                size="large" 
                                shape="circle">
                            </p-avatar>
                            <p-menu #userMenu [model]="userMenuItems()" [popup]="true" appendTo="body" styleClass="w-56 mt-2 shadow-xl border-blue-50 dark:bg-[#021427] dark:border-blue-900"></p-menu>
                        </div>
                    </div>

                   
                </div>
            </div>
        </div>
    `
})
export class TopbarWidget implements OnInit {
    isScrolled = false;
    
    public userService = inject(UserService);
    public router = inject(Router);

    currentUser = this.userService.currentUser;

    userMenuItems = this.userService.userMenuItems;

    constructor() { }

    ngOnInit() {
        this.updateScrollState();
    }

    @HostListener('window:scroll')
    onWindowScroll() {
        this.updateScrollState();
    }

    private updateScrollState() {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        this.isScrolled = scrollY > 50;
    }
}
