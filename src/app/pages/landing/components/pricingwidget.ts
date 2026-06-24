import { Component, OnInit, signal, computed, inject, ViewChild, ElementRef, OnDestroy, NgZone, Signal, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { InternshipService, InternshipOffer, InternshipApplication, OffreStageDTO } from '@/app/services/internship.service';
import { CandidatureService } from '@/app/services/candidature.service';
import { StageService, Stage, EtatStage } from '@/app/services/stage.service';
import { TestService, TechnicalTest } from '@/app/services/test.service';
import { UserService, User } from '@/app/services/user.service';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TestTakeComponent } from '../../test-take.component';

@Component({
    selector: 'pricing-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, TooltipModule, DialogModule, InputTextModule, FileUploadModule, TagModule, ToastModule, FormsModule, TestTakeComponent, RouterLink],
    providers: [MessageService, CandidatureService],
    template: `
        <div id="pricing" class="py-24 px-6 lg:px-20 bg-slate-50 dark:bg-[#010b14] transition-colors relative overflow-hidden">
            <!-- Professional Background Accents -->
            <div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div class="absolute -top-[10%] -left-[5%] w-[30%] h-[30%] bg-[#063970]/5 rounded-full blur-[100px]"></div>
                <div class="absolute top-[20%] -right-[5%] w-[25%] h-[25%] bg-[#063970]/5 rounded-full blur-[100px]"></div>
                <div class="absolute bottom-0 left-[20%] w-[40%] h-[20%] bg-[#063970]/5 rounded-full blur-[120px]"></div>
            </div>

            <div class="max-w-7xl mx-auto relative z-10">
                <!-- Section Header -->
                <div class="text-center mb-12">
                    <div class="inline-flex items-center gap-2 px-3 py-1 mb-8 bg-[#063970]/5 dark:bg-[#063970]/20 border border-[#063970]/10 dark:border-[#063970]/40 rounded-full">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#063970] opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-[#063970]"></span>
                        </span>
                        <span class="text-[10px] font-black uppercase tracking-widest text-[#063970] dark:text-blue-300">Opportunités de Stages {{ currentYear }}</span>
                    </div>
                    <h2 class="text-slate-900 dark:text-white text-5xl md:text-6xl font-black mb-8 tracking-tight">
                        Trouvez le stage qui vous <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#063970] via-blue-800 to-blue-500">correspond</span>
                    </h2>
                    <div class="flex items-center justify-center">
                        <p class="text-slate-500 dark:text-slate-400 text-xl max-w-2xl text-center leading-relaxed">
                            Des opportunités premium au sein d'équipes expertes. Transformez votre potentiel en compétences concrètes.
                        </p>
                    </div>
                </div>

                <!-- Offers Container -->
                <div #scrollContainer 
                     (scroll)="onScroll()"
                     class="scroll-container flex flex-row gap-8 overflow-x-auto pb-12 pt-8 snap-x px-4"
                     [ngClass]="{'justify-center': originalOffers().length === 1}"
                     [style.scroll-behavior]="isSmooth ? 'smooth' : 'auto'">
                    
                    <div *ngFor="let offer of originalOffers()" 
                         class="pricing-card group bg-white dark:!bg-[#06111d] border border-slate-100 dark:border-blue-900/20 shadow-sm hover:shadow-xl transition-all duration-500"
                         [class.featured]="offer.highlight">
                        
                        <!-- Premium Badge for Featured -->
                        <div *ngIf="offer.highlight" class="featured-badge">
                            <i class="pi pi-sparkles"></i>
                            <span>RECOMMANDÉ</span>
                        </div>

                        <!-- Card Header -->
                        <div class="p-8 pb-0">
                            <div class="flex justify-between items-start mb-6">
                                <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 group-hover:bg-[#063970] group-hover:text-white transition-colors duration-500 shadow-sm">
                                    <i class="pi pi-briefcase text-xl"></i>
                                </div>
                                <span class="px-3 py-1 bg-[#063970]/5 dark:bg-[#063970]/20 text-[#063970] dark:text-blue-300 text-[10px] font-black uppercase tracking-wider rounded-lg border border-[#063970]/10 dark:border-[#063970]/30">
                                    {{offer.badge}}
                                </span>
                            </div>

                            <!-- Information Row -->
                            <div class="flex flex-col gap-1 mb-4">
                                <div class="flex items-center gap-2">
                                    <span class="text-[10px] font-black text-[#063970] dark:text-blue-300/60 uppercase tracking-[0.2em]">Offre de stage</span>
                                    <div class="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                                </div>
                                <h3 class="text-2xl font-black text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-[#063970] dark:group-hover:text-blue-400 transition-colors">
                                    {{offer.title}}
                                </h3>
                            </div>

                            <!-- Metadata Grid -->
                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-bold bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <i class="pi pi-map-marker text-[#063970] dark:text-blue-400"></i>
                                    {{offer.location}}
                                </div>
                                <div *ngIf="offer.dateFin" class="flex items-center gap-2 text-red-500 dark:text-red-400 text-[11px] font-bold bg-red-50/50 dark:bg-red-900/10 p-2 rounded-xl border border-red-100/50 dark:border-red-900/30">
                                    <i class="pi pi-calendar-times"></i>
                                    Fin: {{offer.dateFin | date:'dd MMM'}}
                                </div>
                                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-bold bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50 col-span-2">
                                    <i class="pi pi-clock text-[#063970] dark:text-blue-400"></i>
                                    Durée: {{internshipService.formatDuration(offer.dureeStage)}}
                                </div>
                            </div>
                        </div>

                        <!-- Card Content -->
                        <div class="px-8 flex-1">
                            <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2 font-medium italic">
                                "{{offer.desc}}"
                            </p>

                            <div class="space-y-3 mb-8">
                                <div class="flex flex-wrap gap-2">
                                    <span *ngFor="let tech of offer.techs | slice:0:4" 
                                          class="px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 group-hover:border-[#063970]/30 transition-colors">
                                        {{tech}}
                                    </span>
                                    <span *ngIf="offer.techs.length > 4" class="text-[10px] font-bold text-slate-400 dark:text-slate-500 self-center">+{{offer.techs.length - 4}}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Card Footer / Actions -->
                        <div class="p-8 pt-0 mt-auto">
                            <div class="flex gap-3 h-[52px]">
                                <button pButton pRipple icon="pi pi-info-circle" 
                                        class="p-button-outlined !rounded-xl !w-[52px] !h-[52px] !border-slate-200 dark:!border-slate-700 !text-slate-500 dark:!text-slate-400 hover:!bg-slate-50 dark:hover:!bg-slate-800 transition-all"
                                        (click)="openDetailsDialog(offer)"
                                        pTooltip="Détails"></button>
                                
                                <div *ngIf="!getApplicationStatus(offer.id) && userHasActiveInternship()"
                                     class="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 !rounded-xl text-[10px] font-black border border-slate-200 dark:border-slate-700"
                                     [pTooltip]="'Tu as déjà un stage ' ">
                                    <i class="pi pi-lock"></i>
                                    <span>STAGE EN COURS</span>
                                </div>

                                <div *ngIf="!getApplicationStatus(offer.id) && !userHasActiveInternship() && !hasCompletedInternshipFor(offer.id) && !canUserApply()"
                                     class="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 !rounded-xl text-[10px] font-black border border-slate-200 dark:border-slate-700/50"
                                     pTooltip="L'application est réservée aux profils stagiaires.">
                                    <i class="pi pi-lock"></i>
                                    <span>ACTION BLOQUÉE</span>
                                </div>

                                <div *ngIf="!getApplicationStatus(offer.id) && !hasActiveInternship() && hasCompletedInternshipFor(offer.id)"
                                     class="flex-1 flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 !rounded-xl text-[10px] font-black border border-emerald-100 dark:border-emerald-800/30"
                                     pTooltip="Félicitations ! Tu as déjà validé ce stage.">
                                    <i class="pi pi-verified"></i>
                                    <span>STAGE EFFECTUÉ</span>
                                </div>
                                
                                <button *ngIf="!getApplicationStatus(offer.id) && !hasActiveInternship() && !hasCompletedInternshipFor(offer.id) && canUserApply()"
                                        pButton pRipple [label]="offer.cta" 
                                        class="pricing-action-btn flex-1 !rounded-xl !font-black !text-sm !shadow-lg transition-all"
                                        (click)="openApplyDialog(offer)"></button>
                                
                                <div *ngIf="getApplicationStatus(offer.id) as status" 
                                     class="flex-1 flex items-center justify-center gap-2 status-indicator !rounded-xl text-[10px] font-black border border-current transition-all"
                                     [ngClass]="hasCompletedInternshipFor(offer.id) ? 'bg-slate-100 text-slate-500 border-slate-200' : getStatusSeverity(status)">
                                    <i class="pi" [ngClass]="hasCompletedInternshipFor(offer.id) ? 'pi-history' : 'pi-check-circle'"></i>
                                    <span>{{ hasCompletedInternshipFor(offer.id) ? 'DÉJÀ FAIT CE STAGE' : 'POSTULÉ (' + status + ')' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Slider Controls -->
                <div *ngIf="originalOffers().length > 1" class="flex items-center justify-center gap-8 mt-12">
                    <button (click)="scrollPrev()" class="slider-nav-btn">
                        <i class="pi pi-chevron-left"></i>
                    </button>
                    <div class="flex gap-2.5">
                        <div *ngFor="let dot of originalOffers(); let i = index" 
                             (click)="scrollToItem(i)"
                             class="slider-dot" 
                             [class.active]="i === currentDotIndex">
                        </div>
                    </div>
                    <button (click)="scrollNext()" class="slider-nav-btn">
                        <i class="pi pi-chevron-right"></i>
                    </button>
                </div>

                <!-- View All Button -->
                <div class="flex justify-center mt-16">
                    <button pButton pRipple label="Découvrir toutes nos offres" 
                            icon="pi pi-external-link" 
                            iconPos="right"
                            [routerLink]="['/internship-list']"
                            class="!rounded-2xl !px-10 !py-4 !bg-[#063970] !text-white !border-none !font-black !text-lg hover:!bg-blue-900 !transition-all !shadow-2xl hover:!scale-105"></button>
                </div>
            </div>
        </div>

        <!-- Details Dialog -->
        <p-dialog [(visible)]="detailsDialog" 
                  [modal]="true" 
                  [draggable]="false"
                  [resizable]="false"
                  [dismissableMask]="true"
                  styleClass="modern-dialog"
                  [style]="{ width: 'min(750px, 95vw)' }">
            
            <ng-template pTemplate="header">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-[#063970]/5 dark:bg-[#063970]/20 text-[#063970] dark:text-blue-300 flex items-center justify-center text-2xl shadow-sm">
                        <i class="pi pi-briefcase"></i>
                    </div>
                    <div>
                        <h5 class="m-0 text-2xl font-black text-slate-800 dark:text-blue-50 tracking-tight">{{ selectedOffer?.title }}</h5>
                        <p-tag [value]="selectedOffer?.badge" styleClass="text-[10px] font-black uppercase mt-1 px-3 !bg-[#063970] !text-white" />
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="content">
                <div class="flex flex-col gap-8 py-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="flex flex-col gap-4">
                            <h6 class="text-xs font-black text-[#063970] dark:text-blue-300/40 uppercase tracking-widest flex items-center gap-2">
                                <i class="pi pi-align-left"></i> Mission du stage
                            </h6>
                            <p class="text-slate-600 dark:text-blue-100/70 leading-relaxed font-medium">
                                {{ selectedOffer?.desc }}
                                <br><br>
                                En tant que stagiaire chez SIGA, vous intégrerez une équipe dynamique de développeurs experts. Vous participerez activement au cycle de vie complet de nos projets.
                            </p>
                        </div>

                        <div class="flex flex-col gap-6">
                            <div class="bg-slate-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-slate-100 dark:border-blue-800/40 flex flex-col gap-4">
                                <h6 class="text-xs font-black text-[#063970] dark:text-blue-300/40 uppercase tracking-widest flex items-center gap-2">
                                    <i class="pi pi-code"></i> Stack Technique
                                </h6>
                                <div class="flex flex-wrap gap-2">
                                    <p-tag *ngFor="let tech of selectedOffer?.techs" [value]="tech" 
                                           styleClass="!bg-white dark:!bg-blue-900/40 !text-slate-700 dark:!text-blue-100 !border !border-slate-200 dark:!border-blue-800/40 !font-bold py-2 px-3 rounded-xl shadow-sm" />
                                </div>
                            </div>

                                <div *ngIf="selectedOffer?.dateFin" class="flex items-center gap-3">
                                    <i class="pi pi-calendar-times text-red-400 font-bold"></i>
                                    <span class="text-sm font-bold text-slate-700 dark:text-blue-100/80">Expiration : {{ selectedOffer.dateFin | date:'dd MMMM yyyy' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Stage Information Section -->
                        <div *ngIf="getStageForOffer(selectedOffer?.id || '') as stage" class="mt-4 pt-8 border-t border-slate-100 dark:border-blue-800/40">
                            <h6 class="text-xs font-black text-[#063970] dark:text-blue-300 uppercase tracking-widest flex items-center gap-2 mb-6">
                                <i class="pi pi-info-circle"></i> Détails de votre stage
                            </h6>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-800/20 shadow-sm">
                                    <span class="text-[10px] font-bold text-slate-400 dark:text-blue-200/40 uppercase block mb-1">État du stage</span>
                                    <p-tag [value]="stage.etat" [severity]="getStageSeverity(stage.etat)" styleClass="text-[10px] font-black uppercase" />
                                </div>
                                <div class="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-800/20 shadow-sm">
                                    <span class="text-[10px] font-bold text-slate-400 dark:text-blue-200/40 uppercase block mb-1">Encadrant Affecté</span>
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-user-edit text-[#063970] dark:text-blue-400"></i>
                                        <span *ngIf="(stage.encadrantNom && stage.encadrantNom !== 'N/A') || (stage.encadrantId && getSupervisorName(stage.encadrantId) !== 'N/A') || $any(stage).encadrantFirstName" class="text-sm font-bold text-slate-700 dark:text-blue-100">
                                        {{ ($any(stage).encadrantFirstName || $any(stage).encadrantLastName) ? (($any(stage).encadrantFirstName || '') + ' ' + ($any(stage).encadrantLastName || '')).trim() : (stage.encadrantNom || getSupervisorName(stage.encadrantId, stage)) }}
                                        </span>
                                        <p-tag *ngIf="(!stage.encadrantNom || stage.encadrantNom === 'N/A') && (!stage.encadrantId || getSupervisorName(stage.encadrantId) === 'N/A') && !$any(stage).encadrantFirstName" value="En attente d'affectation" severity="secondary" styleClass="text-[10px] font-black uppercase" />
                                    </div>
                                </div>
                            </div>
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="footer">
                <div class="flex items-center justify-between w-full p-4 border-t border-slate-50 dark:border-blue-800/40 bg-slate-50/50 dark:bg-blue-900/20 rounded-b-3xl">
                    <p-button label="Fermer" [text]="true" severity="secondary" (onClick)="detailsDialog = false" styleClass="dark:!text-blue-200/60" />
                    <ng-container *ngIf="!getApplicationStatus(selectedOffer?.id)">
                        <p-button *ngIf="!hasActiveInternship() && !hasCompletedInternshipFor(selectedOffer?.id) && canUserApply()"
                                 label="Postuler à ce stage" icon="pi pi-arrow-right" iconPos="right"
                                 (onClick)="detailsDialog = false; openApplyDialog(selectedOffer)" 
                                 styleClass="!bg-[#063970] !border-none !rounded-xl !px-6 !py-3 !font-bold shadow-lg" />
                        
                        <div *ngIf="!canUserApply()" class="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-sm bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                            <i class="pi pi-lock"></i>
                            <span>Action réservée aux stagiaires</span>
                        </div>
                        
                        <div *ngIf="hasActiveInternship()" class="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <i class="pi pi-exclamation-triangle"></i>
                            <span>Tu as déjà un stage </span>
                        </div>

                        <div *ngIf="!hasActiveInternship() && hasCompletedInternshipFor(selectedOffer?.id)" class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <i class="pi pi-verified"></i>
                            <span>Stage déjà effectué et validé</span>
                        </div>
                    </ng-container>
                    <p-tag *ngIf="getApplicationStatus(selectedOffer?.id) as status" 
                           [value]="hasCompletedInternshipFor(selectedOffer?.id) ? 'DÉJÀ FAIT CE STAGE' : 'Déjà postulé : ' + status" 
                           [severity]="hasCompletedInternshipFor(selectedOffer?.id) ? 'secondary' : getStatusSeverity(status)" 
                           styleClass="px-4 py-2 font-black uppercase" />
                </div>
            </ng-template>
        </p-dialog>

        <!-- Apply Dialog and Toast omitted for brevity but remain the same -->
        <p-dialog [(visible)]="applyDialog" [modal]="true" [draggable]="false" [resizable]="false" styleClass="modern-dialog" [style]="{ width: applyStep === 2 ? 'min(1000px, 98vw)' : 'min(580px, 95vw)' }">
            <ng-template pTemplate="header">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-[#063970]/5 dark:bg-[#063970]/20 rounded-xl text-[#063970] dark:text-blue-300">
                        <i class="pi pi-send text-xl"></i>
                    </div>
                    <div>
                        <h4 class="m-0 text-xl font-black text-slate-900 dark:text-white">{{selectedOffer?.title}}</h4>
                        <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Dossier de candidature</p>
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="content">
                <div *ngIf="applyStep === 1" class="py-6 space-y-8">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Prénom</label>
                            <input pInputText [(ngModel)]="applicationForm.firstName" placeholder="Prénom" class="w-full !rounded-xl !border-slate-200 dark:!border-slate-700 dark:!bg-slate-800" />
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom</label>
                            <input pInputText [(ngModel)]="applicationForm.lastName" placeholder="Nom" class="w-full !rounded-xl !border-slate-200 dark:!border-slate-700 dark:!bg-slate-800" />
                        </div>
                    </div>

                    <div class="space-y-6">
                        <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed group hover:border-[#063970] transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-red-500">
                                    <i class="pi pi-file-pdf text-xl"></i>
                                </div>
                                <div class="flex-1 overflow-hidden">
                                    <p class="text-sm font-bold text-slate-900 dark:text-white truncate m-0">{{applicationForm.cvFile ? applicationForm.cvFile.name : 'Curriculum Vitae'}}</p>
                                    <p class="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Format PDF, DOC, DOCX max 5Mo</p>
                                </div>
                                <p-fileUpload mode="basic" [auto]="true" chooseLabel="Télécharger" accept=".pdf,.doc,.docx" (onSelect)="onFileSelect($event, 'cv')" class="p-button-sm" />
                            </div>
                        </div>

                        <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed group hover:border-[#063970] transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-blue-500">
                                    <i class="pi pi-envelope text-xl"></i>
                                </div>
                                <div class="flex-1 overflow-hidden">
                                    <p class="text-sm font-bold text-slate-900 dark:text-white truncate m-0">{{applicationForm.letterFile ? applicationForm.letterFile.name : 'Lettre de Motivation'}}</p>
                                    <p class="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Format PDF/DOC max 5Mo</p>
                                </div>
                                <p-fileUpload mode="basic" [auto]="true" chooseLabel="Télécharger" (onSelect)="onFileSelect($event, 'letter')" class="p-button-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                <div *ngIf="applyStep === 2" class="py-4">
                    <app-test-take [test]="assignedTest" 
                                 [timeLimit]="selectedOffer?.dureeStage"
                                 [candidateInfo]="{firstName: applicationForm.firstName, lastName: applicationForm.lastName, candidatureId: createdCandidatureId!}"
                                 (onTestCompleted)="onTestCompleted($event)" />
                </div>

                <div *ngIf="applyStep === 3" class="py-12 flex flex-col items-center text-center space-y-6">
                    <div class="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center text-4xl animate-bounce">
                        <i class="pi pi-check-circle"></i>
                    </div>
                    <div>
                        <h4 class="text-2xl font-black text-slate-900 dark:text-white m-0">Candidature Envoyée !</h4>
                        <p class="text-slate-500 dark:text-slate-400 mt-2">Votre dossier est maintenant entre les mains de nos recruteurs.</p>
                    </div>
                    <button pButton label="Terminer" class="p-button-primary !rounded-xl !px-12 !py-3 !font-black !bg-[#063970]" (click)="applyDialog = false"></button>
                </div>
            </ng-template>

            <ng-template pTemplate="footer">
                <div *ngIf="applyStep === 1" class="flex justify-end gap-3 p-4">
                    <button pButton label="Annuler" class="p-button-text p-button-secondary" (click)="applyDialog = false"></button>
                    <button pButton [label]="selectedOffer?.selectedTestId ? 'Continuer vers le test' : 'Postuler'" [icon]="selectedOffer?.selectedTestId ? 'pi pi-arrow-right' : 'pi pi-check'" iconPos="right" [disabled]="!isFormValid()" [loading]="isSubmitting" (click)="goToTestStep()" class="!rounded-xl !px-6 !font-black !bg-[#063970] !border-none"></button>
                </div>
            </ng-template>
        </p-dialog>

        <p-toast />

        <style>
            .scroll-container::-webkit-scrollbar { display: none; }
            .scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
            
            .pricing-card {
                flex: 0 0 calc(100% - 2rem);
                scroll-snap-align: center;
                border-radius: 2rem;
                display: flex;
                flex-direction: column;
                transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
                position: relative;
                overflow: visible;
            }

            @media (min-width: 1024px) {
                .pricing-card {
                    flex: 0 0 calc(33.333% - 1.35rem);
                }
            }

            .pricing-card:hover {
                transform: translateY(-12px);
                box-shadow: 0 30px 60px -12px rgba(6, 57, 112, 0.12);
                border-color: #063970;
            }

            :host-context(.dark) .pricing-card:hover {
                box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.4);
            }

            .featured {
                border: 2px solid #063970 !important;
                transform: scale(1.02);
                z-index: 5;
            }

            :host-context(.dark) .featured {
                border-color: #3b82f6 !important;
                background: linear-gradient(180deg, #06111d 0%, #030d17 100%) !important;
            }

            .featured-badge {
                position: absolute;
                top: -12px;
                right: 24px;
                background: linear-gradient(135deg, #063970, #0a4a8f);
                color: white;
                padding: 6px 14px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 900;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 8px 20px -4px rgba(6, 57, 112, 0.5);
                z-index: 20;
            }

            .pricing-action-btn {
                background: #063970 !important;
                border: none !important;
                color: white !important;
            }

            .pricing-action-btn:hover {
                background: #0a4a8f !important;
                transform: translateY(-2px);
            }

            .status-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .status-indicator.success { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
            .status-indicator.warn { background: #fffbeb; color: #b45309; border-color: #fef3c7; }
            .status-indicator.danger { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }

            .slider-nav-btn {
                width: 48px;
                height: 48px;
                border-radius: 16px;
                background: white;
                border: 1px solid #f1f5f9;
                color: #64748b;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }

            :host-context(.dark) .slider-nav-btn {
                background: #1e293b;
                border-color: #334155;
                color: #94a3b8;
            }

            .slider-nav-btn:hover {
                background: #063970;
                color: white;
                border-color: #063970;
                transform: scale(1.1);
            }

            .slider-dot {
                width: 6px;
                height: 6px;
                border-radius: 3px;
                background: #cbd5e1;
                cursor: pointer;
                transition: all 0.4s;
            }

            .slider-dot.active {
                width: 24px;
                background: #063970;
            }
        </style>
    `
})
export class PricingWidget implements OnInit, OnDestroy {
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    public internshipService = inject(InternshipService);
    private candidatureService = inject(CandidatureService);
    private testService = inject(TestService);
    private messageService = inject(MessageService);
    private userService = inject(UserService);
    private router = inject(Router);
    private ngZone = inject(NgZone);
    private cdr = inject(ChangeDetectorRef);
    private http = inject(HttpClient);
    private stageService = inject(StageService);

