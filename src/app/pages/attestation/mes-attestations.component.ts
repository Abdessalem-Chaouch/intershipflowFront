import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AttestationService, Attestation } from '@/app/services/attestation.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-mes-attestations',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TooltipModule, ToastModule],
    providers: [MessageService],
    template: `
        <div class="p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm h-full min-h-[calc(88vh-5rem)]">
            <div class="mb-8">
                <h1 class="text-4xl font-black text-[#063970] dark:text-blue-400 tracking-tight mb-2">Mes Attestations</h1>
                <p class="text-slate-500 dark:text-slate-400 font-medium text-lg">Retrouvez ici vos attestations de stage validées.</p>
            </div>

            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                <p-table [value]="attestations()" [rows]="10" [paginator]="true" responsiveLayout="scroll" styleClass="p-datatable-sm">
                    <ng-template pTemplate="header">
                        <tr>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50 py-4 px-6">Offre de Stage</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50 py-4 px-6">Période</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50 py-4 px-6">Date de Génération</th>
                            <th class="bg-slate-50/50 dark:bg-slate-800/50 py-4 px-6 text-center">Action</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-attestation>
                        <tr class="hover:bg-slate-50/30 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-100 dark:border-slate-700">
                            <td class="py-4 px-6">
                                <span class="font-bold text-[#063970] dark:text-blue-400">{{ attestation.nomOffre }}</span>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                    <span>{{ attestation.dateDebut | date:'dd/MM/yyyy' }}</span>
                                    <i class="pi pi-arrow-right text-[10px]"></i>
                                    <span>{{ attestation.dateFin | date:'dd/MM/yyyy' }}</span>
                                </div>
                            </td>
                            <td class="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">
                                {{ attestation.dateGeneration | date:'dd MMMM yyyy HH:mm' }}
                            </td>
                            <td class="py-4 px-6 text-center">
                                <p-button icon="pi pi-download" label="Télécharger" [rounded]="true" size="small"
                                          styleClass="font-bold bg-green-500 hover:bg-green-600 border-none shadow-sm"
                                          (click)="download(attestation)" />
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="4" class="text-center py-20 text-slate-400 italic">
                                <i class="pi pi-file-excel text-5xl mb-4 block opacity-20"></i>
                                <p>Aucune attestation disponible pour le moment.</p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
        <p-toast />
    `
})
export class MesAttestationsComponent implements OnInit {
    private attestationService = inject(AttestationService);
    attestations = signal<Attestation[]>([]);

    ngOnInit() {
        this.loadAttestations();
    }

    async loadAttestations() {
        try {
            const data = await this.attestationService.getMyAttestations();
            this.attestations.set(data);
        } catch (err) {
            console.error('Error loading attestations', err);
        }
    }

    download(attestation: Attestation) {
        if (attestation.filePath) {
            this.attestationService.downloadFile(attestation.filePath, `attestation_${attestation.nomOffre}.pdf`);
        }
    }
}
