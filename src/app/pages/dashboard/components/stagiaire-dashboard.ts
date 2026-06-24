import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { StageService, Stage, EtatStage } from '../../../services/stage.service';
import { DocumentStageService, DocumentStage } from '../../../services/document-stage.service';
import { AffectationService, EncadrantDTO } from '../../../services/affectation.service';

import { ChartModule } from 'primeng/chart';

@Component({
    standalone: true,
    selector: 'app-stagiaire-dashboard',
    imports: [CommonModule, ChartModule],
    template: `
        <div class="animate-fadein p-4 lg:p-8">
            <!-- Header Section -->
            <div class="grid grid-cols-12 gap-8 mb-8">
                <div class="col-span-12 lg:col-span-8">
                    <div class="card relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-blue-50/50 dark:from-slate-800 dark:via-slate-900 dark:to-blue-950 border border-blue-100 dark:border-slate-800/80 min-h-[240px] flex flex-col justify-center px-10 shadow-xl shadow-blue-900/5 dark:shadow-blue-900/10 rounded-[2.5rem]">
                        <div class="relative z-10">
                            <div class="flex items-center gap-3 mb-4">
                                <span class="bg-blue-100/50 dark:bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-200/60 dark:border-white/10 text-blue-700 dark:text-white shadow-sm">Tableau de bord</span>
                                <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm" *ngIf="activeStage()?.etat === 'EN_COURS'">
                                    <span class="relative flex h-2 w-2">
                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Stage Actif
                                </div>
                            </div>
                            
                            <h2 class="text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-tight text-[#063970] dark:text-white">
                                Bonjour, <span class="text-blue-600 dark:text-blue-400">{{ userService.currentUser()?.firstName }}</span> !
                            </h2>
                            
                            <p class="text-slate-600 dark:text-slate-300 text-lg max-w-xl leading-relaxed font-medium" *ngIf="activeStage()">
                                Vous progressez sur le projet <span class="text-[#063970] dark:text-white font-bold underline decoration-blue-400/50 underline-offset-4">"{{ activeStage()?.titreOffre }}"</span>. 
                                <span class="block mt-2 opacity-80 dark:opacity-60 text-sm font-normal">Continuez vos excellents efforts pour atteindre vos objectifs !</span>
                            </p>
                            
                            <p class="text-slate-600 dark:text-slate-300 text-lg max-w-xl" *ngIf="!activeStage()">
                                Vous n'avez pas de stage actif. C'est le moment idéal pour explorer les nouvelles opportunités !
                            </p>
                        </div>
                        
                        <!-- Abstract Background Decorations -->
                        <div class="absolute right-[-5%] bottom-[-10%] opacity-[0.03] dark:opacity-10 rotate-12 pointer-events-none text-[#063970] dark:text-white">
                            <i class="pi pi-briefcase text-[300px]"></i>
                        </div>
                        <div class="absolute top-[-10%] right-[15%] w-64 h-64 bg-blue-400 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-20 dark:opacity-40 pointer-events-none"></div>
                    </div>
                </div>

                <div class="col-span-12 lg:col-span-4 flex flex-col gap-4">
                    <!-- Quick Actions / Date Card -->
                    <div class="card h-full bg-white dark:bg-surface-900 border-none shadow-xl rounded-[2rem] p-8 flex flex-col justify-between">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="text-muted-color text-xs font-black uppercase tracking-widest mb-1">Aujourd'hui</div>
                                <div class="text-2xl font-black text-surface-900 dark:text-surface-0">{{ today | date:'dd MMMM yyyy' }}</div>
                            </div>
                            <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                <i class="pi pi-calendar text-xl"></i>
                            </div>
                        </div>
                        
                        <div class="mt-8">
                            <div class="flex justify-between text-xs font-bold mb-2">
                                <span class="text-muted-color">PROGRESSION GLOBALE</span>
                                <span class="text-primary">{{ progression() }}%</span>
                            </div>
                            <div class="h-3 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden p-0.5 border border-surface-200 dark:border-surface-700">
                                <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]" [style.width]="progression() + '%'"></div>
                            </div>
                        </div>
                        
                        <button (click)="goToMesStages()" class="w-full mt-6 py-3 px-4 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 font-bold text-sm cursor-pointer">
                            <i class="pi pi-list"></i>
                            Accéder à mes stages
                        </button>
                    </div>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 items-stretch">
                <!-- Stat 1: Time -->
                <div class="card h-full flex flex-col justify-between mb-0 bg-white dark:bg-surface-900 shadow-lg border-none p-6 rounded-[2rem] hover:translate-y-[-5px] transition-all duration-300 group">
                    <div>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <i class="pi pi-clock text-xl"></i>
                            </div>
                            <span class="text-muted-color font-bold text-xs uppercase tracking-widest">Temps restant</span>
                        </div>
                        <div class="text-3xl font-black text-surface-900 dark:text-surface-0">{{ daysRemaining() }} <span class="text-lg font-bold text-muted-color">Jours</span></div>
                    </div>
                    <div class="mt-4 text-xs text-blue-500 font-bold border-t border-surface-100 dark:border-surface-800 pt-3">Fin prévue le {{ activeStage()?.dateFin | date:'dd/MM/yyyy' }}</div>
                </div>

                <!-- Stat 2: Documents -->
                <div class="card h-full flex flex-col justify-between mb-0 bg-white dark:bg-surface-900 shadow-lg border-none p-6 rounded-[2rem] hover:translate-y-[-5px] transition-all duration-300 group">
                    <div>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                <i class="pi pi-file-check text-xl"></i>
                            </div>
                            <span class="text-muted-color font-bold text-xs uppercase tracking-widest">Validation Docs</span>
                        </div>
                        <div class="text-3xl font-black text-surface-900 dark:text-surface-0">{{ validatedDocCount() }} / 3</div>
                    </div>
                    <div class="mt-4 flex gap-1.5 border-t border-surface-100 dark:border-surface-800 pt-3">
                        <div *ngFor="let status of currentStageDocsStatus()" 
                             class="h-1.5 flex-1 rounded-full shadow-sm transition-all duration-300" 
                             [ngClass]="status.validated ? 'bg-emerald-500' : (status.uploaded ? 'bg-amber-500' : 'bg-surface-200 dark:bg-surface-700')"
                             [title]="status.type + ': ' + (status.validated ? 'Validé' : (status.uploaded ? 'En attente de validation' : 'Non déposé'))">
                        </div>
                    </div>
                </div>

                <!-- Stat 3: Performance -->
                <div class="card h-full flex flex-col justify-between mb-0 bg-white dark:bg-surface-900 shadow-lg border-none p-6 rounded-[2rem] hover:translate-y-[-5px] transition-all duration-300 group">
                    <div>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                <i class="pi pi-star text-xl"></i>
                            </div>
                            <span class="text-muted-color font-bold text-xs uppercase tracking-widest">Moyenne</span>
                        </div>
                        <div class="text-3xl font-black text-surface-900 dark:text-surface-0">{{ averageGrade() }}<span class="text-lg text-muted-color">/20</span></div>
                    </div>
                    <div class="mt-4 text-[10px] text-muted-color font-bold uppercase tracking-widest flex items-center gap-2 border-t border-surface-100 dark:border-surface-800 pt-3">
                        <i class="pi pi-info-circle text-xs"></i> Évaluation encadrant
                    </div>
                </div>

                <!-- Stat 4: Status -->
                <div class="card h-full flex flex-col justify-between mb-0 bg-white dark:bg-surface-900 shadow-lg border-none p-6 rounded-[2rem] hover:translate-y-[-5px] transition-all duration-300 group">
                    <div>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                <i class="pi pi-shield text-xl"></i>
                            </div>
                            <span class="text-muted-color font-bold text-xs uppercase tracking-widest">État du Stage</span>
                        </div>
                        <div class="text-3xl font-black text-surface-900 dark:text-surface-0"><span class="text-lg text-muted-color">Votre état de stage est :</span></div>
                    </div>
                    <div class="flex items-center gap-2 mt-4 border-t border-surface-100 dark:border-surface-800 pt-3">
                        <span class="inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-black uppercase tracking-wider text-white shadow-md transition-all group-hover:scale-105" [ngClass]="getEtatClass(activeStage()?.etat)">
                            {{ getEtatLabel(activeStage()?.etat) }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="grid grid-cols-12 gap-6 items-stretch">
                
                <!-- ROW 1 -->
                <!-- Stage Details Card -->
                <div class="col-span-12 lg:col-span-8 card h-full flex flex-col border-none shadow-xl rounded-3xl bg-white dark:bg-surface-900 p-6">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h3 class="text-2xl font-black text-surface-900 dark:text-surface-0">Mon Stage</h3>
                            <p class="text-muted-color text-sm font-medium">Informations détaillées et jalons de progression</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 items-stretch">
                        <!-- Left: Info Cards -->
                        <div class="col-span-12 md:col-span-7 flex flex-col justify-between gap-3">
                            <div class="flex items-center gap-3.5 p-3.5 bg-blue-50/30 dark:bg-blue-950/10 rounded-2xl border border-blue-100/40 dark:border-blue-900/20 hover:scale-[1.01] transition-transform">
                                <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <i class="pi pi-tag text-lg"></i>
                                </div>
                                <div class="min-w-0 flex-1">
                                    <div class="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">Titre de l'offre</div>
                                    <div class="font-bold text-sm text-surface-800 dark:text-surface-200 truncate" [title]="activeStage()?.titreOffre">
                                        {{ activeStage()?.titreOffre || 'N/A' }}
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center gap-3.5 p-3.5 bg-surface-50/50 dark:bg-surface-800/20 rounded-2xl border border-surface-100/50 dark:border-surface-700/30 hover:scale-[1.01] transition-transform">
                                <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                    <i class="pi pi-id-card text-lg"></i>
                                </div>
                                <div class="min-w-0 flex-1">
                                    <div class="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-0.5">Numéro de stage</div>
                                    <div class="font-bold text-sm text-surface-800 dark:text-surface-200">
                                        #{{ activeStage()?.numeroStage || '0000' }}
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center gap-3.5 p-3.5 bg-surface-50/50 dark:bg-surface-800/20 rounded-2xl border border-surface-100/50 dark:border-surface-700/30 hover:scale-[1.01] transition-transform">
                                <div class="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                                    <i class="pi pi-calendar-plus text-lg"></i>
                                </div>
                                <div class="min-w-0 flex-1">
                                    <div class="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-0.5">Période</div>
                                    <div class="font-bold text-sm text-surface-800 dark:text-surface-200">
                                        Du {{ activeStage()?.dateDebut ? (activeStage()?.dateDebut | date:'dd/MM/yyyy') : 'N/A' }} au {{ activeStage()?.dateFin ? (activeStage()?.dateFin | date:'dd/MM/yyyy') : 'N/A' }}
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center gap-3.5 p-3.5 bg-surface-50/50 dark:bg-surface-800/20 rounded-2xl border border-surface-100/50 dark:border-surface-700/30 hover:scale-[1.01] transition-transform">
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
                                     [ngClass]="activeStage()?.documentsValides ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : (activeStage() ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-surface-100 dark:bg-surface-800 text-muted-color')">
                                    <i class="pi text-lg" [ngClass]="activeStage()?.documentsValides ? 'pi-check-circle' : (activeStage() ? 'pi-clock' : 'pi-exclamation-circle')"></i>
                                </div>
                                <div class="min-w-0 flex-1">
                                    <div class="text-[9px] font-black uppercase tracking-widest mb-0.5 transition-colors duration-300"
                                         [ngClass]="activeStage()?.documentsValides ? 'text-emerald-600 dark:text-emerald-400' : (activeStage() ? 'text-amber-600 dark:text-amber-400' : 'text-muted-color')">
                                        Documents validés
                                    </div>
                                    <div class="font-bold text-sm text-surface-800 dark:text-surface-200">
                                        {{ activeStage()?.documentsValides ? 'Oui - Prêt pour soutenance' : (activeStage() ? 'En cours de validation' : 'N/A') }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right: Stage Stepper -->
                        <div class="col-span-12 md:col-span-5 flex flex-col pl-0 md:pl-6 md:border-l border-surface-100 dark:border-surface-800 justify-between">
                            <div class="text-[10px] font-black text-muted-color uppercase tracking-widest mb-4">Jalons & Documents</div>
                            <div class="flex-1 flex flex-col justify-between py-2 space-y-5">
                                <!-- Step 1: Convention -->
                                <div class="flex items-start gap-3 relative">
                                    <div class="absolute left-[15px] top-8 bottom-[-20px] w-0.5" [ngClass]="isConventionValidated() ? 'bg-emerald-500' : 'bg-surface-200 dark:bg-surface-700'"></div>
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-solid z-10 transition-all duration-300"
                                         [ngClass]="isConventionValidated() 
                                            ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                                            : (isConventionUploaded() 
                                                ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-sm' 
                                                : 'bg-surface-50 dark:bg-surface-800 text-muted-color border-surface-200 dark:border-surface-700')">
                                        <i class="pi text-xs font-bold" [ngClass]="isConventionValidated() ? 'pi-check' : (isConventionUploaded() ? 'pi-clock' : 'pi-file')"></i>
                                    </div>
                                    <div class="flex-1 pt-1 min-w-0">
                                        <div class="flex items-center justify-between gap-2 mb-0.5">
                                            <span class="text-xs font-bold text-surface-900 dark:text-surface-0 leading-tight">Convention de Stage</span>
                                            <span class="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0" 
                                                  [ngClass]="isConventionValidated() ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : (isConventionUploaded() ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-surface-100 dark:bg-surface-800 text-muted-color')">
                                                {{ isConventionValidated() ? 'Validée' : (isConventionUploaded() ? 'En attente' : 'Non déposée') }}
                                            </span>
                                        </div>
                                        <div class="text-[10px] text-muted-color leading-normal">
                                            Cadre légal obligatoire du stage, signé par l'école, l'entreprise et le stagiaire.
                                        </div>
                                    </div>
                                </div>

                                <!-- Step 2: Rapport -->
                                <div class="flex items-start gap-3 relative">
                                    <div class="absolute left-[15px] top-8 bottom-[-20px] w-0.5" [ngClass]="isRapportValidated() ? 'bg-emerald-500' : 'bg-surface-200 dark:bg-surface-700'"></div>
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-solid z-10 transition-all duration-300"
                                         [ngClass]="isRapportValidated() 
                                            ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                                            : (isRapportUploaded() 
                                                ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-sm' 
                                                : 'bg-surface-50 dark:bg-surface-800 text-muted-color border-surface-200 dark:border-surface-700')">
                                        <i class="pi text-xs font-bold" [ngClass]="isRapportValidated() ? 'pi-check' : (isRapportUploaded() ? 'pi-clock' : 'pi-file-o')"></i>
                                    </div>
                                    <div class="flex-1 pt-1 min-w-0">
                                        <div class="flex items-center justify-between gap-2 mb-0.5">
                                            <span class="text-xs font-bold text-surface-900 dark:text-surface-0 leading-tight">Rapport de Stage</span>
                                            <span class="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                                                  [ngClass]="isRapportValidated() ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : (isRapportUploaded() ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-surface-100 dark:bg-surface-800 text-muted-color')">
                                                {{ isRapportValidated() ? 'Validé' : (isRapportUploaded() ? 'En attente' : 'Non déposé') }}
                                            </span>
                                        </div>
                                        <div class="text-[10px] text-muted-color leading-normal">
                                            Synthèse écrite résumant vos réalisations, les technologies utilisées et le bilan de votre stage.
                                        </div>
                                    </div>
                                </div>

                                <!-- Step 3: Soutenance -->
                                <div class="flex items-start gap-3 relative">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-solid z-10 transition-all duration-300"
                                         [ngClass]="isPresentationValidated() 
                                            ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                                            : (isPresentationUploaded() 
                                                ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-sm' 
                                                : 'bg-surface-50 dark:bg-surface-800 text-muted-color border-surface-200 dark:border-surface-700')">
                                        <i class="pi text-xs font-bold" [ngClass]="isPresentationValidated() ? 'pi-check' : (isPresentationUploaded() ? 'pi-clock' : 'pi-desktop')"></i>
                                    </div>
                                    <div class="flex-1 pt-1 min-w-0">
                                        <div class="flex items-center justify-between gap-2 mb-0.5">
                                            <span class="text-xs font-bold text-surface-900 dark:text-surface-0 leading-tight">Soutenance & Présentation</span>
                                            <span class="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                                                  [ngClass]="isPresentationValidated() ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : (isPresentationUploaded() ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-surface-100 dark:bg-surface-800 text-muted-color')">
                                                {{ isPresentationValidated() ? 'Validée' : (isPresentationUploaded() ? 'En attente' : 'Non déposée') }}
                                            </span>
                                        </div>
                                        <div class="text-[10px] text-muted-color leading-normal">
                                            Support de présentation requis pour votre soutenance orale devant le jury.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Encadrant Premium Card -->
                <div class="col-span-12 lg:col-span-4 card h-full flex flex-col border-none shadow-xl rounded-3xl bg-white dark:bg-surface-900 p-0 group">
                    <div class="h-16 bg-gradient-to-r from-blue-600 to-indigo-700 transition-all group-hover:h-20 shrink-0 rounded-t-3xl"></div>
                    <div class="px-5 pb-5 flex-1 flex flex-col items-center -mt-8">
                        <div class="relative mb-3">
                            <div class="w-16 h-16 rounded-[1.5rem] bg-surface-100 dark:bg-surface-800 border-4 border-white dark:border-surface-900 shadow-xl flex items-center justify-center overflow-hidden">
                                <img *ngIf="myEncadrant()?.photoUrl" [src]="myEncadrant()?.photoUrl" class="w-full h-full object-cover" />
                                <div *ngIf="!myEncadrant()?.photoUrl" class="text-3xl font-black text-primary">{{ getSupervisorInitial() }}</div>
                            </div>
                            <div class="absolute bottom-1 right-1 w-6 h-6 rounded-lg bg-emerald-500 border-2 border-white dark:border-surface-900 shadow flex items-center justify-center text-white">
                                <i class="pi pi-verified text-[8px]"></i>
                            </div>
                        </div>
                        
                        <div class="text-center mb-4">
                            <div class="text-xl font-black text-surface-900 dark:text-surface-0 mb-1">
                                {{ myEncadrant() ? (myEncadrant()?.firstName + ' ' + myEncadrant()?.lastName) : getSupervisorName() }}
                            </div>
                            <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-full text-[9px] font-black text-muted-color tracking-[0.15em] uppercase">
                                <i class="pi pi-user-edit text-primary"></i>
                                Encadrant Professionnel
                            </div>
                        </div>

                        <div class="w-full space-y-2 mb-4 flex-1 flex flex-col justify-center">
                            <div class="flex items-center gap-3 px-3 py-2 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-100 dark:border-surface-700">
                                <i class="pi pi-envelope text-primary text-sm"></i>
                                <span class="text-xs font-bold text-surface-700 dark:text-surface-300 truncate">{{ myEncadrant()?.email || 'Email non disponible' }}</span>
                            </div>
                            <div class="flex items-center gap-3 px-3 py-2 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-100 dark:border-surface-700">
                                <i class="pi pi-phone text-primary text-sm"></i>
                                <span class="text-xs font-bold text-surface-700 dark:text-surface-300">{{ myEncadrant()?.phone || 'Portable non disponible' }}</span>
                            </div>
                        </div>
                        
                        <div class="w-full grid grid-cols-2 gap-3 mt-auto">
                            <button class="flex flex-col items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group/btn border border-blue-100/50 dark:border-blue-900/50">
                                <div class="w-8 h-8 rounded-xl bg-white dark:bg-surface-900 flex items-center justify-center text-blue-600 shadow-sm group-hover/btn:scale-110 transition-transform">
                                    <i class="pi pi-envelope text-sm"></i>
                                </div>
                                <span class="text-[9px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">Message</span>
                            </button>
                            <button class="flex flex-col items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all group/btn border border-purple-100/50 dark:border-purple-900/50">
                                <div class="w-8 h-8 rounded-xl bg-white dark:bg-surface-900 flex items-center justify-center text-purple-600 shadow-sm group-hover/btn:scale-110 transition-transform">
                                    <i class="pi pi-calendar text-sm"></i>
                                </div>
                                <span class="text-[9px] font-black uppercase tracking-widest text-purple-700 dark:text-purple-400">Rendez-vous</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- ROW 2 -->
                <!-- Courbe d'Évolution des Dépôts Component -->
                <div class="col-span-12 lg:col-span-6 card h-[320px] flex flex-col border-none shadow-xl rounded-3xl bg-white dark:bg-surface-900 p-6 relative overflow-hidden group">
                    <div class="flex justify-between items-center mb-4 relative z-10">
                        <div>
                            <h3 class="text-xl font-black text-surface-900 dark:text-surface-0">Dépôts des Documents</h3>
                            <p class="text-xs text-muted-color mt-1 font-medium">Évolution des dépôts tout au long de vos stages</p>
                        </div>
                        <div class="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                            Suivi des Dépôts
                        </div>
                    </div>
                    
                    <!-- PrimeNG Real Chart -->
                    <div class="w-full mt-3 flex-1 min-h-[180px] flex flex-col justify-center">
                        <div *ngIf="errorMessage()" class="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/40 text-xs font-semibold leading-relaxed mb-2">
                            <i class="pi pi-exclamation-triangle mr-2"></i>
                            <strong>Erreur de chargement :</strong> {{ errorMessage() }}
                        </div>
                        
                        <div class="w-full flex-1 flex items-center justify-center">
                            <p-chart *ngIf="!errorMessage() && chartData && chartData.datasets && chartData.datasets.length > 0" type="line" [data]="chartData" [options]="chartOptions" height="100%" class="w-full h-full"></p-chart>
                            <div *ngIf="!errorMessage() && (!chartData || !chartData.datasets || chartData.datasets.length === 0)" class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                <i class="pi pi-spin pi-spinner text-3xl mb-3 text-blue-500"></i>
                                <span class="text-xs font-bold uppercase tracking-widest">Chargement de la courbe...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Documents Card -->
                <div class="col-span-12 lg:col-span-6 card h-[320px] flex flex-col border-none shadow-xl rounded-3xl bg-white dark:bg-surface-900 p-6">
                    <div class="flex justify-between items-center mb-5">
                        <h3 class="text-xl font-black">Documents</h3>
                        <div class="w-10 h-10 rounded-xl bg-surface-50 dark:bg-surface-800 flex items-center justify-center text-muted-color">
                            <i class="pi pi-folder-open"></i>
                        </div>
                    </div>
                    
                    <div class="space-y-3 flex-1 overflow-y-auto">
                        <div *ngFor="let doc of currentStageDocs()" (click)="goToDocuments()" class="group flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-2xl hover:bg-primary/5 transition-all cursor-pointer border border-transparent hover:border-primary/20">
                            <div class="w-10 h-10 rounded-xl bg-white dark:bg-surface-900 flex items-center justify-center text-primary shadow-sm group-hover:rotate-6 transition-transform border border-surface-100 dark:border-surface-700">
                                <i class="pi pi-file-pdf text-xl"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="font-black text-sm text-surface-800 dark:text-surface-200 truncate">{{ doc.type }}</div>
                                <div class="text-xs text-muted-color truncate" *ngIf="doc.fileName">{{ doc.fileName }}</div>
                                <div class="flex items-center gap-2 mt-1">
                                    <div class="w-1.5 h-1.5 rounded-full" [ngClass]="doc.validationEncadrant ? 'bg-emerald-500' : 'bg-orange-500'"></div>
                                    <div class="text-[10px] uppercase font-black tracking-widest" [ngClass]="doc.validationEncadrant ? 'text-emerald-500' : 'text-orange-500'">
                                        {{ doc.validationEncadrant ? 'Validé' : 'En attente' }}
                                    </div>
                                    <span class="text-[10px] text-muted-color" *ngIf="doc.dateDepot">
                                        • Déposé le {{ doc.dateDepot | date:'dd/MM/yyyy' }}
                                    </span>
                                </div>
                            </div>
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                                <i class="pi pi-chevron-right text-xs text-primary"></i>
                            </div>
                        </div>

                        <div *ngIf="currentStageDocs().length === 0" class="flex flex-col items-center justify-center py-10 opacity-50">
                            <i class="pi pi-cloud-upload text-4xl mb-3"></i>
                            <div class="text-xs font-bold uppercase tracking-widest">Aucun fichier</div>
                        </div>
                    </div>
                    
                    <button (click)="goToDocuments()" class="w-full cursor-pointer mt-auto py-3 px-4 text-primary font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/5 rounded-2xl transition-all border border-dashed border-primary/20">
                        Gérer tous mes documents
                    </button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep .animate-fadein {
            animation: fadeIn 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
    `]
})
export class StagiaireDashboard implements OnInit {
    userService = inject(UserService);
    private stageService = inject(StageService);
    private docService = inject(DocumentStageService);
    private affectationService = inject(AffectationService);
    private router = inject(Router);

