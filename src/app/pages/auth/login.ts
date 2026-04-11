import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, CommonModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast />
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden relative">
            <!-- Back to Home Button -->
            <app-floating-configurator />
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, #063970 10%, rgba(6, 57, 112, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="mb-8 flex items-center justify-center gap-3 cursor-pointer" routerLink="/landing">
                                <span class="font-extrabold text-5xl tracking-widest text-[#063970] dark:text-blue-200 hover:scale-105 transition-transform">SIGA</span>
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Bienvenue chez SIGA !</div>
                            <span class="text-muted-color font-medium">Connectez-vous pour continuer</span>
                        </div>

                        <div class="flex flex-col items-center">
                            <div class="w-full md:w-[30rem]">
                                <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Username</label>
                                <input pInputText id="email1" type="text" placeholder="Nom d'utilisateur" class="w-full mb-8" [(ngModel)]="username" />

                                <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Mot de passe</label>
                                <p-password id="password1" [(ngModel)]="password" placeholder="Mot de passe" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false" (keyup.enter)="onLogin()"></p-password>

                                <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                    <div class="flex items-center">
                                        <p-checkbox [(ngModel)]="checked" id="rememberme1" binary class="mr-2"></p-checkbox>
                                        <label for="rememberme1">Se souvenir de moi</label>
                                    </div>
                                    <span routerLink="/auth/forgot-password"  class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Mot de passe oublié ?</span>
                                </div>
                                <p-button label="Se connecter" styleClass="w-full" [loading]="loading" (onClick)="onLogin()"></p-button>

                                 <div class="text-center mt-8 px-4">
                                    <span class="text-muted-color font-medium">Vous n'avez pas de compte ? </span>
                                    <a routerLink="/auth/register" class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">S'inscrire</a>
                                </div>
                                <div class="text-center mt-8 px-4">
                                    <a routerLink="/landing" class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Page d'acceuil</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    username: string = '';
    password: string = '';
    checked: boolean = false;
    loading: boolean = false;

    private userService = inject(UserService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    async onLogin() {
        if (!this.username || !this.password) {
            this.messageService.add({ severity: 'warn', summary: 'Champs manquants', detail: 'Veuillez remplir tous les champs', life: 3000 });
            return;
        }

        try {
            this.loading = true;
            await this.userService.login({
                username: this.username,
                password: this.password
            });
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Connexion réussie', life: 1500 });
            
            setTimeout(() => {
                this.router.navigate(['/']);
            }, 1000);
            
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.message || 'Nom d\'utilisateur ou mot de passe incorrect';
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 3000 });
        } finally {
            this.loading = false;
        }
    }
}
