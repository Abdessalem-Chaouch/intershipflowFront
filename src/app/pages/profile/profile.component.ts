import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';
import { ProfileService, ProfileResponseDto, UpdateProfileRequest, UpdatePasswordRequest } from '@/app/services/profile.service';
import { UserService } from '@/app/services/user.service';
import { TextareaModule } from 'primeng/textarea';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        PasswordModule,
        CardModule,
        AvatarModule,
        FileUploadModule,
        TextareaModule
    ],
    template: `
        <div class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Profile Card -->
                <div class="lg:col-span-1">
                    <p-card styleClass="h-full shadow-lg border-none overflow-hidden">
                        <div class="flex flex-col items-center p-4">
                            <div class="relative mb-6 group">
                                <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl relative">
                                    <img *ngIf="profile()?.photoUrl; else noPhoto" 
                                         [src]="profile()?.photoUrl" 
                                         class="w-full h-full object-cover" 
                                         alt="Profile photo" />
                                    <ng-template #noPhoto>
                                        <div class="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold">
                                            {{ profile()?.firstName?.charAt(0) }}{{ profile()?.lastName?.charAt(0) }}
                                        </div>
                                    </ng-template>
                                </div>
                                
                                <button (click)="fileInput.click()" 
                                        class="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                                    <i class="pi pi-camera"></i>
                                </button>
                                <input #fileInput type="file" class="hidden" (change)="onFileSelected($event)" accept="image/*">
                            </div>

                            <h2 class="text-2xl font-bold text-slate-800 mb-1">{{ profile()?.firstName }} {{ profile()?.lastName }}</h2>
                            <p class="text-primary font-semibold mb-4 uppercase tracking-wider text-sm">{{ profile()?.role }}</p>
                            
                            <div class="w-full border-t border-slate-100 pt-4 mt-2">
                                <div class="flex items-center gap-3 mb-3">
                                    <i class="pi pi-envelope text-slate-400"></i>
                                    <span class="text-slate-600">{{ profile()?.email }}</span>
                                </div>
                                <div class="flex items-center gap-3 mb-3">
                                    <i class="pi pi-id-card text-slate-400"></i>
                                    <span class="text-slate-600">{{ profile()?.cin || 'CIN non renseigné' }}</span>
                                </div>
                                <div class="flex items-center gap-3 mb-3">
                                    <i class="pi pi-phone text-slate-400"></i>
                                    <span class="text-slate-600">{{ profile()?.phone || 'Téléphone non renseigné' }}</span>
                                </div>
                                <div class="flex items-center gap-3 mb-3">
                                    <i class="pi pi-map-marker text-slate-400"></i>
                                    <span class="text-slate-600">{{ profile()?.address || 'Adresse non renseignée' }}</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-user text-slate-400"></i>
                                    <span class="text-slate-600">@{{ profile()?.username }}</span>
                                </div>
                            </div>

                            <button *ngIf="profile()?.photoUrl" 
                                    (click)="deletePhoto()" 
                                    class="mt-6 text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 transition-colors">
                                <i class="pi pi-trash"></i>
                                Supprimer la photo
                            </button>
                        </div>
                    </p-card>
                </div>

                <!-- Settings Forms -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Personal Info -->
                    <p-card header="Informations personnelles" styleClass="shadow-lg border-none">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div class="flex flex-col gap-2">
                                <label for="firstName" class="font-bold text-slate-700">Prénom</label>
                                <input pInputText id="firstName" [(ngModel)]="updateReq.firstName" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label for="lastName" class="font-bold text-slate-700">Nom</label>
                                <input pInputText id="lastName" [(ngModel)]="updateReq.lastName" />
                            </div>
                            <div class="flex flex-col gap-2 md:col-span-2">
                                <label for="email" class="font-bold text-slate-700">Email</label>
                                <input pInputText id="email" [(ngModel)]="updateReq.email" type="email" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label for="cin" class="font-bold text-slate-700">CIN</label>
                                <input pInputText id="cin" [(ngModel)]="updateReq.cin" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label for="phone" class="font-bold text-slate-700">Téléphone</label>
                                <input pInputText id="phone" [(ngModel)]="updateReq.phone" />
                            </div>
                            <div class="flex flex-col gap-2 md:col-span-2">
                                <label for="address" class="font-bold text-slate-700">Adresse</label>
                                <input pInputText id="address" [(ngModel)]="updateReq.address" />
                            </div>
                            <div class="flex flex-col gap-2 md:col-span-2">
                                <label for="bio" class="font-bold text-slate-700">Bio</label>
                                <textarea pTextarea id="bio" [(ngModel)]="updateReq.bio" rows="3" class="resize-none"></textarea>
                            </div>
                        </div>
                        <ng-template #footer>
                            <div class="flex justify-end">
                                <p-button label="Enregistrer les modifications" 
                                          icon="pi pi-check" 
                                          (onClick)="saveProfile()" 
                                          [loading]="loadingProfile" />
                            </div>
                        </ng-template>
                    </p-card>

                    <!-- Change Password -->
                    <p-card header="Sécurité & Mot de passe" styleClass="shadow-lg border-none">
                        <div class="flex flex-col gap-4 mt-2">
                            <div class="flex flex-col gap-2">
                                <label for="oldPassword" class="font-bold text-slate-700">Mot de passe actuel</label>
                                <p-password id="oldPassword" 
                                            [(ngModel)]="passwordReq.oldPassword" 
                                            [toggleMask]="true" 
                                            [feedback]="false" 
                                            styleClass="w-full" 
                                            inputStyleClass="w-full" />
                            </div>
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex-1 flex flex-col gap-2">
                                    <label for="newPassword" class="font-bold text-slate-700">Nouveau mot de passe</label>
                                    <p-password id="newPassword" 
                                                [(ngModel)]="passwordReq.newPassword" 
                                                [toggleMask]="true" 
                                                styleClass="w-full" 
                                                inputStyleClass="w-full" />
                                </div>
                                <div class="flex-1 flex flex-col gap-2">
                                    <label for="confirmPassword" class="font-bold text-slate-700">Confirmer le nouveau mot de passe</label>
                                    <p-password id="confirmPassword" 
                                                [(ngModel)]="confirmPassword" 
                                                [toggleMask]="true" 
                                                [feedback]="false" 
                                                styleClass="w-full" 
                                                inputStyleClass="w-full" />
                                </div>
                            </div>
                        </div>
                        <ng-template #footer>
                            <div class="flex justify-end">
                                <p-button label="Mettre à jour le mot de passe" 
                                          icon="pi pi-lock" 
                                          severity="secondary"
                                          (onClick)="changePassword()" 
                                          [loading]="loadingPassword" />
                            </div>
                        </ng-template>
                    </p-card>
                </div>
            </div>
        </div>
        <p-toast />
    `,
    providers: [MessageService]
})
export class ProfileComponent implements OnInit {
    profile = signal<ProfileResponseDto | null>(null);
    updateReq: UpdateProfileRequest = {};
    passwordReq: UpdatePasswordRequest = {};
    confirmPassword = '';
    
