import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { AttestationService, Attestation } from '@/app/services/attestation.service';
import { UserService, User } from '@/app/services/user.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-gestion-attestations',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, TooltipModule, ToastModule],
    providers: [MessageService],
    template: `
        <div class="p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm h-full min-h-[calc(88vh-5rem)]">
            <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-4xl font-black text-[#063970] dark:text-blue-400 tracking-tight mb-2">Gestion des Attestations</h1>
                    <p class="text-slate-500 dark:text-slate-400 font-medium text-lg">Consultez et téléchargez toutes les attestations générées.</p>
                </div>
                <div class="flex gap-2">
                    <span class="p-input-icon-left w-full md:w-auto">
                        <i class="pi pi-search"></i>
                        <input pInputText type="text" [(ngModel)]="searchTerm" placeholder="Rechercher un stagiaire..." class="w-full md:w-80 rounded-2xl" />
                    </span>
                    <p-button icon="pi pi-refresh" [rounded]="true" [outlined]="true" (click)="loadAttestations()" />
                </div>
            </div>

            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                <p-table [value]="filteredAttestations()" [rows]="10" [paginator]="true" responsiveLayout="scroll" styleClass="p-datatable-sm">
                    <ng-template pTemplate="header">
                        <tr>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50 py-4 px-6">Stagiaire</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50 py-4 px-6">Offre de Stage</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50 py-4 px-6">Période</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50 py-4 px-6">Date Génération</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50 py-4 px-6 text-center">Action</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-attestation>
                        <tr class="hover:bg-slate-50/30 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-100 dark:border-slate-700">
                            <td class="py-4 px-6">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                                        {{ (attestation.user?.firstName?.charAt(0) ?? '') }}{{ (attestation.user?.lastName?.charAt(0) ?? '') }}
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-slate-800 dark:text-slate-100 text-sm">
                                            {{ attestation.user?.firstName }} {{ attestation.user?.lastName }}
                                        </span>
                                        <span class="text-xs text-slate-400 font-medium">@{{ attestation.username }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <span class="text-[#063970] dark:text-blue-400 font-semibold">{{ attestation.nomOffre }}</span>
                            </td>
                            <td class="py-4 px-6 text-xs font-medium text-slate-500">
                                {{ attestation.dateDebut | date:'dd/MM/yy' }} - {{ attestation.dateFin | date:'dd/MM/yy' }}
                            </td>
                            <td class="py-4 px-6 text-slate-400 text-xs">
                                {{ attestation.dateGeneration | date:'dd/MM/yyyy HH:mm' }}
                            </td>
                            <td class="py-4 px-6 text-center">
                                <p-button icon="pi pi-download" [rounded]="true" [text]="true" (click)="download(attestation)" pTooltip="Télécharger PDF" />
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="5" class="text-center py-20 text-slate-400">Aucune attestation trouvée.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
        <p-toast />
    `
})
export class GestionAttestationsComponent implements OnInit {
    private attestationService = inject(AttestationService);
    private userService = inject(UserService);
    attestations = signal<Attestation[]>([]);
    users = signal<User[]>([]);
    searchTerm = '';

    mappedAttestations = computed(() => {
        const attestationsList = this.attestations();
        const usersList = this.users();
        return attestationsList.map(att => ({
            ...att,
            user: usersList.find(u => u.id === att.utilisateurId || u.username === att.username)
        }));
    });

    filteredAttestations = computed(() => {
        const term = this.searchTerm.toLowerCase();
        return this.mappedAttestations().filter(a => 
            a.username?.toLowerCase().includes(term) || 
            a.nomOffre?.toLowerCase().includes(term) ||
            a.user?.firstName?.toLowerCase().includes(term) ||
            a.user?.lastName?.toLowerCase().includes(term)
        );
    });

    ngOnInit() {
        this.loadAttestations();
        this.loadUsers();
    }

    async loadUsers() {
        try {
            const data = await this.userService.getUsers();
            this.users.set(data);
        } catch (err) {
            console.error('Error loading users', err);
        }
    }

    async loadAttestations() {
        try {
            const data = await this.attestationService.getAll();
            this.attestations.set(data);
        } catch (err) {
            console.error('Error loading attestations', err);
        }
    }

    download(attestation: Attestation) {
        if (attestation.filePath) {
            this.attestationService.downloadFile(attestation.filePath, `attestation_${attestation.username}.pdf`);
        }
    }
}