    originalOffers = signal<InternshipOffer[]>([]);
    stageActif = signal<Stage | null>(null);
    mesStages = signal<Stage[]>([]);
    allUsers = signal<User[]>([]);
    extendedOffers = this.originalOffers;

    canUserApply = computed(() => {
        const role = this.userService.currentUser()?.role;
        return role !== 'Admin' && role !== 'RH' && role !== 'Encadrant';
    });

    userHasActiveInternship = computed(() => {
        return this.mesStages().some(s =>
            [EtatStage.ACCEPTE, EtatStage.EN_COURS, EtatStage.ATT_VALIDATION_ENCADRANT].includes(s.etat)
        );
    });
    currentYear: number = new Date().getFullYear();
    applications = this.internshipService.getApplications();

    applyDialog = false;
    detailsDialog = false;
    selectedOffer: any = null;
    isSubmitting = false;

    currentDotIndex = 0;
    isSmooth = true;
    private timer: any;

    applicationForm = {
        firstName: '',
        lastName: '',
        cvFile: null as File | null,
        letterFile: null as File | null
    };

    applyStep = 1;
    assignedTest: TechnicalTest | null = null;
    testResult: { score: number, passed: boolean } | null = null;
    createdCandidatureId: number | null = null;

    constructor() {
        effect(async () => {
            const user = this.userService.currentUser();
            try {
                await Promise.all([
                    this.loadOffers(),
                    this.loadActiveStage(),
                    this.loadMesStages(),
                    this.loadUsers()
                ]);
            } catch (err) {
                console.error('Error loading data on user change', err);
            } finally {
                this.cdr.detectChanges();
            }
        }, { allowSignalWrites: true });
    }

