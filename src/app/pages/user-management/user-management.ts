import { Component, OnInit, signal, ViewChild } from '@angular/core';
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
        PasswordModule
    ],
    template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nouveau" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button label="Supprimer" icon="pi pi-trash" severity="secondary" [outlined]="true" (onClick)="deleteSelectedUsers()" [disabled]="!selectedUsers || !selectedUsers.length"  />
            </ng-template>
            <ng-template #end>
                <p-button label="Exporter" icon="pi pi-upload" severity="secondary" (onClick)="dt.exportCSV()" />
            </ng-template>
        </p-toolbar>

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
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                    <h5 class="m-0 text-2xl font-black text-slate-800 tracking-tight">Gestion des Utilisateurs</h5>
                    
                    <div class="flex items-center gap-3">
                        <!-- Equilibrated Dropdown and Search -->
                        <div class="w-48 md:w-56">
                            <p-select [options]="roles" [(ngModel)]="selectedRole" (onChange)="onRoleFilter(dt, $event)" 
                                [showClear]="true" placeholder="Filtrer par rôle" class="w-full" styleClass="w-full">
                                <ng-template #item let-option>
                                    <p-tag [value]="option.value" [severity]="getSeverity(option.value)" styleClass="text-[10px] px-2" />
                                </ng-template>
                            </p-select>
                        </div>

                        <div class="w-48 md:w-56">
                            <p-iconfield class="w-full">
                                <p-inputicon styleClass="pi pi-search" />
                                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Rechercher..." class="w-full" />
                            </p-iconfield>
                        </div>
                    </div>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th pSortableColumn="lastName">Nom <p-sortIcon field="lastName" /></th>
                    <th pSortableColumn="firstName">Prénom <p-sortIcon field="firstName" /></th>
                    <th pSortableColumn="email">Email <p-sortIcon field="email" /></th>
                    <th pSortableColumn="username">Utilisateur <p-sortIcon field="username" /></th>
                    <th pSortableColumn="role">Rôle <p-sortIcon field="role" /></th>
                    
                    <!-- Dynamic Columns based on Role Filter -->
                    <th *ngIf="selectedRole === 'Stagiaire'" style="min-width: 12rem">Encadrant Affecté</th>
                    <th *ngIf="selectedRole === 'Encadrant'" style="min-width: 15rem">Stagiaires Affectés</th>

                    <th style="width: 8rem">Actions</th>
                </tr>
            </ng-template>
            <ng-template #body let-user>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="user" />
                    </td>
                    <td>{{ user.lastName }}</td>
                    <td>{{ user.firstName }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.username }}</td>
                    <td>
                        <p-tag [value]="user.role" [severity]="getSeverity(user.role)" />
                    </td>

                    <!-- Dynamic Cells based on Role Filter -->
                    <td *ngIf="selectedRole === 'Stagiaire'">
                        <div class="flex items-center gap-2">
                            <ng-container *ngIf="user.encadrantId; else noSupervisor">
                                <i class="pi pi-user text-blue-500"></i>
                                <span class="font-bold text-slate-700">{{ getSupervisorName(user.encadrantId) }}</span>
                            </ng-container>
                            <ng-template #noSupervisor>
                                <p-button label="Affecter" icon="pi pi-user-plus" [text]="true" size="small" 
                                    styleClass="text-xs font-bold text-orange-600 hover:bg-orange-50 py-1" 
                                    (onClick)="openAssignSupervisor(user)" />
                            </ng-template>
                        </div>
                    </td>
                    <td *ngIf="selectedRole === 'Encadrant'">
                        <div class="flex items-center gap-2">
                            <p-button *ngIf="user.stagiaireIds?.length" 
                                (click)="viewInterns(user)"
                                [label]="user.stagiaireIds!.length + ' stagiaire(s) affecté(s)'" 
                                icon="pi pi-users" 
                                [text]="true" 
                                size="small" 
                                styleClass="text-xs font-bold text-blue-600 hover:bg-blue-50 py-1" />
                            <span *ngIf="!user.stagiaireIds?.length" class="text-xs text-slate-400 italic px-2">Aucun stagiaire</span>
                        </div>
                    </td>

                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editUser(user)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteUser(user)" />
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
                <p-button label="Annuler" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Enregistrer" icon="pi pi-check" (click)="saveUser()" [style]="{ 'background-color': '#063970', 'border-color': '#063970' }" />
            </ng-template>
        </p-dialog>

        <!-- Managed Interns Dialog -->
        <p-dialog [(visible)]="managedInternsDialog" [style]="{ width: '550px' }" [header]="selectedSupervisor ? 'Stagiaires affectés à ' + selectedSupervisor.firstName + ' ' + selectedSupervisor.lastName : 'Stagiaires affectés'" [modal]="true">
            <div class="flex flex-col gap-3 py-2">
                <div *ngIf="managedInterns.length > 0; else noInterns" class="flex flex-col gap-3">
                    <div *ngFor="let intern of managedInterns" class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                {{ intern.firstName?.charAt(0) || '' }}{{ intern.lastName?.charAt(0) || '' }}
                            </div>
                            <div class="flex flex-col">
                                <span class="font-bold text-slate-800">{{ intern?.firstName }} {{ intern?.lastName }}</span>
                                <span class="text-xs text-slate-500">{{ intern?.email }}</span>
                            </div>
                        </div>
                        <p-tag value="Stagiaire" severity="warn" styleClass="text-[9px]" />
                    </div>
                </div>
                <ng-template #noInterns>
                    <div class="p-8 text-center text-slate-400 italic">Aucun stagiaire trouvé pour cet encadrant.</div>
                </ng-template>
            </div>
            <ng-template #footer>
                <p-button label="Fermer" icon="pi pi-times" [text]="true" (click)="managedInternsDialog = false" />
            </ng-template>
        </p-dialog>

        <!-- Assign Supervisor Dialog -->
        <p-dialog [(visible)]="assignmentDialog" [style]="{ width: '450px' }" header="Affecter un Encadrant" [modal]="true">
            <div class="flex flex-col gap-4 py-4">
                <div class="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-2">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                            {{ selectedIntern?.firstName?.charAt(0) || '' }}{{ selectedIntern?.lastName?.charAt(0) || '' }}
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs text-blue-600 font-bold uppercase tracking-wider">Affecter un encadrant à :</span>
                            <span class="font-black text-slate-800 text-lg">{{ selectedIntern?.firstName }} {{ selectedIntern?.lastName }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-bold text-slate-700 ml-1">Sélectionner un Encadrant</label>
                    <p-select [options]="getAvailableSupervisors()" 
                        [(ngModel)]="selectedSupervisorId" 
                        optionLabel="fullName" 
                        optionValue="id"
                        placeholder="Choisir l'encadrant..." 
                        class="w-full" 
                        styleClass="w-full"
                        appendTo="body" />
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" [text]="true" (click)="assignmentDialog = false" />
                <p-button label="Confirmer l'affectation" icon="pi pi-check-circle" (click)="confirmAssignment()" 
                    [disabled]="!selectedSupervisorId"
                    [style]="{ 'background-color': '#063970', 'border-color': '#063970' }" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
        <p-toast />
    `,
    providers: [MessageService, UserService, ConfirmationService]
})
export class UserManagement implements OnInit {
    userDialog: boolean = false;
    users = signal<User[]>([]);
    user!: User;
    selectedUsers!: User[] | null;
    submitted: boolean = false;
    roles!: any[];
    cols!: Column[];
    selectedRole: string | null = null;
    
    // Management Dialogs
    managedInternsDialog: boolean = false;
    assignmentDialog: boolean = false;
    selectedSupervisor: User | null = null;
    selectedIntern: User | null = null;
    managedInterns: User[] = [];
    selectedSupervisorId: string | null = null;
    oldUsername: string | null = null;

    @ViewChild('dt') dt!: Table;

    constructor(
        private userService: UserService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

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

    getInternNames(ids: string[] | undefined): string[] {
        if (!ids || ids.length === 0) return [];
        return ids.map(id => {
            const intern = this.users().find(u => u.id === id);
            return intern ? `${intern.firstName} ${intern.lastName}` : 'Inconnu';
        });
    }

    viewInterns(user: User) {
        this.selectedSupervisor = user;
        this.managedInterns = this.users().filter(u => user.stagiaireIds?.includes(u.id!));
        this.managedInternsDialog = true;
    }

    openAssignSupervisor(intern: User) {
        this.selectedIntern = intern;
        this.selectedSupervisorId = null;
        this.assignmentDialog = true;
    }

    getAvailableSupervisors() {
        return this.users()
            .filter(u => u.role === 'Encadrant')
            .map(u => ({
                id: u.id,
                fullName: `${u.firstName} ${u.lastName}`
            }));
    }

    confirmAssignment() {
        if (!this.selectedIntern || !this.selectedSupervisorId) return;

        const updatedUsers = [...this.users()];
        
        // Update Intern
        const internIndex = updatedUsers.findIndex(u => u.id === this.selectedIntern?.id);
        if (internIndex !== -1) {
            updatedUsers[internIndex] = { ...updatedUsers[internIndex], encadrantId: this.selectedSupervisorId };
        }

        // Update Supervisor (add to stagiaireIds)
        const supervisorIndex = updatedUsers.findIndex(u => u.id === this.selectedSupervisorId);
        if (supervisorIndex !== -1) {
            const supervisor = { ...updatedUsers[supervisorIndex] };
            if (!supervisor.stagiaireIds) supervisor.stagiaireIds = [];
            if (!supervisor.stagiaireIds.includes(this.selectedIntern.id!)) {
                supervisor.stagiaireIds.push(this.selectedIntern.id!);
            }
            updatedUsers[supervisorIndex] = supervisor;
        }

        this.users.set(updatedUsers);
        this.assignmentDialog = false;
        this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Encadrant affecté avec succès',
            life: 3000
        });
    }

    openNew() {
        this.user = {};
        this.submitted = false;
        this.userDialog = true;
    }

    editUser(user: User) {
        this.user = { ...user };
        this.oldUsername = user.username || null;
        this.userDialog = true;
    }

    async loadUsers() {
        try {
            const data = await this.userService.getUsers();
            this.users.set(data);
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement des utilisateurs' });
        }
    }

    deleteSelectedUsers() {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer les utilisateurs sélectionnés ?',
            header: 'Confirmer',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                if (this.selectedUsers) {
                    for (const u of this.selectedUsers) {
                        if (u.username) await this.userService.deleteUser(u.username);
                    }
                    this.loadUsers();
                    this.selectedUsers = null;
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateurs supprimés', life: 3000 });
                }
            }
        });
    }

    hideDialog() {
        this.userDialog = false;
        this.submitted = false;
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
                    } catch (err) {
                        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression' });
                    }
                }
            }
        });
    }

    async saveUser() {
        this.submitted = true;

        if (this.user.firstName?.trim() && this.user.lastName?.trim() && this.user.email?.trim() && this.user.username?.trim() && this.user.role) {
            try {
                if (this.user.id && this.oldUsername) {
                    await this.userService.editUser(this.oldUsername, this.user);
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur mis à jour', life: 3000 });
                } else {
                    await this.userService.createUser(this.user);
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur créé', life: 3000 });
                }

                await this.loadUsers();
                this.userDialog = false;
                this.user = {};
            } catch (err) {
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de l'enregistrement de l'utilisateur" });
            }
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
