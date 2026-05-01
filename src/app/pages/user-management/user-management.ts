import { Component, OnInit, signal, ViewChild, inject, ElementRef } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PasswordModule } from 'primeng/password';
import { User, UserService } from '@/app/services/user.service';
import { AffectationService, EncadrantDTO } from '@/app/services/affectation.service';
import { StageService } from '@/app/services/stage.service';
import { InternshipService } from '@/app/services/internship.service';
import { DatePickerModule } from 'primeng/datepicker';
import { LayoutService } from '@/app/layout/service/layout.service';
import { Signal, computed } from '@angular/core';

interface Column {
    field: string;
    header: string;
}

interface Intern {
    firstName: string;
    lastName: string;
    email: string;
}

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        SelectModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        PasswordModule,
        AvatarModule,
        TooltipModule,
        ToggleSwitchModule,
        DatePickerModule
    ],
    styles: [`
        :host ::ng-deep .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        :host ::ng-deep .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .animate-fadein {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `],
    template: `
        <div class="card border-0 shadow-sm rounded-2xl overflow-hidden mb-6">
            <p-toolbar styleClass="bg-white border-none px-6 py-4">
                <ng-template #start>
                    <div class="flex items-center gap-3">
                        <p-button label="Nouvel Utilisateur" icon="pi pi-plus" severity="primary" 
                            styleClass="rounded-xl px-4 py-2 bg-[#063970] border-none shadow-md hover:shadow-lg transition-all" (onClick)="openNew()" />
                        <p-button label="Supprimer" icon="pi pi-trash" severity="danger" [outlined]="true" 
                            styleClass="rounded-xl px-4 py-2" (onClick)="deleteSelectedUsers()" [disabled]="!selectedUsers || !selectedUsers.length" />
                    </div>
                </ng-template>
                <ng-template #end>
                    <p-button label="Exporter CSV" icon="pi pi-download" [outlined]="true" severity="secondary" 
                        styleClass="rounded-xl px-4 py-2" (onClick)="dt.exportCSV()" />
                </ng-template>
            </p-toolbar>
        </div>

        <p-table
            #dt
            [value]="users()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['firstName', 'lastName', 'email', 'username', 'role']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedUsers"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} utilisateurs"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl border-b border-slate-100">
                    <div>
                        <h5 class="m-0 text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <span class="w-2.5 h-10 bg-[#063970] rounded-full shadow-sm"></span>
                            Gestion des Utilisateurs
                        </h5>
                        <p class="text-slate-500 mt-2 text-sm font-medium">Contrôlez les accès et suivez l'état des stages en temps réel.</p>
                    </div>
                    
                    <div class="flex flex-wrap items-center gap-4">
                        <div class="relative min-w-[220px]">
                            <span class="absolute -top-2.5 left-4 px-2 bg-white text-[10px] font-black text-[#063970] z-10 uppercase tracking-[0.15em] border border-slate-100 rounded-md shadow-sm">Filtre Rôle</span>
                            <p-select [options]="roles" [(ngModel)]="selectedRole" (onChange)="onRoleFilter(dt, $event)" 
                                [showClear]="true" placeholder="Tous les rôles" class="w-full" 
                                styleClass="w-full rounded-2xl border-slate-200 shadow-sm focus:ring-4 focus:ring-[#063970]/10 transition-all">
                                <ng-template #item let-option>
                                    <div class="flex items-center gap-3 py-1">
                                        <span class="w-3 h-3 rounded-full shadow-inner" [ngClass]="getRoleColor(option.value)"></span>
                                        <span class="font-bold text-xs text-slate-700">{{ option.label }}</span>
                                    </div>
                                </ng-template>
                            </p-select>
                        </div>

                        <div class="min-w-[280px]">
                            <p-iconfield class="w-full">
                                <p-inputicon styleClass="pi pi-search text-[#063970] font-bold" />
                                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Rechercher un membre..." 
                                    class="w-full rounded-2xl border-slate-200 shadow-sm px-12 py-3.5 focus:ring-4 focus:ring-[#063970]/10 transition-all placeholder:text-slate-400 placeholder:font-medium" />
                            </p-iconfield>
                        </div>
                    </div>
                </div>
            </ng-template>
            <ng-template #header>
                <tr class="bg-slate-50/80">
                    <th style="width: 4rem" class="pl-6">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th pSortableColumn="lastName" style="min-width: 18rem" class="font-black text-slate-500 text-[11px] uppercase tracking-widest py-5">Utilisateur <p-sortIcon field="lastName" /></th>
                    <th pSortableColumn="email" style="min-width: 14rem" class="font-black text-slate-500 text-[11px] uppercase tracking-widest py-5">Email <p-sortIcon field="email" /></th>
                    <th pSortableColumn="role" style="min-width: 10rem" class="font-black text-slate-500 text-[11px] uppercase tracking-widest py-5">Rôle <p-sortIcon field="role" /></th>
                    <th pSortableColumn="enabled" style="width: 10rem" class="text-center font-black text-slate-500 text-[11px] uppercase tracking-widest py-5">Accès <p-sortIcon field="enabled" /></th>
                    
                    <!-- Dynamic Columns -->
                    <th *ngIf="selectedRole === 'Stagiaire'" style="min-width: 16rem" class="font-black text-slate-500 text-[11px] uppercase tracking-widest py-5">Internship & Status <p-sortIcon field="titreOffre" /></th>
                    <th *ngIf="selectedRole === 'Encadrant'" style="min-width: 15rem" class="font-black text-slate-500 text-[11px] uppercase tracking-widest py-5">Équipe Management</th>

                    <th style="width: 10rem" class="pr-6 text-center font-black text-slate-500 text-[11px] uppercase tracking-widest py-5">Actions</th>
                </tr>
            </ng-template>
            <ng-template #body let-user>
                <tr class="hover:bg-blue-50/30 transition-colors border-b border-slate-100">
                    <td style="width: 4rem">
                        <p-tableCheckbox [value]="user" />
                    </td>
                    <td>
                        <div class="flex items-center gap-4 py-2">
                            <div class="relative">
                                <p-avatar [image]="user.photoUrl || 'assets/layout/images/avatar.png'" shape="circle" size="xlarge" 
                                    styleClass="shadow-sm border-2 border-white ring-2 ring-slate-100" *ngIf="user.photoUrl" />
                                <p-avatar [label]="((user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '')).toUpperCase()" shape="circle" size="xlarge" 
                                    [style]="{ 'background-color': '#eff6ff', color: '#1e40af' }" 
                                    styleClass="shadow-sm border-2 border-white ring-2 ring-slate-100 font-bold" *ngIf="!user.photoUrl" />
                                <span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm" 
                                    [ngClass]="user.enabled === 'ACTIF' ? 'bg-green-500' : 'bg-slate-300'"></span>
                            </div>
                            <div class="flex flex-col gap-0.5">
                                <span class="font-bold text-slate-800 text-base leading-tight">{{ user.firstName }} {{ user.lastName }}</span>
                                <div class="flex items-center gap-2">
                                    <span class="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-500 uppercase tracking-tight">CIN: {{ user.cin || 'N/A' }}</span>
                                    <span class="text-[10px] text-slate-400 font-medium">&#64;{{ user.username }}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="text-slate-600 font-medium text-sm flex items-center gap-2">
                            <i class="pi pi-envelope text-slate-300"></i>
                            {{ user.email }}
                        </span>
                    </td>
                    <td>
                        <p-tag [value]="user.role" [severity]="getSeverity(user.role)" styleClass="font-bold px-3 py-1 rounded-lg" />
                    </td>
                    <td class="text-center">
                        <div class="flex items-center justify-center gap-3">
                            <span class="text-[9px] font-black uppercase tracking-widest min-w-[70px] text-right"
                                [ngClass]="user.enabled === 'ACTIF' ? 'text-[#063970]' : 'text-slate-400'">
                                {{ user.enabled === 'ACTIF' ? 'Activé' : 'Désactivé' }}
                            </span>
                            <p-toggleswitch [ngModel]="user.enabled === 'ACTIF'" (onChange)="toggleStatus(user, $event.checked)" 
                                pTooltip="Changer le statut du compte" tooltipPosition="top" />
                        </div>
                    </td>

                    <td *ngIf="selectedRole === 'Stagiaire'">
                        <div class="flex flex-col gap-2">
                            <!-- Info Card: Visible if stage ID or status exists -->
                            <div *ngIf="user.stageId || user.etat || user.titreOffre" 
                                class="flex items-center bg-slate-50/50 p-2 rounded-xl border border-slate-100 group hover:border-[#063970]/30 transition-all overflow-hidden relative">
                                
                                <div class="flex flex-col truncate pl-3 py-1 flex-1">
                                    <span class="text-[9px] font-black uppercase tracking-widest mb-0.5"
                                        [ngClass]="{
                                            'text-blue-500': user.etat === 'ACCEPTE',
                                            'text-emerald-500': user.etat === 'VALIDE' || user.etat === 'EN_COURS',
                                            'text-amber-500': user.etat?.includes('ATTENTE'),
                                            'text-red-500': user.etat === 'REFUSE' || user.etat === 'NON_VALIDE',
                                            'text-slate-400': !user.etat
                                        }">  
                                        {{ user.etat || 'CANDIDATURE' }}
                                        <span *ngIf="user.numeroStage" class="ml-1 opacity-50">#{{ user.numeroStage }}</span>
                                    </span>

                                    <span class="font-bold text-slate-700 text-xs truncate max-w-[130px]" 
                                        [pTooltip]="user.titreOffre || 'N/A'">
                                        {{ user.titreOffre || 'N/A' }}
                                    </span>
                                </div>

                                <div class="flex items-center gap-1 pr-1">
                                    <!-- Add New Stage (+) : ONLY for finished stages -->
                                    <p-button *ngIf="user.etat === 'VALIDE' || user.etat === 'NON_VALIDE'"
                                        icon="pi pi-plus"
                                        [text]="true"
                                        [rounded]="true"
                                        size="small"
                                        styleClass="w-8 h-8 p-0 m-0 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 border-none"
                                        pTooltip="Nouveau stage"
                                        (onClick)="openCreateStage(user)" />

                                    <p-button
                                        icon="pi pi-info-circle"
                                        [text]="true"
                                        [rounded]="true"
                                        size="small"
                                        styleClass="w-8 h-8 p-0 m-0 flex items-center justify-center text-slate-400 hover:text-[#063970]"
                                        pTooltip="Historique & Détails"
                                        (onClick)="viewStageDetails(user)" />
                                </div>
                            </div>

                            <!-- Big Initialize Button: ONLY if absolutely no data (no stage, no offer) -->
                            <div *ngIf="!user.stageId && !user.titreOffre" class="flex">
                                <p-button 
                                    label="Initialiser Stage" 
                                    icon="pi pi-plus-circle" 
                                    [text]="true" 
                                    styleClass="text-[11px] font-black px-5 py-2.5 rounded-2xl transition-all border-none
                                                bg-[#063970]/10 text-[#063970] 
                                                hover:bg-[#063970] hover:text-white hover:shadow-lg hover:shadow-[#063970]/20 active:scale-95"
                                    (onClick)="openCreateStage(user)" 
                                />
                            </div>
                        </div>
                    </td>

                    <td *ngIf="selectedRole === 'Encadrant'">
                        <p-button label="Voir Management" icon="pi pi-chart-bar" [text]="true" size="small" 
                            styleClass="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 border border-indigo-100 rounded-xl shadow-sm" 
                            (onClick)="viewInterns(user)" />
                    </td>

                    <td class="text-center">
                        <div class="flex items-center justify-center gap-1">
                            <p-button icon="pi pi-eye" [rounded]="true" [text]="true" severity="info" (click)="viewUserDetails(user)" pTooltip="Détails" />
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="warn" (click)="editUser(user)" pTooltip="Modifier" />
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (click)="deleteUser(user)" pTooltip="Supprimer" />
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="userDialog" [style]="{ width: '500px' }" header="Détails de l'utilisateur" [modal]="true" class="p-fluid" [contentStyle]="{ 'max-height': '500px', 'overflow-y': 'auto' }">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div class="flex gap-4">
                        <div class="flex-1">
                            <label for="lastName" class="block font-bold mb-2">Nom</label>
                            <input type="text" pInputText id="lastName" [(ngModel)]="user.lastName" required autofocus fluid />
                            <small class="text-red-500" *ngIf="submitted && !user.lastName">Le nom est requis.</small>
                        </div>
                        <div class="flex-1">
                            <label for="firstName" class="block font-bold mb-2">Prénom</label>
                            <input type="text" pInputText id="firstName" [(ngModel)]="user.firstName" required fluid />
                            <small class="text-red-500" *ngIf="submitted && !user.firstName">Le prénom est requis.</small>
                        </div>
                    </div>

                    <div>
                        <label for="email" class="block font-bold mb-2">Email</label>
                        <input type="email" pInputText id="email" [(ngModel)]="user.email" required fluid />
                        <small class="text-red-500" *ngIf="submitted && !user.email">L'email est requis.</small>
                    </div>

                    <div>
                        <label for="username" class="block font-bold mb-2">Nom d'utilisateur</label>
                        <input type="text" pInputText id="username" [(ngModel)]="user.username" required fluid />
                        <small class="text-red-500" *ngIf="submitted && !user.username">Le nom d'utilisateur est requis.</small>
                    </div>

                    <div *ngIf="!user.id">
                        <label for="password" class="block font-bold mb-2">Mot de passe</label>
                        <p-password id="password" [(ngModel)]="user.password" [toggleMask]="true" [fluid]="true" [feedback]="true" placeholder="Mot de passe"></p-password>
                        <small class="text-red-500" *ngIf="submitted && !user.password">Le mot de passe est requis.</small>
                    </div>

                    <div>
                        <label for="role" class="block font-bold mb-2">Rôle</label>
                        <p-select [(ngModel)]="user.role" inputId="role" [options]="roles" placeholder="Sélectionner un rôle" [fluid]="true" appendTo="body" />
                        <small class="text-red-500" *ngIf="submitted && !user.role">Le rôle est requis.</small>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" text (click)="hideDialog()" [disabled]="loading()" />
                <p-button label="Enregistrer" icon="pi pi-check" (click)="saveUser()" [loading]="loading()" [style]="{ 'background-color': '#063970', 'border-color': '#063970' }" />
            </ng-template>
        </p-dialog>

        <!-- Managed Interns and Stages Dialog -->
        <p-dialog [(visible)]="managedInternsDialog" [style]="{ width: '650px' }" [header]="selectedSupervisor ? 'Management de ' + selectedSupervisor.firstName + ' ' + selectedSupervisor.lastName : 'Détails Management'" [modal]="true">
            <div class="flex flex-col gap-6 py-2">
                <!-- Interns Section -->
                <div>
                    <h6 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <i class="pi pi-users text-blue-600"></i> Stagiaires Affectés ({{ selectedSupervisor?.stagiaires?.length || 0 }})
                    </h6>
                    <div *ngIf="selectedSupervisor?.stagiaires && selectedSupervisor!.stagiaires!.length > 0; else noInterns" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div *ngFor="let intern of selectedSupervisor!.stagiaires" class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p-avatar [label]="intern.firstName?.charAt(0)" shape="circle" styleClass="bg-blue-100 text-blue-700 font-bold" />
                            <div class="flex flex-col">
                                <span class="font-bold text-slate-800 text-sm">{{ intern.firstName }} {{ intern.lastName }}</span>
                                <span class="text-[10px] text-slate-500 uppercase font-semibold">{{ intern.titreOffre }}</span>
                            </div>
                        </div>
                    </div>
                    <ng-template #noInterns>
                        <div class="p-4 text-center text-slate-400 italic bg-slate-50 rounded-lg">Aucun stagiaire affecté.</div>
                    </ng-template>
                </div>

                <!-- Stages Section -->
                <div>
                    <h6 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <i class="pi pi-briefcase text-orange-600"></i> Liste des Stages ({{ selectedSupervisor?.stages?.length || 0 }})
                    </h6>
                    <div *ngIf="selectedSupervisor?.stages && selectedSupervisor!.stages!.length > 0; else noStages" class="flex flex-col gap-2">
                        <div *ngFor="let stage of selectedSupervisor!.stages" class="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                            <div class="flex flex-col">
                                <span class="font-bold text-slate-800 text-sm">{{ stage.titreOffre }}</span>
                                <span class="text-[10px] text-slate-500">Du {{ stage.dateDebut | date:'dd/MM/yyyy' }} au {{ stage.dateFin | date:'dd/MM/yyyy' }}</span>
                            </div>
                            <p-tag [value]="stage.etat" [severity]="getEtatSeverity(stage.etat)" styleClass="text-[10px]" />
                        </div>
                    </div>
                    <ng-template #noStages>
                        <div class="p-4 text-center text-slate-400 italic bg-slate-50 rounded-lg">Aucun stage répertorié.</div>
                    </ng-template>
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Fermer" icon="pi pi-times" [text]="true" (click)="managedInternsDialog = false" />
            </ng-template>
        </p-dialog>



        <!-- User Details Dialog Compact Vertical Card Optimized -->
        <p-dialog [(visible)]="userDetailsDialog" [style]="{ width: '90vw', maxWidth: '500px' }" [modal]="true" 
            styleClass="compact-card-dialog border-none shadow-2xl" [closable]="false" [showHeader]="false" [breakpoints]="{ '640px': '98vw' }"
            contentStyleClass="p-0 overflow-hidden rounded-[1.5rem]">
            
            <div *ngIf="selectedUserDetails" class="bg-white relative">
                <!-- Close Button -->
                <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="secondary" 
                    styleClass="absolute top-4 right-4 z-50 w-9 h-9 p-0 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white border border-white/30 transition-all shadow-lg" 
                    (click)="userDetailsDialog = false" />

                <!-- Compact Hero Header -->
                <div class="h-44 bg-gradient-to-br from-[#063970] via-[#1a4b8c] to-[#3b82f6] relative flex items-center justify-center shrink-0 rounded-t-[1.5rem]">
                    <div class="absolute inset-0 opacity-10 pointer-events-none">
                        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 16px 16px;"></div>
                    </div>
                </div>

                <!-- Card Content -->
                <div class="px-5 pb-6 -mt-20 relative z-10">
                    <div class="flex flex-col items-center">
                        <!-- Scaled Down Avatar -->
                        <div class="relative mb-4 group">
                            <div class="w-36 h-36 md:w-44 md:h-44 rounded-full border-[6px] border-white shadow-lg overflow-hidden bg-white relative z-10 transition-transform duration-500 hover:scale-105">
                                <img *ngIf="selectedUserDetails.photoUrl" [src]="selectedUserDetails.photoUrl" 
                                    class="w-full h-full object-cover" alt="Profile" />
                                <div *ngIf="!selectedUserDetails.photoUrl" class="text-[#063970] text-5xl md:text-7xl font-black flex items-center justify-center h-full bg-slate-50">
                                    {{ ((selectedUserDetails.firstName?.charAt(0) || '') + (selectedUserDetails.lastName?.charAt(0) || '')).toUpperCase() }}
                                </div>
                            </div>
                        </div>

                        <!-- Enhanced Identity Card -->
                        <div class="w-full bg-white rounded-2xl p-6 shadow-md border border-slate-50 flex flex-col items-center mb-5 hover:border-blue-200 transition-colors group/id">
                            <div class="flex items-center gap-2 mb-2">
                                <h2 class="text-2xl md:text-3xl font-black text-slate-900 m-0 tracking-tight leading-tight text-center">
                                    {{ selectedUserDetails.firstName }} {{ selectedUserDetails.lastName }}
                                </h2>
                                <div class="w-2.5 h-2.5 rounded-full shadow-sm animate-pulse" 
                                    [ngClass]="selectedUserDetails.enabled === 'ACTIF' ? 'bg-green-500' : 'bg-slate-300'"></div>
                            </div>
                            <p class="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4 italic group-hover/id:text-blue-500 transition-colors">
                                &#64;{{ selectedUserDetails.username || 'user' }}
                            </p>
                            
                            <div class="flex flex-wrap justify-center gap-3">
                                <p-tag [value]="selectedUserDetails.role || 'User'" [severity]="getSeverity(selectedUserDetails.role || 'User')" 
                                    styleClass="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm" />
                                <div class="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black text-slate-500 tracking-wider flex items-center gap-2 hover:bg-white hover:border-blue-100 transition-all">
                                    <i class="pi pi-id-card text-blue-500"></i> CIN: {{ selectedUserDetails.cin || 'N/A' }}
                                </div>
                            </div>
                        </div>

                        <!-- Interactive Contact Grid -->
                        <div class="w-full grid grid-cols-2 gap-4 mb-4">
                            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center group transition-all hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5">
                                <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-2 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <i class="pi pi-envelope text-sm"></i>
                                </div>
                                <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-blue-400">Email</span>
                                <span class="text-xs font-bold text-slate-600 truncate w-full group-hover:text-blue-700">{{ selectedUserDetails.email || 'N/A' }}</span>
                            </div>
                            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center group transition-all hover:bg-emerald-50 hover:border-emerald-200 hover:-translate-y-0.5">
                                <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <i class="pi pi-phone text-sm"></i>
                                </div>
                                <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-emerald-400">Téléphone</span>
                                <span class="text-xs font-bold text-slate-600 w-full group-hover:text-emerald-700">{{ selectedUserDetails.phone || 'N/A' }}</span>
                            </div>
                        </div>

                        <!-- Interactive Address -->
                        <div class="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 mb-4 group transition-all hover:bg-orange-50 hover:border-orange-200 hover:-translate-y-0.5">
                            <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                <i class="pi pi-map-marker text-sm"></i>
                            </div>
                            <div class="flex flex-col truncate">
                                <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5 group-hover:text-orange-400">Adresse</span>
                                <span class="text-xs font-bold text-slate-600 truncate group-hover:text-orange-700">{{ selectedUserDetails.address || 'Non spécifiée' }}</span>
                            </div>
                        </div>

                        <!-- Status & Bio -->
                        <div class="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-2 flex items-center justify-between hover:bg-white hover:border-blue-100 transition-all group/status">
                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">État du compte</span>
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] font-bold" [ngClass]="selectedUserDetails.enabled === 'ACTIF' ? 'text-green-600' : 'text-slate-400'">
                                    {{ selectedUserDetails.enabled === 'ACTIF' ? 'COMPTE ACTIF' : 'COMPTE INACTIF' }}
                                </span>
                                <div class="w-2 h-2 rounded-full" [ngClass]="selectedUserDetails.enabled === 'ACTIF' ? 'bg-green-500' : 'bg-slate-300'"></div>
                            </div>
                        </div>

                        <!-- Bio Block Optimized -->
                        <div class="w-full bg-blue-50/30 rounded-2xl p-6 border border-blue-100/30 relative overflow-hidden">
                            <h4 class="text-[8px] text-blue-400 font-black uppercase tracking-[0.2em] mb-2 opacity-80">À propos</h4>
                            <p class="text-xs text-slate-500 leading-relaxed italic m-0 relative z-10 line-clamp-3">
                                "{{ selectedUserDetails.bio || "Ce membre n'a pas encore rédigé sa biographie." }}"
                            </p>
                        </div>

                        <!-- Small Edit Button -->
                        <div class="mt-6 flex justify-center w-full">
                            <p-button label="Modifier" icon="pi pi-user-edit" 
                                styleClass="bg-[#063970] border-none px-8 py-2.5 rounded-xl shadow-lg text-xs font-bold transition-transform hover:scale-105 active:scale-95" 
                                (click)="editFromDetails()" />
                        </div>
                    </div>
                </div>
            </div>
        </p-dialog>

        <!-- Stage Details Dialog - Premium Redesign -->
        <p-dialog [(visible)]="stageDetailsDialog" [style]="{ width: '90vw', maxWidth: '650px' }" [modal]="true" 
            styleClass="premium-details-dialog border-none shadow-2xl" [closable]="false" [showHeader]="false"
            contentStyleClass="p-0 overflow-hidden rounded-[2rem] bg-slate-50/30 backdrop-blur-sm">
            
            <div *ngIf="selectedStageUser" class="bg-white min-h-[500px] flex flex-col">
                <!-- Header: Identity & Actions -->
                <div class="p-8 pb-4 flex items-start justify-between">
                    <div class="flex items-center gap-5">
                        <div class="relative">
                            <p-avatar [label]="selectedStageUser.firstName?.charAt(0)" shape="circle" size="xlarge" 
                                styleClass="bg-[#063970] text-white font-black shadow-xl ring-4 ring-slate-50" />
                            <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center shadow-sm">
                                <i class="pi pi-briefcase text-[10px] text-white"></i>
                            </div>
                        </div>
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-black text-slate-800 m-0 leading-tight">
                                {{ selectedStageUser.firstName }} {{ selectedStageUser.lastName }}
                            </h2>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Dossier de Stage</span>
                                <span class="w-1 h-1 rounded-full bg-slate-200"></span>
                                <span class="text-xs font-black text-[#063970] tracking-tighter">&#64;{{ selectedStageUser.username }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-3">
                        <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="secondary"
                            styleClass="w-10 h-10 p-0 bg-slate-50 hover:bg-slate-100 text-slate-400 border-none transition-all" 
                            (click)="stageDetailsDialog = false" />
                        
                        <!-- Total Stages Badge -->
                        <div class="flex items-center gap-2 px-4 py-2 bg-[#063970]/5 rounded-2xl border border-[#063970]/10 shadow-sm shrink-0">
                            <div class="w-2 h-2 rounded-full bg-[#063970] animate-pulse"></div>
                            <span class="text-[10px] font-black text-[#063970] uppercase tracking-widest">
                                Total: {{ selectedStageUser.stages?.length || 0 }} Stages
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Simplified Pagination Navigation -->
                <div *ngIf="selectedStageUser.stages && selectedStageUser.stages.length > 1" 
                    class="mx-8 mb-4 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div class="flex flex-col">
                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Navigation de l'historique</span>
                        <span class="text-[11px] font-bold text-slate-700">Stage {{ currentStageIndex + 1 }} sur {{ selectedStageUser.stages.length }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-button icon="pi pi-chevron-left" [rounded]="true" [text]="true" size="small"
                            [disabled]="currentStageIndex === 0"
                            (onClick)="currentStageIndex = currentStageIndex - 1"
                            styleClass="w-10 h-10 p-0 bg-white border border-slate-100 text-slate-500 hover:text-[#063970] hover:shadow-md transition-all disabled:opacity-30" />
                        
                        <p-button icon="pi pi-chevron-right" [rounded]="true" [text]="true" size="small"
                            [disabled]="currentStageIndex === (selectedStageUser.stages.length - 1)"
                            (onClick)="currentStageIndex = currentStageIndex + 1"
                            styleClass="w-10 h-10 p-0 bg-white border border-slate-100 text-slate-500 hover:text-[#063970] hover:shadow-md transition-all disabled:opacity-30" />
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="flex-1 p-8 pt-2 space-y-6" *ngIf="selectedStageUser.stages && selectedStageUser.stages.length > 0; else noStagesInfo">
                    <div *ngIf="selectedStageUser.stages[currentStageIndex] as currentStage" class="animate-fadein">
                        
                        <!-- Status Bar -->
                        <div class="flex items-center justify-between mb-6">
                            <div class="flex items-center gap-3">
                                <div class="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black text-[#063970] uppercase tracking-widest flex items-center gap-2">
                                    <i class="pi pi-info-circle text-[10px]"></i>
                                    {{ currentStage.etat }}
                                </div>
                                <div *ngIf="currentStage.documentsValides" class="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                    <i class="pi pi-verified text-[10px]"></i>
                                    Documents OK
                                </div>
                            </div>
                            <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                Réf: STG-{{ currentStage.id }}
                            </span>
                        </div>

                        <!-- Info Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <!-- Offer Info -->
                            <div class="col-span-1 md:col-span-2 p-5 bg-gradient-to-r from-slate-50 to-white rounded-[1.5rem] border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
                                <div class="flex items-start gap-4">
                                    <div class="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#063970] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                        <i class="pi pi-bookmark-fill text-lg"></i>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Position / Offre</span>
                                        <span class="text-base font-black text-slate-800 leading-tight">{{ currentStage.titreOffre || 'Intitulé non spécifié' }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Dates -->
                            <div class="p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                    <i class="pi pi-calendar"></i>
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Début du stage</span>
                                    <span class="text-sm font-bold text-slate-700">{{ currentStage.dateDebut | date:'longDate' }}</span>
                                </div>
                            </div>
                            <div class="p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                    <i class="pi pi-calendar-plus"></i>
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Fin prévue</span>
                                    <span class="text-sm font-bold text-slate-700">{{ currentStage.dateFin | date:'longDate' }}</span>
                                </div>
                            </div>

                            <!-- Supervisor Section -->
                            <div class="col-span-1 md:col-span-2 mt-2">
                                <div class="p-6 bg-[#063970]/[0.02] rounded-[2rem] border border-[#063970]/5">
                                    <div class="flex items-center justify-between mb-5">
                                        <div class="flex items-center gap-2">
                                            <i class="pi pi-users text-[#063970]"></i>
                                            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Encadrement Académique</span>
                                        </div>
                                        <p-button *ngIf="currentStage.encadrantNom || currentStage.encadrantId" 
                                            icon="pi pi-trash" severity="danger" [text]="true" size="small" 
                                            label="Désaffecter" styleClass="text-[10px] font-black hover:bg-red-50" (onClick)="detachSupervisorFromDetails()" />
                                    </div>

                                    <div *ngIf="currentStage.encadrantNom || currentStage.encadrantId; else noEnc" 
                                        class="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between animate-fadein">
                                        <div class="flex items-center gap-4">
                                            <p-avatar [label]="(currentStage.encadrantNom || 'E').charAt(0).toUpperCase()" shape="circle" 
                                                styleClass="bg-blue-600 text-white font-bold ring-4 ring-blue-50" />
                                            <div class="flex flex-col">
                                                <span class="text-sm font-black text-slate-800 leading-none mb-1">
                                                    {{ currentStage.encadrantNom || getSupervisorName(currentStage.encadrantId) }}
                                                </span>
                                                <span class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Encadrant Assigné</span>
                                            </div>
                                        </div>
                                        <p-button icon="pi pi-refresh" [text]="true" size="small" severity="info" 
                                            pTooltip="Modifier l'encadrant" (onClick)="showSupervisorSelect = !showSupervisorSelect" 
                                            styleClass="hover:bg-blue-50" />
                                    </div>

                                    <ng-template #noEnc>
                                        <div class="p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white/50">
                                            <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                <i class="pi pi-user-plus text-xl"></i>
                                            </div>
                                            <div class="text-center">
                                                <p class="text-xs font-bold text-slate-400 m-0">Aucun encadrant assigné à ce stage</p>
                                                <p-button label="Affecter maintenant" [text]="true" styleClass="text-[10px] font-black text-[#063970] mt-1" 
                                                    (onClick)="showSupervisorSelect = true" />
                                            </div>
                                        </div>
                                    </ng-template>

                                    <!-- Selection Overlay -->
                                    <div *ngIf="showSupervisorSelect" class="mt-4 p-4 bg-white rounded-2xl border border-[#063970]/10 shadow-lg animate-fadein relative z-20">
                                        <div class="flex items-center justify-between mb-4">
                                            <span class="text-[10px] font-black text-[#063970] uppercase tracking-widest">Nouvel Encadrant</span>
                                            <p-button icon="pi pi-times" [text]="true" severity="secondary" size="small" (onClick)="showSupervisorSelect = false" />
                                        </div>
                                        <div class="flex gap-2">
                                            <p-select [options]="getAvailableSupervisors()" [(ngModel)]="selectedSupervisorId" 
                                                optionLabel="fullName" optionValue="id" placeholder="Choisir dans la liste..." 
                                                styleClass="flex-1 rounded-xl" appendTo="body" />
                                            <p-button icon="pi pi-check" severity="success" [disabled]="!selectedSupervisorId" 
                                                styleClass="rounded-xl" (onClick)="confirmAssignmentFromDetails()" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <!-- No Stages Placeholder -->
                <ng-template #noStagesInfo>
                    <div class="flex-1 flex flex-col items-center justify-center p-12 text-center gap-6">
                        <div class="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-100">
                            <i class="pi pi-calendar-times text-5xl"></i>
                        </div>
                        <div class="max-w-xs">
                            <h3 class="text-xl font-black text-slate-800 mb-2">Historique Vide</h3>
                            <p class="text-sm text-slate-400 leading-relaxed">
                                Ce stagiaire n'a pas encore de contrat de stage initialisé dans le système.
                            </p>
                        </div>
                        <p-button label="Initialiser un Stage" icon="pi pi-plus" 
                            styleClass="bg-[#063970] border-none px-8 py-3 rounded-2xl shadow-xl shadow-[#063970]/20 font-black" 
                            (click)="stageDetailsDialog = false; openCreateStage(selectedStageUser!)" />
                    </div>
                </ng-template>
            </div>
        </p-dialog>



        <!-- Create Stage Dialog - Sync with Global Theme -->
        <p-dialog [(visible)]="createStageDialog" [style]="{ width: '90vw', maxWidth: '550px' }" [modal]="true" 
            [styleClass]="layoutService.isDarkTheme() ? 'dark-premium-dialog border-none shadow-2xl' : 'light-premium-dialog border-none shadow-2xl'" 
            [closable]="false" [showHeader]="false"
            [contentStyleClass]="layoutService.isDarkTheme() ? 'p-0 overflow-hidden rounded-[2rem] bg-[#0f172a] text-slate-100' : 'p-0 overflow-hidden rounded-[2rem] bg-white text-slate-800'">
            
            <div *ngIf="selectedStageUser" class="flex flex-col">
                <!-- Header Section -->
                <div [ngClass]="layoutService.isDarkTheme() ? 'p-10 bg-gradient-to-br from-[#063970] to-[#0a1128]' : 'p-10 bg-slate-50'"
                    class="relative overflow-hidden shrink-0 border-b transition-colors duration-500"
                    [class.border-white/5]="layoutService.isDarkTheme()"
                    [class.border-slate-100]="!layoutService.isDarkTheme()">
                    
                    <!-- Glow effect only in dark mode -->
                    <div *ngIf="layoutService.isDarkTheme()" class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    
                    <div class="relative z-10 flex items-center justify-between">
                        <div class="flex items-center gap-5">
                            <div [ngClass]="layoutService.isDarkTheme() ? 'bg-white/5 border-white/10 ring-white/20' : 'bg-[#063970]/10 border-[#063970]/10 ring-[#063970]/5'"
                                class="w-16 h-16 rounded-2xl backdrop-blur-xl flex items-center justify-center border shadow-sm ring-1">
                                <i class="pi pi-bolt text-3xl" [ngClass]="layoutService.isDarkTheme() ? 'text-blue-400' : 'text-[#063970]'"></i>
                            </div>
                            <div class="flex flex-col">
                                <h3 class="text-2xl font-black m-0 tracking-tight" [ngClass]="layoutService.isDarkTheme() ? 'text-white' : 'text-slate-800'">Initialiser un Stage</h3>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="w-2 h-2 rounded-full" [ngClass]="layoutService.isDarkTheme() ? 'bg-blue-500 animate-pulse' : 'bg-blue-400'"></span>
                                    <p class="text-[10px] font-black uppercase tracking-[0.2em] m-0" [ngClass]="layoutService.isDarkTheme() ? 'text-blue-300/60' : 'text-slate-400'">Nouveau Dossier Académique</p>
                                </div>
                            </div>
                        </div>
                        
                        <p-button icon="pi pi-times" [rounded]="true" [text]="true" 
                            (click)="createStageDialog = false"
                            [styleClass]="layoutService.isDarkTheme() ? 'w-10 h-10 p-0 bg-white/5 hover:bg-white/10 text-white/50 border border-white/5' : 'w-10 h-10 p-0 bg-slate-200/50 hover:bg-slate-200 text-slate-400 border border-slate-200/50'" />
                    </div>
                </div>

                <!-- Form Content -->
                <div class="p-10 space-y-8 transition-colors duration-500" [ngClass]="layoutService.isDarkTheme() ? 'bg-[#0f172a]' : 'bg-white'">
                    <!-- Trainee Context -->
                    <div [ngClass]="layoutService.isDarkTheme() ? 'bg-white/5 border-white/5 shadow-inner' : 'bg-slate-50 border-slate-100'"
                        class="flex items-center gap-4 p-5 rounded-3xl border backdrop-blur-sm">
                        <div class="relative">
                            <p-avatar [label]="selectedStageUser.firstName?.charAt(0)" shape="circle" size="large" 
                                styleClass="bg-blue-600 text-white font-black shadow-lg ring-4 ring-white/5" />
                            <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 shadow-sm"
                                [ngClass]="layoutService.isDarkTheme() ? 'bg-emerald-500 border-[#0f172a]' : 'bg-emerald-500 border-white'"></div>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[9px] font-black uppercase tracking-widest mb-0.5" [ngClass]="layoutService.isDarkTheme() ? 'text-blue-400' : 'text-slate-400'">Stagiaire</span>
                            <span class="font-black text-lg leading-tight" [ngClass]="layoutService.isDarkTheme() ? 'text-white' : 'text-slate-800'">{{ selectedStageUser.firstName }} {{ selectedStageUser.lastName }}</span>
                            <span class="text-xs font-medium opacity-60" [ngClass]="layoutService.isDarkTheme() ? 'text-slate-500' : 'text-slate-400'">&#64;{{ selectedStageUser.username }}</span>
                        </div>
                    </div>

                    <!-- Main Fields -->
                    <div class="space-y-6">
                        <!-- Internship Offer Selection -->
                        <div class="flex flex-col gap-2.5">
                            <label class="text-[10px] font-black uppercase tracking-[0.2em] ml-1" [ngClass]="layoutService.isDarkTheme() ? 'text-slate-500' : 'text-slate-400'">Choix de l'Offre de Stage</label>
                            <p-select [options]="offers()" 
                                [(ngModel)]="newStage.offreStageId" 
                                optionLabel="title" 
                                optionValue="id"
                                placeholder="Sélectionner une offre disponible..." 
                                [styleClass]="layoutService.isDarkTheme() ? 'w-full bg-white/5 border-white/10 text-white rounded-2xl p-1' : 'w-full bg-slate-50 border-slate-200 text-slate-800 rounded-2xl p-1'"
                                appendTo="body" />
                        </div>

                        <!-- Date Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="flex flex-col gap-2.5">
                                <label class="text-[10px] font-black uppercase tracking-[0.2em] ml-1" [ngClass]="layoutService.isDarkTheme() ? 'text-slate-500' : 'text-slate-400'">Date de Début</label>
                                <div class="relative group">
                                    <p-datepicker [(ngModel)]="newStage.dateDebut" dateFormat="yy-mm-dd" [showIcon]="true" 
                                        appendTo="body" placeholder="Sélectionner..." 
                                        styleClass="w-full" 
                                        [inputStyleClass]="layoutService.isDarkTheme() ? 'w-full bg-white/5 border-white/10 rounded-2xl shadow-sm py-3 px-4 text-white focus:border-blue-500/50 transition-all' : 'w-full bg-slate-50 border-slate-200 rounded-2xl shadow-sm py-3 px-4 text-slate-800 focus:border-[#063970]/30 transition-all'" />
                                </div>
                            </div>
                            <div class="flex flex-col gap-2.5">
                                <label class="text-[10px] font-black uppercase tracking-[0.2em] ml-1" [ngClass]="layoutService.isDarkTheme() ? 'text-slate-500' : 'text-slate-400'">Date de Fin</label>
                                <div class="relative group">
                                    <p-datepicker [(ngModel)]="newStage.dateFin" dateFormat="yy-mm-dd" [showIcon]="true" 
                                        appendTo="body" placeholder="Sélectionner..." 
                                        styleClass="w-full" 
                                        [inputStyleClass]="layoutService.isDarkTheme() ? 'w-full bg-white/5 border-white/10 rounded-2xl shadow-sm py-3 px-4 text-white focus:border-blue-500/50 transition-all' : 'w-full bg-slate-50 border-slate-200 rounded-2xl shadow-sm py-3 px-4 text-slate-800 focus:border-[#063970]/30 transition-all'" />
                                </div>
                            </div>
                        </div>

                        <!-- Supervisor Selection -->
                        <div class="flex flex-col gap-2.5">
                            <label class="text-[10px] font-black uppercase tracking-[0.2em] ml-1" [ngClass]="layoutService.isDarkTheme() ? 'text-slate-500' : 'text-slate-400'">Encadrant Affecté</label>
                            <p-select [options]="getAvailableSupervisors()" 
                                [(ngModel)]="newStage.encadrantId" 
                                optionLabel="fullName" 
                                optionValue="id"
                                placeholder="Optionnel : Choisir un encadrant..." 
                                [styleClass]="layoutService.isDarkTheme() ? 'w-full bg-white/5 border-white/10 text-white rounded-2xl p-1' : 'w-full bg-slate-50 border-slate-200 text-slate-800 rounded-2xl p-1'"
                                appendTo="body">
                                <ng-template #item let-option>
                                    <div class="flex items-center gap-3 py-1">
                                        <p-avatar [label]="option.fullName.charAt(0)" shape="circle" styleClass="bg-blue-600 text-white font-bold" />
                                        <span [ngClass]="layoutService.isDarkTheme() ? 'text-slate-100' : 'text-slate-700'" class="font-bold">{{ option.fullName }}</span>
                                    </div>
                                </ng-template>
                            </p-select>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="flex flex-col gap-4 pt-6 border-t" [ngClass]="layoutService.isDarkTheme() ? 'border-white/5' : 'border-slate-100'">
                        <p-button label="Initialiser le Stage" icon="pi pi-rocket" (click)="confirmCreateStage()" 
                            [loading]="loading()"
                            [styleClass]="layoutService.isDarkTheme() ? 'w-full bg-blue-600 hover:bg-blue-500 border-none py-4 rounded-2xl shadow-2xl shadow-blue-600/20 text-white font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98]' : 'w-full bg-[#063970] hover:bg-[#084a8c] border-none py-4 rounded-2xl shadow-xl shadow-[#063970]/10 text-white font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98]'" />
                        <p-button label="Annuler" (click)="createStageDialog = false" 
                            [styleClass]="layoutService.isDarkTheme() ? 'w-full text-slate-500 font-bold hover:text-slate-300 border-none py-3 transition-colors' : 'w-full text-slate-400 font-bold hover:text-slate-600 border-none py-3 transition-colors'" />
                    </div>
                </div>
            </div>
        </p-dialog>


        <p-confirmdialog [style]="{ width: '450px' }" />
        <p-toast />
    `,
    providers: [MessageService, UserService, ConfirmationService, InternshipService]
})
export class UserManagement implements OnInit {
    userDialog: boolean = false;
    users: Signal<User[]>;
    user!: User;
    selectedUsers!: User[] | null;
    submitted: boolean = false;
    roles!: any[];
    cols!: Column[];
    selectedRole: string | null = null;

