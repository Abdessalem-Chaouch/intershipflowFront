import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { UserService, User } from '../../../services/user.service';
import { StageService, Stage } from '../../../services/stage.service';
import { DocumentStageService, DocumentStage } from '../../../services/document-stage.service';
import { AffectationService } from '../../../services/affectation.service';

@Component({
    standalone: true,
    selector: 'app-encadrant-dashboard',
    imports: [CommonModule, ChartModule],
    template: `
        <div class="animate-fadein p-4 lg:p-6">

            <!-- ══ HEADER ═════════════════════════════════════════════════════ -->
            <div class="grid grid-cols-12 gap-6 mb-6 items-stretch">
                <!-- Hero Card -->
                <div class="col-span-12 lg:col-span-8 flex">
                    <div class="card w-full relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 dark:from-slate-800 dark:via-slate-900 dark:to-indigo-950 border border-blue-100 dark:border-slate-800/80 flex flex-col justify-center px-8 shadow-xl shadow-blue-900/5 dark:shadow-blue-900/10 rounded-[2.5rem]">
                        <div class="relative z-10">
                            <div class="flex items-center gap-3 mb-3">
                                <span class="bg-blue-100/60 dark:bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-200/60 dark:border-white/10 text-blue-700 dark:text-white shadow-sm">
                                    Espace Encadrant
                                </span>
                                <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 text-[10px] font-bold border border-blue-500/20 dark:border-blue-500/30 shadow-sm">
                                    <i class="pi pi-users text-[10px]"></i>
                                    {{ myStagiaires().length }} Stagiaire(s) affecté(s)
                                </div>
                                <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm"
                                     *ngIf="activeStagesCount() > 0">
                                    <span class="relative flex h-2 w-2">
                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    {{ activeStagesCount() }} Stage(s) actif(s)
                                </div>
                            </div>

                            <h1 class="text-4xl lg:text-5xl font-black mb-3 tracking-tight leading-tight text-[#063970] dark:text-white">
                                Bonjour, <span class="text-blue-600 dark:text-blue-400">{{ userService.currentUser()?.firstName }}</span> !
                            </h1>

                            <p class="text-slate-600 dark:text-slate-300 text-base max-w-xl leading-relaxed font-medium">
                                Vous encadrez actuellement <span class="text-blue-600 dark:text-blue-400 font-extrabold">{{ myStagiaires().length }} stagiaire(s) affecté(s)</span>.
                                Validez leurs livrables et suivez leur progression en temps réel.
                                <span class="block mt-1 opacity-70 dark:opacity-60 text-sm font-normal">{{ today | date:'EEEE dd MMMM yyyy' }}</span>
                            </p>
                        </div>

                        <!-- Decorative bg elements -->
                        <div class="absolute right-[-4%] bottom-[-12%] opacity-[0.03] dark:opacity-[0.07] rotate-12 pointer-events-none text-[#063970] dark:text-white">
                            <i class="pi pi-users" style="font-size: 280px;"></i>
                        </div>
                        <div class="absolute top-[-10%] right-[10%] w-56 h-56 bg-indigo-400 dark:bg-indigo-500 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-20 dark:opacity-30 pointer-events-none"></div>
                    </div>
                </div>

                <!-- Date + Quick Stats Mini Card -->
                <div class="col-span-12 lg:col-span-4 flex">
                    <div class="card w-full bg-white dark:bg-surface-900 border-none shadow-xl rounded-[2rem] p-6 flex flex-col justify-between">
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <div class="text-muted-color text-xs font-black uppercase tracking-widest mb-1">Aujourd'hui</div>
                                <div class="text-xl font-black text-surface-900 dark:text-surface-0">{{ today | date:'dd MMMM yyyy' }}</div>
                            </div>
                            <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <i class="pi pi-calendar text-xl"></i>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <div class="flex items-center justify-between p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl border border-blue-500/20 dark:border-blue-500/30">
                                <div class="flex items-center gap-2">
                                    <div class="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                                    <span class="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">Stagiaires Affectés</span>
                                </div>
                                <span class="text-sm font-black text-blue-800 dark:text-blue-200 bg-white/40 dark:bg-white/10 px-2 py-0.5 rounded-lg border border-blue-200/40">{{ myStagiaires().length }}</span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-surface-100 dark:border-surface-700">
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                                    <span class="text-xs font-bold text-surface-700 dark:text-surface-300">À valider</span>
                                </div>
                                <span class="text-sm font-black text-surface-900 dark:text-surface-0">{{ pendingDocs().length }}</span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-surface-100 dark:border-surface-700">
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span class="text-xs font-bold text-surface-700 dark:text-surface-300">Taux validation</span>
                                </div>
                                <span class="text-sm font-black text-surface-900 dark:text-surface-0">{{ validationRate() }}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ══ KPI CARDS ══════════════════════════════════════════════════ -->
            <div class="grid grid-cols-12 gap-5 mb-6 items-stretch">

                <!-- Stagiaires Affectés (Highlighted Adaptive KPI Card) -->
                <div class="col-span-12 sm:col-span-6 lg:col-span-3 flex">
                    <div class="card mb-0 bg-gradient-to-br from-blue-500/15 to-indigo-600/10 dark:from-blue-500/20 dark:to-indigo-600/15 border border-blue-500/30 dark:border-blue-500/40 shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10 rounded-3xl p-6 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group w-full flex flex-col justify-between">
                        <div class="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <span class="block text-blue-700 dark:text-blue-300 font-black mb-1 uppercase text-[10px] tracking-widest opacity-95">Stagiaires Affectés</span>
                                <div class="text-blue-900 dark:text-surface-0 font-extrabold text-4xl tracking-tight">{{ myStagiaires().length }}</div>
                            </div>
                            <div class="flex items-center justify-center bg-blue-500/10 dark:bg-blue-500/25 rounded-2xl w-12 h-12 transition-transform group-hover:rotate-12 duration-300 shadow-sm border border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-300">
                                <i class="pi pi-users text-xl"></i>
                            </div>
                        </div>
                        <div class="text-xs font-semibold text-emerald-600 dark:text-emerald-300 flex items-center gap-1 relative z-10 bg-emerald-500/10 dark:bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-xl w-fit border border-emerald-500/20 dark:border-white/5">
                            <span class="relative flex h-1.5 w-1.5 mr-0.5">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span>{{ activeStagesCount() }} stage(s) actif(s)</span>
                        </div>
                        
                        <!-- Background glow effect -->
                        <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-400/10 dark:bg-white/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                    </div>
                </div>

                <!-- Livrables à Valider -->
                <div class="col-span-12 sm:col-span-6 lg:col-span-3 flex">
                    <div class="card mb-0 bg-gradient-to-br from-orange-500/10 to-amber-600/5 border border-orange-500/10 dark:border-orange-500/20 shadow-lg rounded-3xl p-6 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group w-full flex flex-col justify-between">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <span class="block text-orange-600 dark:text-orange-400 font-black mb-1 uppercase text-[10px] tracking-widest">À Valider</span>
                                <div class="text-surface-900 dark:text-surface-0 font-extrabold text-3xl">{{ pendingDocs().length }}</div>
                            </div>
                            <div class="flex items-center justify-center bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl w-12 h-12 transition-transform group-hover:rotate-12 duration-300">
                                <i class="pi pi-file-check text-orange-600 dark:text-orange-400 text-xl"></i>
                            </div>
                        </div>
                        <div class="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                            <i class="pi pi-clock text-[10px]"></i>
                            <span>Livrables en attente</span>
                        </div>
                    </div>
                </div>

                <!-- Docs Validés -->
                <div class="col-span-12 sm:col-span-6 lg:col-span-3 flex">
                    <div class="card mb-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/5 border border-emerald-500/10 dark:border-emerald-500/20 shadow-lg rounded-3xl p-6 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group w-full flex flex-col justify-between">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <span class="block text-emerald-600 dark:text-emerald-400 font-black mb-1 uppercase text-[10px] tracking-widest">Docs Validés</span>
                                <div class="text-surface-900 dark:text-surface-0 font-extrabold text-3xl">{{ validatedDocs().length }}</div>
                            </div>
                            <div class="flex items-center justify-center bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl w-12 h-12 transition-transform group-hover:rotate-12 duration-300">
                                <i class="pi pi-check-circle text-emerald-600 dark:text-emerald-400 text-xl"></i>
                            </div>
                        </div>
                        <div class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <i class="pi pi-verified text-[10px]"></i>
                            <span>Documents approuvés</span>
                        </div>
                    </div>
                </div>

                <!-- Taux de Validation -->
                <div class="col-span-12 sm:col-span-6 lg:col-span-3 flex">
                    <div class="card mb-0 bg-gradient-to-br from-purple-500/10 to-indigo-600/5 border border-purple-500/10 dark:border-purple-500/20 shadow-lg rounded-3xl p-6 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group w-full flex flex-col justify-between">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <span class="block text-purple-600 dark:text-purple-400 font-black mb-1 uppercase text-[10px] tracking-widest">Taux Validation</span>
                                <div class="text-surface-900 dark:text-surface-0 font-extrabold text-3xl">{{ validationRate() }}%</div>
                            </div>
                            <div class="flex items-center justify-center bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl w-12 h-12 transition-transform group-hover:rotate-12 duration-300">
                                <i class="pi pi-chart-pie text-purple-600 dark:text-purple-400 text-xl"></i>
                            </div>
                        </div>
                        <div class="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5 mt-2">
                            <div class="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
                                 [style.width]="validationRate() + '%'"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ══ MAIN CONTENT ════════════════════════════════════════════════ -->
            <div class="grid grid-cols-12 gap-6 items-stretch">

                <!-- LEFT COL -->
                <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">

                    <!-- Chart: Livrables par Type -->
                    <div class="card border-none shadow-xl rounded-3xl bg-white dark:bg-surface-900 p-6 flex-1 flex flex-col justify-between">
                        <div class="flex justify-between items-center mb-6">
                            <div>
                                <h3 class="text-lg font-black text-surface-900 dark:text-surface-0">Livrables — Vue d'ensemble</h3>
                                <p class="text-xs text-muted-color mt-0.5 font-medium">Répartition des documents par type et statut</p>
                            </div>
                            <div class="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                                Données Réelles
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center flex-1">
                            <div class="h-[240px] flex items-center justify-center">
                                <p-chart *ngIf="barChartData()" type="bar"
                                         [data]="barChartData()" [options]="barChartOptions()"
                                         height="100%" class="w-full h-full"></p-chart>
                            </div>
                            <div class="h-[240px] flex items-center justify-center">
                                <p-chart *ngIf="doughnutData()" type="doughnut"
                                         [data]="doughnutData()" [options]="doughnutOptions()"
                                         height="100%" class="w-full h-full"></p-chart>
                            </div>
                        </div>
                    </div>

                    <!-- Suivi de Progression des Stagiaires -->
                    <div class="card border-none shadow-xl rounded-3xl bg-white dark:bg-surface-900 p-6 flex-1 flex flex-col justify-between">
                        <div class="flex justify-between items-center mb-6">
                            <div>
                                <h3 class="text-lg font-black text-surface-900 dark:text-surface-0">Suivi de Progression</h3>
                                <p class="text-xs text-muted-color mt-0.5 font-medium">Avancement documentaire de chaque stagiaire</p>
                            </div>
                            <span class="px-3 py-1 bg-surface-50 dark:bg-surface-800 rounded-xl text-[10px] font-black text-muted-color uppercase tracking-widest border border-surface-200 dark:border-surface-700">
                                {{ myStagiaires().length }} stagiaire(s)
                            </span>
                        </div>

                        <div class="overflow-x-auto flex-1">
                            <table class="w-full text-left border-collapse" *ngIf="myStagiaires().length > 0">
                                <thead>
                                    <tr class="text-muted-color border-b border-surface-200 dark:border-surface-700 text-xs font-black uppercase tracking-wider">
                                        <th class="py-3 px-2 font-black">Stagiaire</th>
                                        <th class="py-3 px-2 font-black text-center">Convention</th>
                                        <th class="py-3 px-2 font-black text-center">Rapport</th>
                                        <th class="py-3 px-2 font-black text-center">Présentation</th>
                                        <th class="py-3 px-2 font-black">Progression</th>
                                    </tr>
                                </thead>
                                <tbody class="text-sm">
                                    <tr *ngFor="let s of stagiaireProgression(); let i = index"
                                        class="hover:bg-surface-50 dark:hover:bg-surface-800/20 transition-colors border-b border-surface-100 dark:border-surface-800 last:border-0">
                                        <td class="py-3.5 px-2">
                                            <div class="flex items-center gap-3">
                                                <div class="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0"
                                                     [ngClass]="getAvatarGradient(i)">
                                                    <img *ngIf="s.photoUrl" [src]="s.photoUrl" class="w-full h-full object-cover" [alt]="s.firstName" />
                                                    <span *ngIf="!s.photoUrl">{{ s.firstName?.charAt(0) }}{{ s.lastName?.charAt(0) }}</span>
                                                </div>
                                                <div>
                                                    <div class="font-bold text-surface-900 dark:text-surface-0">{{ s.firstName }} {{ s.lastName }}</div>
                                                    <div class="text-[10px] text-muted-color mt-0.5 font-medium truncate max-w-[140px]">{{ s.email }}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td class="py-3.5 px-2 text-center">
                                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black"
                                                  [ngClass]="s.hasConvention ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-surface-100 dark:bg-surface-800 text-muted-color'">
                                                <i class="pi" [ngClass]="s.hasConvention ? 'pi-check' : 'pi-minus'"></i>
                                            </span>
                                        </td>
                                        <td class="py-3.5 px-2 text-center">
                                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black"
                                                  [ngClass]="s.hasRapport ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-surface-100 dark:bg-surface-800 text-muted-color'">
                                                <i class="pi" [ngClass]="s.hasRapport ? 'pi-check' : 'pi-minus'"></i>
                                            </span>
                                        </td>
                                        <td class="py-3.5 px-2 text-center">
                                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black"
                                                  [ngClass]="s.hasPresentation ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-surface-100 dark:bg-surface-800 text-muted-color'">
                                                <i class="pi" [ngClass]="s.hasPresentation ? 'pi-check' : 'pi-minus'"></i>
                                            </span>
                                        </td>

                                        <td class="py-3.5 px-2">
                                            <div class="flex items-center gap-2">
                                                <div class="flex-1 h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden min-w-[80px]">
                                                    <div class="h-full rounded-full transition-all duration-700"
                                                         [ngClass]="s.progression === 100 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : (s.progression >= 66 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : (s.progression > 0 ? 'bg-gradient-to-r from-orange-400 to-amber-500' : 'bg-surface-200 dark:bg-surface-700'))"
                                                         [style.width]="s.progression + '%'"></div>
                                                </div>
                                                <span class="text-xs font-black w-8 text-right shrink-0"
                                                      [ngClass]="s.progression === 100 ? 'text-emerald-500 dark:text-emerald-400' : (s.progression >= 66 ? 'text-blue-500 dark:text-blue-400' : 'text-orange-500 dark:text-orange-400')">
                                                    {{ s.progression }}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <!-- Empty state -->
                            <div *ngIf="myStagiaires().length === 0" class="flex flex-col items-center justify-center py-12 text-center h-full">
                                <div class="w-20 h-20 rounded-3xl bg-surface-50 dark:bg-surface-800 flex items-center justify-center mb-4 mx-auto">
                                    <i class="pi pi-users text-3xl text-muted-color"></i>
                                </div>
                                <div class="font-black text-surface-900 dark:text-surface-0 mb-1">Aucun stagiaire assigné</div>
                                <p class="text-sm text-muted-color">Vos stagiaires apparaîtront ici une fois affectés.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT COL -->
                <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">

                    <!-- Livrables à Valider -->
                    <div class="card border-none shadow-xl rounded-3xl bg-white dark:bg-surface-900 p-6 flex-1 flex flex-col">
                        <div class="flex justify-between items-center mb-5">
                            <div>
                                <h3 class="text-base font-black text-surface-900 dark:text-surface-0">Livrables à Valider</h3>
                                <p class="text-[10px] text-muted-color mt-0.5 font-medium">Documents soumis par vos stagiaires</p>
                            </div>
                            <div *ngIf="pendingDocs().length > 0"
                                 class="relative flex items-center justify-center w-8 h-8 text-white text-xs font-black rounded-xl">
                                <span class="animate-ping absolute w-full h-full rounded-xl bg-orange-500 opacity-50"></span>
                                <span class="relative w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-xs font-black">{{ pendingDocs().length }}</span>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3 max-h-[220px] lg:max-h-[none] overflow-y-auto flex-1">
                            <div *ngFor="let doc of pendingDocs()"
                                 class="group flex items-center gap-3 p-3.5 rounded-2xl border border-surface-100 dark:border-surface-800 hover:border-orange-200 dark:hover:border-orange-700/50 hover:bg-orange-50/40 dark:hover:bg-orange-900/10 transition-all duration-300 cursor-pointer">
                                <div class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shrink-0">
                                    <i class="pi text-base"
                                       [ngClass]="doc.type === 'CONVENTION' ? 'pi-file' : (doc.type === 'RAPPORT' ? 'pi-file-o' : 'pi-desktop')"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-bold text-sm text-surface-900 dark:text-surface-0 truncate">{{ doc.type }}</div>
                                    <div class="text-[10px] text-muted-color font-medium">{{ doc.firstName }} {{ doc.lastName }}</div>
                                    <div class="text-[10px] text-muted-color" *ngIf="doc.dateDepot">
                                        <i class="pi pi-clock text-[8px] mr-0.5"></i>{{ doc.dateDepot | date:'dd/MM/yyyy' }}
                                    </div>
                                </div>
                                <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700/40 shrink-0">
                                    À réviser
                                </span>
                            </div>

                            <div *ngIf="pendingDocs().length === 0" class="flex flex-col items-center justify-center py-8 text-center h-full justify-center">
                                <div class="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <i class="pi pi-check-circle text-emerald-500 dark:text-emerald-400 text-2xl"></i>
                                </div>
                                <div class="font-black text-sm text-surface-900 dark:text-surface-0 mb-1">Tout est à jour !</div>
                                <p class="text-xs text-muted-color">Aucun document en attente.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Récemment Validés -->
                    <div class="card border-none shadow-xl rounded-3xl bg-white dark:bg-surface-900 p-6 flex-1 flex flex-col">
                        <div class="flex justify-between items-center mb-5">
                            <div>
                                <h3 class="text-base font-black text-surface-900 dark:text-surface-0">Récemment Validés</h3>
                                <p class="text-[10px] text-muted-color mt-0.5 font-medium">Dernières validations effectuées</p>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3 flex-1 overflow-y-auto">
                            <div *ngFor="let doc of recentValidatedDocs()"
                                 class="flex items-center gap-3 p-3 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-800">
                                <div class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <i class="pi pi-check text-sm"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-bold text-xs text-surface-900 dark:text-surface-0 truncate">{{ doc.type }}</div>
                                    <div class="text-[10px] text-muted-color">{{ doc.firstName }} {{ doc.lastName }}</div>
                                </div>
                                <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/40 shrink-0">
                                    Validé
                                </span>
                            </div>

                            <div *ngIf="recentValidatedDocs().length === 0" class="text-center py-6 text-muted-color text-xs font-medium h-full flex items-center justify-center">
                                Aucune validation récente.
                            </div>
                        </div>
                    </div>

                    <!-- États des Stages -->
                    <div class="card border-none shadow-xl rounded-3xl bg-white dark:bg-surface-900 p-6 flex-1 flex flex-col">
                        <div class="flex justify-between items-center mb-5">
                            <div>
                                <h3 class="text-base font-black text-surface-900 dark:text-surface-0">États des Stages</h3>
                                <p class="text-[10px] text-muted-color mt-0.5 font-medium">Répartition par statut</p>
                            </div>
                        </div>
                        <div class="flex flex-col gap-3.5 flex-1 justify-center">
                            <div *ngFor="let stat of stageStats()" class="flex items-center gap-3">
                                <div class="w-2.5 h-2.5 rounded-full shrink-0" [ngClass]="stat.color"></div>
                                <div class="flex-1 text-xs font-bold text-surface-700 dark:text-surface-300">{{ stat.label }}</div>
                                <div class="flex items-center gap-2 shrink-0">
                                    <div class="w-24 h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                                        <div class="h-full rounded-full transition-all duration-700" [ngClass]="stat.barColor" [style.width]="stat.pct + '%'"></div>
                                    </div>
                                    <span class="text-xs font-black text-surface-900 dark:text-surface-0 w-4 text-right">{{ stat.count }}</span>
                                </div>
                            </div>

                            <div *ngIf="myStages().length === 0" class="text-center py-4 text-muted-color text-xs font-medium h-full flex items-center justify-center">
                                Aucun stage trouvé.
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `,
    styles: [`
        :host { display: block; }

        .animate-fadein {
            animation: fadeSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        .card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
    `]
})
export class EncadrantDashboard implements OnInit {
    userService = inject(UserService);
    private stageService  = inject(StageService);
    private docService    = inject(DocumentStageService);
    private affectationService = inject(AffectationService);