    goToDocuments() {
        this.router.navigate(['/pages/stagiaire-documents']);
    }

    goToMesStages() {
        this.router.navigate(['/pages/mes-stages']);
    }

    activeStage = signal<Stage | null>(null);
    myDocs = signal<DocumentStage[]>([]);
    myEncadrant = signal<EncadrantDTO | null>(null);
    
    daysRemaining = signal(0);
    progression = signal(0);
    averageGrade = signal(0);
    today = new Date();

    currentStageDocs = computed(() => {
        const stage = this.activeStage();
        if (!stage) return [];
        return this.myDocs().filter(d => d.idStage === stage.id);
    });

    currentStageDocsStatus = computed(() => {
        const docs = this.currentStageDocs();
        const types: ('CONVENTION' | 'RAPPORT' | 'PRESENTATION')[] = ['CONVENTION', 'RAPPORT', 'PRESENTATION'];
        return types.map(type => {
            const doc = docs.find(d => d.type === type);
            return {
                type,
                uploaded: !!doc,
                validated: doc ? !!doc.validationEncadrant : false,
                doc
            };
        });
    });

    validatedDocCount = computed(() => {
        return this.currentStageDocsStatus().filter(s => s.validated).length;
    });

    isConventionUploaded = computed(() => {
        return !!this.currentStageDocs().find(d => d.type === 'CONVENTION');
    });
    isConventionValidated = computed(() => {
        return !!this.currentStageDocs().find(d => d.type === 'CONVENTION')?.validationEncadrant;
    });

