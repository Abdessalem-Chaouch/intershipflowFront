import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../services/user.service'; // ← adapte le chemin

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [ButtonModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, CommonModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast />
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden relative">
            <app-floating-configurator />
            <div class="flex flex-col items-center justify-center py-12">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, #063970 10%, rgba(6, 57, 112, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="mb-8 flex items-center justify-center gap-3 cursor-pointer" routerLink="/landing">
                                <span class="font-extrabold text-5xl tracking-widest text-[#063970] dark:text-blue-200 hover:scale-105 transition-transform">SIGA</span>
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Réinitialisation</div>
                            <span class="text-muted-color font-medium">Choisissez votre nouveau mot de passe</span>
                        </div>

                        <!-- Lien invalide ou expiré -->
                        <div *ngIf="tokenInvalid" class="flex flex-col items-center text-center">
                            <i class="pi pi-times-circle text-red-500 text-5xl mb-4"></i>
                            <p class="text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Lien invalide ou expiré</p>
                            <p class="text-muted-color mb-6">Ce lien de réinitialisation n'est plus valide.</p>
                            <a routerLink="/auth/forgot-password"
                               class="font-medium cursor-pointer text-primary underline">
                               Demander un nouveau lien
                            </a>
                        </div>

                        <!-- Formulaire de reset -->
                        <div *ngIf="!tokenInvalid" class="flex flex-col items-center">
                            <div class="w-full md:w-[30rem]">
                                <label for="password" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Nouveau mot de passe</label>
                                <p-password id="password" [(ngModel)]="password" placeholder="Nouveau mot de passe" [toggleMask]="true" styleClass="mb-4 w-full" [fluid]="true" [feedback]="true" promptLabel="Nouveau mot de passe" weakLabel="Faible" mediumLabel="Moyen" strongLabel="Fort"></p-password>

                                <label for="confirm" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Confirmer le mot de passe</label>
                                <p-password id="confirm" [(ngModel)]="confirmPassword" placeholder="Confirmer le mot de passe" [toggleMask]="true" styleClass="mb-8 w-full" [fluid]="true" [feedback]="false"></p-password>

                                <p-button label="Réinitialiser le mot de passe" styleClass="w-full" [loading]="loading" (onClick)="onSubmit()"></p-button>

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
export class ResetPassword implements OnInit {
    password: string = '';
    confirmPassword: string = '';
    loading: boolean = false;
    tokenInvalid: boolean = false;
 
    private token: string = ''; // le JWT brut depuis ?key=
 
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private messageService = inject(MessageService);
    private userService = inject(UserService);
 
    ngOnInit() {
        const params = this.route.snapshot.queryParams;
        // Récupérer le token JWT depuis ?key=TOKEN dans l'URL
        this.token = params['key'] || '';
 
        if (!this.token) {
            this.tokenInvalid = true;
        }
    }
 
    async onSubmit() {
        if (!this.password || !this.confirmPassword) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Champs requis',
                detail: 'Veuillez remplir tous les champs',
                life: 3000
            });
            return;
        }
 
        if (this.password !== this.confirmPassword) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Les mots de passe ne correspondent pas',
                life: 3000
            });
            return;
        }
 
        this.loading = true;
 
        try {
            // Envoie le token JWT + nouveau mot de passe au backend Spring
            // Le backend décode le JWT, extrait le userId et change le mdp via Keycloak Admin API
            await firstValueFrom(
                this.userService.resetPasswordWithToken(this.token, this.password)
            );
 
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Mot de passe réinitialisé avec succès !',
                life: 3000
            });
 
            setTimeout(() => {
                this.router.navigate(['/auth/login']);
            }, 2000);
 
        } catch (err: any) {
            console.error('Reset error:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: err?.error?.error || 'Lien expiré ou invalide. Veuillez recommencer.',
                life: 4000
            });
            setTimeout(() => {
                this.tokenInvalid = true;
            }, 4000);
        } finally {
            this.loading = false;
        }
    }
}