import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../services/user.service'; // ← adapte le chemin

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [ButtonModule, InputTextModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, CommonModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast />
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden relative">
            <app-floating-configurator />
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, #063970 10%, rgba(6, 57, 112, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="mb-8 flex items-center justify-center gap-3 cursor-pointer" routerLink="/landing">
                                <span class="font-extrabold text-5xl tracking-widest text-[#063970] dark:text-blue-200 hover:scale-105 transition-transform">SIGA</span>
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Mot de passe oublié ?</div>
                            <span class="text-muted-color font-medium">Entrez votre email pour réinitialiser votre mot de passe</span>
                        </div>

                        <div class="flex flex-col items-center">
                            <div class="w-full md:w-[30rem]">
                                <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                                <input pInputText id="email" type="email" placeholder="Adresse email" class="w-full mb-8" [(ngModel)]="email" />

                                <p-button label="Envoyer le lien" styleClass="w-full" [loading]="loading" (onClick)="onSubmit()"></p-button>

                                <div class="text-center mt-8 px-4">
                                    <a routerLink="/auth/login" class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Retour à la connexion</a>
                                </div>
                                <div class="text-center mt-8 px-4">
                                    <a routerLink="/landing" class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Page d'accueil</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ForgotPassword {
    email: string = '';
    loading: boolean = false;

    private router = inject(Router);
    private messageService = inject(MessageService);
    private userService = inject(UserService); // ← injection du service

    async onSubmit() {
        if (!this.email) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Email requis',
                detail: 'Veuillez entrer votre adresse email',
                life: 3000
            });
            return;
        }

        try {
            this.loading = true;

            // ← Appel réel au backend Spring → Keycloak envoie le mail
            await firstValueFrom(this.userService.forgotPassword(this.email));

            this.messageService.add({
                severity: 'success',
                summary: 'Email envoyé',
                detail: 'Si ce compte existe, un email de réinitialisation a été envoyé',
                life: 5000
            });

            setTimeout(() => {
                this.router.navigate(['/auth/login']);
            }, 3000);

        } catch (err: any) {
            // On affiche toujours le même message pour ne pas révéler si l'email existe
            this.messageService.add({
                severity: 'success',
                summary: 'Email envoyé',
                detail: 'Si ce compte existe, un email de réinitialisation a été envoyé',
                life: 5000
            });
            setTimeout(() => {
                this.router.navigate(['/auth/login']);
            }, 3000);
        } finally {
            this.loading = false;
        }
    }
}