    isRapportUploaded = computed(() => {
        return !!this.currentStageDocs().find(d => d.type === 'RAPPORT');
    });
    isRapportValidated = computed(() => {
        return !!this.currentStageDocs().find(d => d.type === 'RAPPORT')?.validationEncadrant;
    });

    isPresentationUploaded = computed(() => {
        return !!this.currentStageDocs().find(d => d.type === 'PRESENTATION');
    });
    isPresentationValidated = computed(() => {
        return !!this.currentStageDocs().find(d => d.type === 'PRESENTATION')?.validationEncadrant;
    });

    chartData: any;
    chartOptions: any;
    errorMessage = signal<string | null>(null);

    initChart(stages: Stage[], allDocs: DocumentStage[]) {
        try {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
            const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
            const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

            const colors = [
                { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.05)' }, // Blue
                { border: '#10b981', bg: 'rgba(16, 185, 129, 0.05)' }, // Emerald
                { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.05)' }, // Purple
                { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)' },  // Amber
                { border: '#ec4899', bg: 'rgba(236, 72, 153, 0.05)' }  // Pink
            ];

            const safeStages = Array.isArray(stages) ? stages : [];
            const safeDocs = Array.isArray(allDocs) ? allDocs : [];

            // Calculate max weeks among all stages
            let maxWeeks = 0;
            safeStages.forEach(stage => {
                if (stage.dateDebut && stage.dateFin) {
                    const debut = new Date(stage.dateDebut);
                    const fin = new Date(stage.dateFin);
                    const diffTime = fin.getTime() - debut.getTime();
                    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
                    if (diffWeeks > maxWeeks) {
                        maxWeeks = diffWeeks;
                    }
                }
            });
            if (maxWeeks === 0) maxWeeks = 16; // default fallback if no stage details

            const getWeeks = (dateDepotStr: string | undefined, dateDebutStr: string | Date | undefined) => {
                if (!dateDepotStr || !dateDebutStr) return null;
                const depot = new Date(dateDepotStr);
                const debut = new Date(dateDebutStr);
                const diffTime = depot.getTime() - debut.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                const diffWeeks = Math.ceil(diffDays / 7);
                return Math.max(1, diffWeeks);
            };

            const datasets = safeStages.map((stage, idx) => {
                const color = colors[idx % colors.length];
                
                // Filter documents for this stage
                const stageDocs = safeDocs.filter(d => 
                    d && (d.idStage === stage.id || 
                    d.numeroStage === stage.numeroStage || 
                    d.titreOffre === stage.titreOffre)
                );

                const conventionDoc = stageDocs.find(d => d.type === 'CONVENTION');
                const rapportDoc = stageDocs.find(d => d.type === 'RAPPORT');
                const presentationDoc = stageDocs.find(d => d.type === 'PRESENTATION');

                const yConvention = conventionDoc ? getWeeks(conventionDoc.dateDepot, stage.dateDebut) : null;
                const yRapport = rapportDoc ? getWeeks(rapportDoc.dateDepot, stage.dateDebut) : null;
                const yPresentation = presentationDoc ? getWeeks(presentationDoc.dateDepot, stage.dateDebut) : null;

                const formatDate = (dateStr: string | undefined) => {
                    if (!dateStr) return '';
                    const date = new Date(dateStr);
                    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                };

                const fullLabel = stage.titreOffre || `Stage #${stage.numeroStage || stage.id}`;
                const truncatedLabel = fullLabel.length > 20 ? fullLabel.substring(0, 17) + '...' : fullLabel;

                return {
                    label: truncatedLabel,
                    fullLabel: fullLabel,
                    data: [yConvention, yRapport, yPresentation],
                    depositDates: [
                        conventionDoc ? formatDate(conventionDoc.dateDepot) : '',
                        rapportDoc ? formatDate(rapportDoc.dateDepot) : '',
                        presentationDoc ? formatDate(presentationDoc.dateDepot) : ''
                    ],
                    fill: false,
                    borderColor: color.border,
                    tension: 0.8,
                    pointBackgroundColor: color.border,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    spanGaps: true
                };
            });

            // If no stages, show a default empty dataset
            if (datasets.length === 0) {
                datasets.push({
                    label: 'Aucun stage',
                    fullLabel: 'Aucun stage',
                    data: [null, null, null] as any,
                    depositDates: ['', '', ''],
                    fill: false,
                    borderColor: '#6c757d',
                    tension: 0.8,
                    pointBackgroundColor: '#6c757d',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    spanGaps: true
                });
            }

            this.chartData = {
                labels: ['Convention', 'Rapport', 'Soutenance/Présentation'],
                datasets: datasets
            };

            this.chartOptions = {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                            usePointStyle: true,
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context: any) {
                                const dataset = context.dataset;
                                const index = context.dataIndex;
                                const yValue = context.parsed.y;
                                const dateDepot = dataset.depositDates ? dataset.depositDates[index] : null;
                                
                                let label = dataset.fullLabel || dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (yValue !== null && yValue !== undefined) {
                                    label += `Semaine ${yValue}`;
                                    if (dateDepot) {
                                        label += ` (Déposé le ${dateDepot})`;
                                    }
                                } else {
                                    label += 'Non déposé';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary,
                            font: {
                                weight: '500'
                            }
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false
                        }
                    },
                    y: {
                        ticks: {
                            color: textColorSecondary,
                            stepSize: 1,
                            callback: function(value: any) {
                                if (Number.isInteger(value)) {
                                    return 'Semaine ' + value;
                                }
                                return value;
                            }
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false
                        },
                        title: {
                            display: true,
                            text: 'Durée du stage (en semaines)',
                            color: textColorSecondary,
                            font: {
                                weight: 'bold'
                            }
                        },
                        min: 1,
                        max: maxWeeks
                    }
                }
            };
        } catch (err: any) {
            console.error('Error in initChart', err);
            this.errorMessage.set('Erreur Graphique : ' + (err?.message || String(err)));
        }
    }

    getSupervisorName = computed(() => {
        const stage: any = this.activeStage();
        if (stage?.encadrantFirstName || stage?.encadrantLastName) {
            return `${stage.encadrantFirstName ?? ''} ${stage.encadrantLastName ?? ''}`.trim();
        }

        const encadrant = this.myEncadrant();
        if (encadrant) {
            const fullName = `${encadrant.firstName ?? ''} ${encadrant.lastName ?? ''}`.trim();
            return fullName || encadrant.encadrantNom || 'Encadrant Professionnel';
        }
        
        return stage?.encadrantNom || 'En attente d\'affectation';
    });

    getSupervisorInitial = computed(() => {
        const name = this.getSupervisorName();
        if (name === 'En attente d\'affectation' || name === 'Encadrant Professionnel') return '?';
        return name.charAt(0).toUpperCase();
    });

    async ngOnInit() {
        // Pre-initialize chart data structure to avoid PrimeNG rendering errors before async data is loaded
        this.chartData = { labels: [], datasets: [] };
        this.chartOptions = {};
        this.loadData();
    }

    async loadData() {
        try {
            this.errorMessage.set(null);

            // 1. Get all stages of the user
            const stages = await this.stageService.getMesStages();
            const safeStages = stages || [];

            // 2. Get documents stage-by-stage (bypassing the broken /mes-documents endpoint)
            const allDocs: DocumentStage[] = [];
            for (const stg of safeStages) {
                try {
                    const stgDocs = await this.docService.getDocumentsByStage(stg.id);
                    if (stgDocs && Array.isArray(stgDocs)) {
                        allDocs.push(...stgDocs);
                    }
                } catch (stgErr) {
                    console.warn(`Could not load documents for stage ${stg.id}`, stgErr);
                }
            }
            this.myDocs.set(allDocs);

            // 3. Get active stage
            const stage = await this.stageService.getStageActif();
            this.activeStage.set(stage);

            if (stage) {
                // Calculate days remaining
                const end = new Date(stage.dateFin);
                const start = new Date(stage.dateDebut);
                const today = new Date();
                
                const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                this.daysRemaining.set(diff > 0 ? diff : 0);
                
                const elapsed = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                const prog = Math.round((elapsed / totalDays) * 100);
                this.progression.set(prog > 100 ? 100 : (prog < 0 ? 0 : prog));

                // Set metrics based on the active stage documents
                const activeStageDocs = allDocs.filter(d => d.idStage === stage.id);
                
                const gradedDocs = activeStageDocs.filter(d => d.noteEncadrant !== undefined && d.noteEncadrant !== null);
                if (gradedDocs.length > 0) {
                    const avg = gradedDocs.reduce((acc, doc) => acc + (doc.noteEncadrant || 0), 0) / gradedDocs.length;
                    this.averageGrade.set(Math.round(avg * 10) / 10);
                }
            } else {
                this.averageGrade.set(0);
            }

            // 4. Get my supervisor details
            const encadrant = await this.affectationService.getMyEncadrant();
            this.myEncadrant.set(encadrant);

            // 5. Initialize the chart with real data
            this.initChart(safeStages, allDocs);

        } catch (err: any) {
            console.error('Error loading stagiaire dashboard data', err);
            this.errorMessage.set(err?.message || err?.statusText || String(err));
            // Fallback empty chart
            this.initChart([], []);
        }
    }

    getEtatLabel(etat: EtatStage | string | undefined): string {
        if (!etat) return 'Aucun stage';
        switch (etat) {
            case EtatStage.ACCEPTE: return 'Accepté';
            case EtatStage.EN_COURS: return 'En Cours';
            case EtatStage.ATT_VALIDATION_ENCADRANT: return 'Attente Validation';
            case EtatStage.VALIDE: return 'Validé';
            case EtatStage.NON_VALIDE: return 'Non Validé';
            case 'ANNULE':
            case EtatStage.ANNULE: return 'Annulé';
            default: return etat as string;
        }
    }

    getEtatClass(etat: EtatStage | string | undefined): string {
        if (!etat) return 'bg-surface-500';
        switch (etat) {
            case EtatStage.ACCEPTE: return 'bg-blue-500 shadow-blue-500/30';
            case EtatStage.EN_COURS: return 'bg-indigo-500 shadow-indigo-500/30';
            case EtatStage.ATT_VALIDATION_ENCADRANT: return 'bg-amber-500 shadow-amber-500/30';
            case EtatStage.VALIDE: return 'bg-emerald-500 shadow-emerald-500/30';
            case EtatStage.NON_VALIDE: return 'bg-rose-500 shadow-rose-500/30';
            case 'ANNULE':
            case EtatStage.ANNULE: return 'bg-red-500 shadow-red-500/30';
            default: return 'bg-surface-500';
        }
    }
}