    // Management Dialogs
    managedInternsDialog: boolean = false;

    selectedSupervisor: User | null = null;
    managedInterns: User[] = [];
    selectedSupervisorId: string | null = null;
    oldUsername: string | null = null;
    loading = signal(false);

    // Details View
    userDetailsDialog: boolean = false;
    selectedUserDetails: User | null = null;

    // Stage Details & Creation
    stageDetailsDialog: boolean = false;
    createStageDialog: boolean = false;
    selectedStageUser: User | null = null;
    showSupervisorSelect: boolean = false;
    currentStageIndex: number = 0;
    fetchingStages = signal(false);
    newStage = {
        dateDebut: '',
        dateFin: '',
        encadrantId: '',
        offreStageId: undefined as number | undefined
    };

    @ViewChild('dt') dt!: Table;
    @ViewChild('stageScrollContainer') stageScrollContainer!: ElementRef;

    private userService = inject(UserService);
    private affectationService = inject(AffectationService);
    private stageService = inject(StageService);
    private internshipService = inject(InternshipService);
    public layoutService = inject(LayoutService);
    offers = this.internshipService.getOffers();
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    constructor() {
        this.users = this.userService.getUsersSignal();
    }

    ngOnInit() {
        this.loadUsers();

        this.roles = [
            { label: 'Admin', value: 'Admin' },
            { label: 'RH', value: 'RH' },
            { label: 'Encadrant', value: 'Encadrant' },
            { label: 'Stagiaire', value: 'Stagiaire' },
            { label: 'User', value: 'User' }
        ];

        this.cols = [
            { field: 'lastName', header: 'Nom' },
            { field: 'firstName', header: 'Prénom' },
            { field: 'email', header: 'Email' },
            { field: 'username', header: 'Utilisateur' },
            { field: 'role', header: 'Rôle' }
        ];
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onRoleFilter(table: Table, event: any) {
        table.filter(event.value, 'role', 'equals');
    }

    getSupervisorName(id: string | undefined): string {
        if (!id) return 'N/A';
        const superv = this.users().find(u => u.id === id);
        return superv ? `${superv.firstName} ${superv.lastName}` : 'N/A';
    }

    getInternCount(id: string | undefined): number {
        if (!id) return 0;
        return this.users().filter(u => u.encadrantId === id).length;
    }

    getInternNames(ids: string[] | undefined): string[] {
        if (!ids || ids.length === 0) return [];
        return ids.map(id => {
            const intern = this.users().find(u => u.id === id);
            return intern ? `${intern.firstName} ${intern.lastName}` : 'Inconnu';
        });
    }

    async viewInterns(user: User) {
        this.selectedSupervisor = user;
        this.managedInternsDialog = true;

        try {
            const allEncadrants = await this.userService.getEncadrants();
            const detailedEncadrant = allEncadrants.find(e => e.id === user.id);
            if (detailedEncadrant) {
                this.selectedSupervisor = detailedEncadrant;
            }
        } catch (err) {
            console.error('Error fetching detailed encadrant info', err);
        }
    }

    async detachSupervisorFromDetails() {
        const currentStage = this.selectedStageUser?.stages?.[this.currentStageIndex];
        const stageId = currentStage?.id || this.selectedStageUser?.stageId;

        if (!this.selectedStageUser || !stageId) return;
        
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir désaffecter cet encadrant ?',
            header: 'Confirmation de désaffectation',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await this.affectationService.desaffecter(stageId);
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Encadrant désaffecté' });
                    if (currentStage) currentStage.encadrantNom = undefined;
                    this.selectedStageUser!.encadrantNom = undefined;
                    this.showSupervisorSelect = false;
                } catch (err) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la désaffectation' });
                }
            }
        });
    }

    async confirmAssignmentFromDetails() {
        const currentStage = this.selectedStageUser?.stages?.[this.currentStageIndex];
        const stageId = currentStage?.id || this.selectedStageUser?.stageId;

        if (!this.selectedStageUser || !stageId || !this.selectedSupervisorId) return;

        try {
            await this.affectationService.affecter({
                stageId: stageId,
                encadrantId: this.selectedSupervisorId
            });

            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Encadrant affecté avec succès' });
            
            // Refresh local data
            const enc = await this.affectationService.getEncadrant(this.selectedStageUser.id!);
            if (enc) {
                if (currentStage) currentStage.encadrantNom = enc.encadrantNom;
                this.selectedStageUser.encadrantNom = enc.encadrantNom;
            }
            
            this.showSupervisorSelect = false;
            this.selectedSupervisorId = null;
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de l'affectation" });
        }
    }

    getAvailableSupervisors() {
        return this.users()
            .filter(u => u.role === 'Encadrant')
            .map(u => ({
                id: u.id,
                fullName: `${u.firstName} ${u.lastName}`
            }));
    }

    viewStageDetails(user: User) {
        this.selectedStageUser = { ...user };
        this.showSupervisorSelect = false;
        this.selectedSupervisorId = null;
        this.currentStageIndex = 0;
        this.selectedStageUser.stages = [];

        // Initialize with current stage info for immediate display
        if (user.stageId || user.titreOffre) {
            this.selectedStageUser.stages = [{
                id: user.stageId!,
                titreOffre: user.titreOffre!,
                etat: user.etat as any,
                dateDebut: user.dateDebutStage!,
                dateFin: user.dateFinStage!,
                numeroStage: user.numeroStage || 1,
                documentsValides: !!user.documentsValides,
                encadrantNom: user.encadrantNom,
                utilisateurId: user.id!,
                candidatureId: user.candidatureId!,
                offreStageId: user.offreStageId!,
                encadrantId: ''
            }];
        }

        this.stageDetailsDialog = true;
        
        if (user.id) {
            this.loadHistory(user.id);
        }
    }

    private async loadHistory(userId: string) {
        this.fetchingStages.set(true);
        try {
            const stages = await this.stageService.getStagesByUtilisateur(userId);
            if (this.selectedStageUser && this.selectedStageUser.id === userId) {
                this.selectedStageUser.stages = stages.sort((a, b) => (new Date(b.dateDebut).getTime()) - (new Date(a.dateDebut).getTime()));
                // Keep the current stage index consistent or set to latest
                this.currentStageIndex = 0;
            }
        } catch (err) {
            console.error('Error fetching user history', err);
        } finally {
            this.fetchingStages.set(false);
        }
    }

    scrollStages(direction: 'left' | 'right') {
        if (this.stageScrollContainer) {
            const container = this.stageScrollContainer.nativeElement;
            const scrollAmount = 220; // Card width + gap
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    nextStage() {
        if (this.selectedStageUser?.stages && this.currentStageIndex < this.selectedStageUser.stages.length - 1) {
            this.currentStageIndex++;
        }
    }

    prevStage() {
        if (this.currentStageIndex > 0) {
            this.currentStageIndex--;
        }
    }

    openCreateStage(user: User) {
        this.selectedStageUser = user;
        this.newStage = {
            dateDebut: '',
            dateFin: '',
            encadrantId: '',
            offreStageId: undefined
        };
        this.createStageDialog = true;
    }

    async confirmCreateStage() {
        if (!this.selectedStageUser || !this.selectedStageUser.id || !this.newStage.dateDebut || !this.newStage.dateFin) {
            this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez remplir les dates de début et de fin.' });
            return;
        }

        this.loading.set(true);
        try {
            const dateDebutStr = this.formatDate(new Date(this.newStage.dateDebut));
            const dateFinStr = this.formatDate(new Date(this.newStage.dateFin));

            await this.stageService.creerStageDirect({
                userId: this.selectedStageUser.id,
                dateDebut: dateDebutStr,
                dateFin: dateFinStr,
                encadrantId: this.newStage.encadrantId || undefined,
                offreStageId: this.newStage.offreStageId
            });

            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Stage créé avec succès' });
            this.createStageDialog = false;
            await this.loadUsers();
        } catch (err: any) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message || 'Erreur lors de la création du stage' });
        } finally {
            this.loading.set(false);
        }
    }

    private formatDate(date: Date): string {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    openNew() {
        this.user = {};
        this.submitted = false;
        setTimeout(() => {
            this.userDialog = true;
        });
    }

    viewUserDetails(user: User) {
        this.selectedUserDetails = user;
        this.userDetailsDialog = true;
    }

    editFromDetails() {
        if (this.selectedUserDetails) {
            this.user = { ...this.selectedUserDetails };
            this.oldUsername = this.user.username || null;
            this.userDetailsDialog = false;
            this.userDialog = true;
        }
    }

    editUser(user: User) {
        this.user = { ...user };
        this.oldUsername = user.username || null;
        setTimeout(() => {
            this.userDialog = true;
        });
    }

    async loadUsers() {
        try {
            this.loading.set(true);
            // 1. Fetch all basic users
            const basicUsers = await this.userService.fetchAllUsers();

            // 2. Fetch detailed stagiaires, encadrants and all stages to ensure we have latest info
            const [stagiairesDetails, encadrantsDetails, allStages] = await Promise.all([
                this.userService.getStagiaires(),
                this.userService.getEncadrants(),
                this.stageService.getAllStages()
            ]);

            // 3. Merge details
            const enrichedUsers = basicUsers.map(user => {
                if (user.role === 'Stagiaire') {
                    const detail = stagiairesDetails.find(s => s.id === user.id);
                    
                    // Find all stages for this specific user from the global list
                    const userStages = allStages.filter(s => s.utilisateurId === user.id);
                    
                    if (userStages.length > 0) {
                        // Sort by ID descending to get the truly latest stage
                        const latest = [...userStages].sort((a, b) => (b.id || 0) - (a.id || 0))[0];
                        return { 
                            ...user, 
                            ...detail, 
                            titreOffre: latest.titreOffre, 
                            etat: latest.etat,
                            stageId: latest.id,
                            dateDebutStage: latest.dateDebut,
                            dateFinStage: latest.dateFin,
                            numeroStage: latest.numeroStage,
                            encadrantId: latest.encadrantId,
                            encadrantNom: latest.encadrantNom || (latest.encadrantId ? this.getSupervisorName(latest.encadrantId) : undefined),
                            stages: userStages.sort((a, b) => (b.id || 0) - (a.id || 0))
                        };
                    }
                    return detail ? { ...user, ...detail } : user;
                }
                if (user.role === 'Encadrant') {
                    const detail = encadrantsDetails.find(e => e.id === user.id);
                    return detail ? { ...user, ...detail } : user;
                }
                return user;
            });

            this.userService.updateUsersSignal(enrichedUsers);
        } catch (err) {
            console.error('Error loading users:', err);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement des utilisateurs' });
        } finally {
            this.loading.set(false);
        }
    }

    deleteSelectedUsers() {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer les utilisateurs sélectionnés ?',
            header: 'Confirmer',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                if (this.selectedUsers) {
                    try {
                        for (const u of this.selectedUsers) {
                            if (u.username) await this.userService.deleteUser(u.username);
                        }
                        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateurs supprimés', life: 3000 });
                    } catch (err: any) {
                        console.error(err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: err.error || "Échec de la suppression de certains utilisateurs",
                            life: 5000
                        });
                    }
                    this.loadUsers();
                    this.selectedUsers = null;
                }
            }
        });
    }

    hideDialog() {
        setTimeout(() => {
            this.userDialog = false;
            this.submitted = false;
        });
    }

    deleteUser(user: User) {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer ' + user.firstName + ' ' + user.lastName + ' ?',
            header: 'Confirmer',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                if (user.username) {
                    try {
                        await this.userService.deleteUser(user.username);
                        this.loadUsers();
                        this.user = {};
                        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur supprimé', life: 3000 });
                    } catch (err: any) {
                        console.error(err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: err.error || 'Échec de la suppression',
                            life: 5000
                        });
                    }
                }
            }
        });
    }

    async saveUser() {
        this.submitted = true;

        const isNewUser = !this.user.id;
        const hasPasswordIfNew = isNewUser ? (this.user.password && this.user.password.trim().length > 0) : true;

        if (this.user.firstName?.trim() && this.user.lastName?.trim() && this.user.email?.trim() && this.user.username?.trim() && this.user.role && hasPasswordIfNew) {
            this.loading.set(true);
            try {
                if (this.user.id && this.oldUsername) {
                    await this.userService.editUser(this.oldUsername, this.user);
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur mis à jour', life: 3000 });
                } else {
                    await this.userService.createUser(this.user);
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur créé', life: 3000 });
                }

                await this.loadUsers();
                setTimeout(() => {
                    this.userDialog = false;
                    this.user = {};
                });
            } catch (err: any) {
                // ... (rest of the catch block is already there, just need to ensure loading is reset)
                console.error(err);
                let errorMessage = "Échec de l'enregistrement de l'utilisateur";

                if (err.error && typeof err.error === 'string') {
                    errorMessage = err.error;
                } else if (err.message) {
                    errorMessage = err.message;
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: errorMessage,
                    life: 5000
                });
            } finally {
                this.loading.set(false);
            }
        }
    }

    async toggleStatus(user: User, enabled: boolean) {
        if (!user.id) return;
        try {
            await this.userService.toggleUserStatus(user.id, enabled);
            user.enabled = enabled ? 'ACTIF' : 'DÉSACTIVÉ';
            this.messageService.add({
                severity: 'success',
                summary: 'Statut mis à jour',
                detail: `Le compte de ${user.firstName} est désormais ${enabled ? 'activé' : 'désactivé'}.`,
                life: 3000
            });
        } catch (err) {
            // Revert is handled by the non-binding [ngModel] in template (it will stay at old value on refresh or if we trigger CD)
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de changer le statut du compte.'
            });
            this.loadUsers(); // Refresh to ensure UI matches reality
        }
    }

    getRoleColor(role: string) {
        switch (role) {
            case 'Admin': return 'bg-red-500';
            case 'RH': return 'bg-green-500';
            case 'Encadrant': return 'bg-blue-500';
            case 'Stagiaire': return 'bg-orange-500';
            default: return 'bg-slate-400';
        }
    }

    getEtatSeverity(etat: string) {
        switch (etat) {
            case 'EN_ATTENTE':
                return 'warn';
            case 'VALIDE':
            case 'ACCEPTE':
                return 'success';
            case 'REFUSE':
                return 'danger';
            case 'EN_COURS':
                return 'info';
            default:
                return 'secondary';
        }
    }

    getSeverity(role: string) {
        switch (role) {
            case 'Admin':
                return 'danger';
            case 'RH':
                return 'success';
            case 'Encadrant':
                return 'info';
            case 'Stagiaire':
                return 'warn';
            case 'User':
                return 'secondary';
            default:
                return 'secondary';
        }
    }
}