    loadingProfile = false;
    loadingPassword = false;
    selectedFile: File | null = null;

    private profileService = inject(ProfileService);
    private userService = inject(UserService);
    private messageService = inject(MessageService);

    ngOnInit() {
        this.loadProfile();
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
                console.error('Error fetching profile, falling back to local user data', err);
                const curr = this.userService.currentUser();
                if (curr) {
                    const fallbackData: any = {
                        id: curr.id || '',
                        username: curr.username || '',
                        email: curr.email || '',
                        firstName: curr.firstName || '',
                        lastName: curr.lastName || '',
                        role: curr.role || 'User',
                        photoUrl: curr.photoUrl || null,
                        phone: curr.phone || null,
                        address: curr.address || null,
                        bio: curr.bio || null,
                        cin: curr.cin || null
                    };
                    this.profile.set(fallbackData);
                    this.updateReq = {
                        firstName: fallbackData.firstName,
                        lastName: fallbackData.lastName,
                        email: fallbackData.email,
                        cin: fallbackData.cin,
                        phone: fallbackData.phone,
                        address: fallbackData.address,
                        bio: fallbackData.bio
                    };
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger le profil' });
                }
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.saveProfile(); // Upload immediately when selected
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
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Profil mis à jour avec succès' });
            
            // Sync with UserService if needed
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
            const errorMessage = err.error?.message || err.message || '';
            if (errorMessage.toLowerCase().includes('cin')) {
                detail = 'Ce numéro de CIN est déjà utilisé';
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
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression' });
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
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Ancien mot de passe incorrect' });
                this.loadingPassword = false;
            }
        });
    }
}