    async ngOnInit() {
        this.startAutoPlay();
        this.cdr.detectChanges();
    }

    async loadUsers() {
        if (!this.userService.currentUser()) {
            this.allUsers.set([]);
            return;
        }
        try {
            const [basicUsers, encadrants] = await Promise.all([
                this.userService.getUsers(),
                this.userService.getEncadrants()
            ]);
            const mergedUsers = [...basicUsers];
            encadrants.forEach(enc => {
                if (!mergedUsers.find(u => u.id === enc.id)) {
                    mergedUsers.push(enc);
                }
            });
            this.allUsers.set(mergedUsers);
        } catch (err) {
            console.error('Error loading users', err);
        }
    }

    async loadActiveStage() {
        if (!this.userService.currentUser()) {
            this.stageActif.set(null);
            return;
        }
        const stage = await this.stageService.getStageActif();
        this.stageActif.set(stage);
    }

    async loadMesStages() {
        if (!this.userService.currentUser()) {
            this.mesStages.set([]);
            return;
        }
        try {
            const stages = await this.stageService.getMesStages();
            this.mesStages.set(stages);
        } catch (err) {
            console.error('Error loading mes stages', err);
        }
    }

    hasCompletedInternshipFor(offerId: string | number | undefined): boolean {
        if (!offerId) return false;
        const id = typeof offerId === 'string' ? parseInt(offerId) : offerId;
        return this.mesStages().some(s => s.offreStageId === id && s.etat === EtatStage.VALIDE);
    }

