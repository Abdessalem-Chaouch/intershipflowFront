import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { LayoutService } from '../../layout/service/layout.service';
import { UserService } from '../../services/user.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { AppFloatingConfigurator } from '@/app/layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, ToastModule, CommonModule],
    providers: [MessageService],
    template: `
        <p-toast />
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden relative p-8">
            <!-- Simple Back Link -->
            <app-floating-configurator />
            <div class="flex flex-col items-center justify-center py-12">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, #063970 10%, rgba(6, 57, 112, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-12 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="mb-8 flex items-center justify-center gap-3 cursor-pointer" routerLink="/landing">
                                <span class="font-extrabold text-5xl tracking-widest text-[#063970] dark:text-blue-200 hover:scale-105 transition-transform">SIGA</span>
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Créer un compte</div>
                            <span class="text-muted-color font-medium">Rejoignez-nous pour commencer</span>
                        </div>

                        <div class="flex flex-col gap-4">
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex-1">
                                    <label for="firstname" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Prénom</label>
                                    <input pInputText id="firstname" type="text" placeholder="Prénom" class="w-full" [(ngModel)]="firstName" />
                                </div>
                                <div class="flex-1">
                                    <label for="lastname" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Nom</label>
                                    <input pInputText id="lastname" type="text" placeholder="Nom" class="w-full" [(ngModel)]="lastName" />
                                </div>
                            </div>

                            <div>
                                <label for="email" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Email</label>
                                <input pInputText id="email" type="text" placeholder="Adresse email" class="w-full" [(ngModel)]="email" />
                            </div>

                            <div>
                                <label for="username" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Nom d'utilisateur</label>
                                <input pInputText id="username" type="text" placeholder="Nom d'utilisateur" class="w-full" [(ngModel)]="username" />
                            </div>

                            <div>
                                <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-lg mb-2">Mot de passe</label>
                                <p-password id="password" [(ngModel)]="password" placeholder="Mot de passe" [toggleMask]="true" [fluid]="true" [feedback]="true" promptLabel="Choisissez un mot de passe" weakLabel="Faible" mediumLabel="Moyen" strongLabel="Fort"></p-password>
                            </div>

                            <div class="flex items-center gap-2 mt-2 mb-4">
                                <p-checkbox [(ngModel)]="accepted" id="terms" binary></p-checkbox>
                                <label for="terms">J'accepte les <span class="text-primary font-medium cursor-pointer">conditions d'utilisation</span></label>
                            </div>

                            <p-button label="S'inscrire" styleClass="w-full" [loading]="loading" (onClick)="onRegister()"></p-button>

                             <div class="text-center mt-6 px-4">
                                <span class="text-muted-color font-medium">Déjà un compte ? </span>
                                <a routerLink="/auth/login" class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Se connecter</a>
                            </div>
                            <div class="text-center mt-6 px-4">
                                <a routerLink="/landing" class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Page d'acceuil</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Register {
    firstName: string = '';
    lastName: string = '';
    email: string = '';
    username: string = '';
    password: string = '';
    accepted: boolean = false;
    loading: boolean = false;

    private userService = inject(UserService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    async onRegister() {
        if (!this.firstName || !this.lastName || !this.email || !this.username || !this.password) {
            this.messageService.add({ severity: 'warn', summary: 'Champs manquants', detail: 'Veuillez remplir tous les champs', life: 3000 });
            return;
        }

        if (!this.accepted) {
            this.messageService.add({ severity: 'warn', summary: 'Conditions', detail: 'Veuillez accepter les conditions d\'utilisation', life: 3000 });
            return;
        }

        try {
            this.loading = true;
            await this.userService.registerPublic({
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                username: this.username,
                password: this.password
            });
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Compte créé avec succès', life: 2000 });
            
            setTimeout(() => {
                this.router.navigate(['/auth/login']);
            }, 2000);
            
        } catch (err: any) {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error || 'Erreur lors de l\'inscription', life: 3000 });
        } finally {
            this.loading = false;
        }
    }
}