    today = new Date();

    // ── Raw signals ──────────────────────────────────────────────────────────
    myStagiaires = signal<User[]>([]);
    allDocs      = signal<DocumentStage[]>([]);
    myStages     = signal<Stage[]>([]);

    // ── Derived: docs ────────────────────────────────────────────────────────
    pendingDocs = computed(() => this.allDocs().filter(d => !d.validationEncadrant));

    validatedDocs = computed(() => this.allDocs().filter(d => d.validationEncadrant));

    recentValidatedDocs = computed(() => this.validatedDocs().slice(0, 4));

    validationRate = computed(() => {
        const total = this.allDocs().length;
        if (total === 0) return 0;
        return Math.round((this.validatedDocs().length / total) * 100);
    });

    // ── Derived: stages ──────────────────────────────────────────────────────
    activeStagesCount = computed(() =>
        this.myStages().filter(s => s.etat === 'EN_COURS').length
    );

    stageStats = computed(() => {
        const stages = this.myStages();
        const total  = stages.length || 1;
        const c = {
            EN_COURS:                stages.filter(s => s.etat === 'EN_COURS').length,
            VALIDE:                  stages.filter(s => s.etat === 'VALIDE').length,
            ATT_VALIDATION_ENCADRANT: stages.filter(s => s.etat === 'ATT_VALIDATION_ENCADRANT').length,
            ACCEPTE:                 stages.filter(s => s.etat === 'ACCEPTE').length,
        };
        return [
            { label: 'En cours',        count: c.EN_COURS,                 pct: Math.round(c.EN_COURS / total * 100),                 color: 'bg-indigo-500',  barColor: 'bg-gradient-to-r from-indigo-500 to-blue-500' },
            { label: 'Validés',         count: c.VALIDE,                   pct: Math.round(c.VALIDE / total * 100),                   color: 'bg-emerald-500', barColor: 'bg-gradient-to-r from-emerald-500 to-teal-500' },
            { label: 'Att. validation', count: c.ATT_VALIDATION_ENCADRANT, pct: Math.round(c.ATT_VALIDATION_ENCADRANT / total * 100), color: 'bg-orange-500',  barColor: 'bg-gradient-to-r from-orange-500 to-amber-500' },
            { label: 'Acceptés',        count: c.ACCEPTE,                  pct: Math.round(c.ACCEPTE / total * 100),                  color: 'bg-blue-500',    barColor: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
        ];
    });

    // ── Derived: stagiaire progression (doc-based) ───────────────────────────
    stagiaireProgression = computed(() => {
        const docs = this.allDocs();
        return this.myStagiaires().map(s => {
            const userDocs        = docs.filter(d => d.userId === s.id || d.username === s.username);
            const hasConvention   = userDocs.some(d => d.type === 'CONVENTION');
            const hasRapport      = userDocs.some(d => d.type === 'RAPPORT');
            const hasPresentation = userDocs.some(d => d.type === 'PRESENTATION');
            const validated       = userDocs.filter(d => d.validationEncadrant).length;
            return { ...s, hasConvention, hasRapport, hasPresentation, progression: Math.round((validated / 3) * 100) };
        });
    });

    // ── Chart: Bar (docs by type, pending vs validated) ──────────────────────
    barChartData = computed(() => {
        const docs  = this.allDocs();
        const types = ['CONVENTION', 'RAPPORT', 'PRESENTATION'];
        const pending   = types.map(t => docs.filter(d => d.type === t && !d.validationEncadrant).length);
        const validated = types.map(t => docs.filter(d => d.type === t &&  d.validationEncadrant).length);
        return {
            labels: ['Convention', 'Rapport', 'Présentation'],
            datasets: [
                {
                    label: 'En attente',
                    data: pending,
                    backgroundColor: 'rgba(249,115,22,0.75)',
                    borderColor: '#f97316',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                },
                {
                    label: 'Validés',
                    data: validated,
                    backgroundColor: 'rgba(16,185,129,0.75)',
                    borderColor: '#10b981',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }
            ]
        };
    });

    barChartOptions = computed(() => {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary') || '#6c757d';
        const border    = getComputedStyle(document.documentElement).getPropertyValue('--surface-border') || '#dee2e6';
        return {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true, position: 'bottom',
                    labels: { color: textColor, font: { size: 10, weight: 'bold' }, boxWidth: 10, padding: 12 }
                },
                tooltip: {
                    padding: 10, cornerRadius: 10,
                    backgroundColor: 'rgba(15,23,42,0.95)',
                    titleColor: '#fff', bodyColor: '#fff',
                    bodyFont: { weight: 'bold' }
                }
            },
            scales: {
                x: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } },
                y: { beginAtZero: true, ticks: { color: textColor, font: { size: 10 }, stepSize: 1 }, grid: { color: border, borderDash: [4, 4] } }
            }
        };
    });

    // ── Chart: Doughnut (validated vs pending total) ──────────────────────────
    doughnutData = computed(() => {
        const v = this.validatedDocs().length;
        const p = this.pendingDocs().length;
        return {
            labels: ['Validés', 'En attente'],
            datasets: [{
                data: [v || 0, p || 0],
                backgroundColor: ['rgba(16,185,129,0.85)', 'rgba(249,115,22,0.85)'],
                borderColor: ['#10b981', '#f97316'],
                borderWidth: 2,
                hoverOffset: 8
            }]
        };
    });

    doughnutOptions = computed(() => {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary') || '#6c757d';
        return {
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: {
                    display: true, position: 'bottom',
                    labels: { color: textColor, font: { size: 10, weight: 'bold' }, boxWidth: 10, padding: 12 }
                },
                tooltip: {
                    padding: 10, cornerRadius: 10,
                    backgroundColor: 'rgba(15,23,42,0.95)',
                    titleColor: '#fff', bodyColor: '#fff',
                    bodyFont: { weight: 'bold' }
                }
            }
        };
    });

    // ── Lifecycle ────────────────────────────────────────────────────────────
    async ngOnInit() {
        await Promise.all([
            this.loadStagiaires(),
            this.loadDocs(),
            this.loadStages()
        ]);
    }

    private async loadStagiaires() {
        try {
            const list = await this.affectationService.getMyStagiaires();
            
            // Deduplicate by student ID to prevent duplicate trainee records in KPI and tables
            const uniqueList: any[] = [];
            const seenIds = new Set<string>();
            for (const s of list) {
                if (s.id && !seenIds.has(s.id)) {
                    seenIds.add(s.id);
                    uniqueList.push(s);
                }
            }
            
            this.myStagiaires.set(uniqueList);
        } catch (err) {
            console.error('Error loading stagiaires', err);
        }
    }

    private async loadDocs() {
        try {
            await this.docService.fetchDocumentsEncadrant();
            this.allDocs.set(this.docService.getDocuments()());
        } catch (err) {
            console.error('Error loading docs', err);
        }
    }

    private async loadStages() {
        try {
            const stages = await this.stageService.getStagesEncadrant();
            this.myStages.set(Array.isArray(stages) ? stages : []);
        } catch (err) {
            console.error('Error loading stages', err);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    getAvatarGradient(index: number): string {
        const gradients = [
            'bg-gradient-to-br from-blue-500 to-indigo-600',
            'bg-gradient-to-br from-emerald-500 to-teal-600',
            'bg-gradient-to-br from-orange-500 to-amber-600',
            'bg-gradient-to-br from-purple-500 to-indigo-600',
            'bg-gradient-to-br from-pink-500 to-rose-600',
            'bg-gradient-to-br from-cyan-500 to-blue-600',
        ];
        return gradients[index % gradients.length];
    }
}