    getStageForOffer(offerId: string): Stage | undefined {
        return this.mesStages().find(s => s.offreStageId.toString() === offerId);
    }

    getStageSeverity(etat: EtatStage) {
        switch (etat) {
            case EtatStage.VALIDE: return 'success';
            case EtatStage.NON_VALIDE: return 'danger';
            case EtatStage.EN_COURS: return 'info';
            case EtatStage.ATT_VALIDATION_ENCADRANT: return 'warn';
            default: return 'secondary';
        }
    }

    getSupervisorName(id: string | undefined, stage?: Stage): string {
        if (stage?.encadrantFirstName || stage?.encadrantLastName) {
            return `${stage.encadrantFirstName ?? ''} ${stage.encadrantLastName ?? ''}`.trim();
        }
        if (!id) return 'N/A';
        const users = this.allUsers();
        const superv = users.find(u =>
            u.id?.toString().toLowerCase() === id.toString().toLowerCase() ||
            u.username?.toLowerCase() === id.toLowerCase()
        );
        if (superv) {
            const name = `${superv.firstName || ''} ${superv.lastName || ''}`.trim();
            return name || superv.username || 'N/A';
        }
        return 'N/A';
    }

    hasActiveInternship() {
        return this.mesStages().some(s =>
            [EtatStage.ACCEPTE, EtatStage.EN_COURS, EtatStage.ATT_VALIDATION_ENCADRANT].includes(s.etat)
        );
    }

    ngOnDestroy() {
        if (this.timer) clearInterval(this.timer);
    }

    async loadOffers() {
        try {
            if (this.userService.currentUser()) {
                const prioritized = await this.internshipService.getOffersWithRecommendations();
                this.originalOffers.set(prioritized.filter(o => o.statut !== 'FERME'));
            } else {
                const dtos = await firstValueFrom(this.http.get<OffreStageDTO[]>('http://localhost:8081/api/offres'));
                const mapped = dtos.map(dto => this.internshipService.mapToInternshipOffer(dto));
                this.originalOffers.set(mapped.filter(o => o.statut !== 'FERME'));
            }
            this.internshipService.fetchApplications();
        } catch (err) {
            console.error('Error loading offers', err);
        }
    }

    getApplicationStatus(offerId: string): string | null {
        const app = this.applications().find(a => a.offerId === offerId);
        if (!app) return null;

        // Force 'FINI' if there's a validated/invalidated stage for this offer
        const stage = this.mesStages().find(s => s.offreStageId.toString() === offerId);
        if (stage && (stage.etat === EtatStage.VALIDE || stage.etat === EtatStage.NON_VALIDE)) {
            return 'FINI';
        }

        return app.status;
    }

    getStatusSeverity(status: string) {
        switch (status) {
            case 'ACCEPTEE': return 'success';
            case 'REFUSEE': return 'danger';
            case 'EN_ATTENTE': return 'warn';
            case 'FINI': return 'info';
            default: return 'info';
        }
    }

    openApplyDialog(offer: any) {
        const user = this.userService.currentUser();
        if (!user) {
            this.messageService.add({ severity: 'info', summary: 'Connexion requise', detail: 'Veuillez vous connecter pour postuler.' });
            this.router.navigate(['/auth/login']);
            return;
        }
        this.selectedOffer = offer;
        this.applicationForm = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            cvFile: null,
            letterFile: null
        };
        this.applyStep = 1;
        this.testResult = null;
        this.assignedTest = null;
        this.createdCandidatureId = null;
        this.applyDialog = true;
    }

    async goToTestStep() {
        if (!this.selectedOffer || !this.isFormValid()) return;
        this.isSubmitting = true;
        try {
            if (this.createdCandidatureId) {
                await this.candidatureService.update(this.createdCandidatureId, this.applicationForm.lastName, this.applicationForm.firstName, this.applicationForm.cvFile!, this.applicationForm.letterFile!);
            } else {
                const created = await this.candidatureService.create(parseInt(this.selectedOffer.id), this.applicationForm.lastName, this.applicationForm.firstName, this.applicationForm.cvFile!, this.applicationForm.letterFile!);
                this.createdCandidatureId = created.id;
            }

            if (!this.selectedOffer?.selectedTestId) {
                this.applyStep = 3;
                this.testResult = { score: 0, passed: false };
                this.internshipService.fetchOffers();
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Candidature envoyée !' });
                this.cdr.detectChanges();
                return;
            }

            this.assignedTest = await this.testService.getTestById(this.selectedOffer.selectedTestId);
            this.applyStep = 2;
            this.cdr.detectChanges();
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de soumettre le dossier.' });
        } finally {
            this.isSubmitting = false;
        }
    }

    onTestCompleted(result: { score: number, passed: boolean }) {
        this.testResult = result;
        this.applyStep = 3;
        this.internshipService.fetchOffers();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Candidature envoyée !' });
    }

    openDetailsDialog(offer: any) {
        this.selectedOffer = offer;
        this.detailsDialog = true;
    }

    onFileSelect(event: any, type: 'cv' | 'letter') {
        const file = event.files[0];
        if (file) {
            if (type === 'cv') {
                const ext = file.name.split('.').pop()?.toLowerCase();
                if (ext !== 'pdf' && ext !== 'doc' && ext !== 'docx') {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Le CV doit être au format PDF, DOC ou DOCX.' });
                    this.applicationForm.cvFile = null;
                    return;
                }
                this.applicationForm.cvFile = file;
            } else {
                this.applicationForm.letterFile = file;
            }
        }
    }

    isFormValid() {
        return this.applicationForm.firstName.trim() && this.applicationForm.lastName.trim() && this.applicationForm.cvFile && this.applicationForm.letterFile;
    }

    startAutoPlay() {
        if (this.originalOffers().length <= 1) return;
        this.ngZone.runOutsideAngular(() => {
            this.timer = setInterval(() => {
                this.ngZone.run(() => {
                    this.autoScroll();
                });
            }, 5000);
        });
    }

    autoScroll() {
        if (!this.scrollContainer) return;
        const container = this.scrollContainer.nativeElement;
        const width = this.getCardWidthWithGap();

        if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: width, behavior: 'smooth' });
        }
    }

    getCardWidthWithGap() {
        if (!this.scrollContainer || this.originalOffers().length === 0) return 0;
        const container = this.scrollContainer.nativeElement;
        return container.scrollWidth / this.originalOffers().length;
    }

    scrollToItem(index: number) {
        this.resetTimer();
        const container = this.scrollContainer.nativeElement;
        const width = this.getCardWidthWithGap();
        const target = index * width;
        container.scrollTo({ left: target, behavior: 'smooth' });
    }

    scrollNext() {
        if (!this.scrollContainer) return;
        const nextIndex = (this.currentDotIndex + 1) % this.originalOffers().length;
        this.scrollToItem(nextIndex);
    }

    scrollPrev() {
        if (!this.scrollContainer) return;
        const prevIndex = (this.currentDotIndex - 1 + this.originalOffers().length) % this.originalOffers().length;
        this.scrollToItem(prevIndex);
    }

    onScroll() {
        if (!this.scrollContainer) return;
        const container = this.scrollContainer.nativeElement;
        const width = this.getCardWidthWithGap();
        if (width <= 0) return;

        this.currentDotIndex = Math.round(container.scrollLeft / width);
    }

    resetTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.startAutoPlay();
        }
    }
}
