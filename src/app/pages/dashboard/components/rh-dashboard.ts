import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { UserService } from '../../../services/user.service';
import { InternshipService, InternshipApplication, InternshipOffer } from '../../../services/internship.service';
import { CandidatureService, CandidatureResponseDto } from '../../../services/candidature.service';
import { LayoutService } from '@/app/layout/service/layout.service';
import { PredictionService as BackendPredictionService } from '../../../services/prediction.service';


@Component({
    standalone: true,
    selector: 'app-rh-dashboard',
    imports: [CommonModule, ChartModule],
    template: `
        <div class="grid grid-cols-12 gap-6">
            <!-- Header Section -->
            <div class="col-span-12 mb-2">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 class="text-3xl font-black text-surface-900 dark:text-surface-0 tracking-tight">Tableau de Bord RH</h1>
                        <p class="text-muted-color text-sm mt-1 font-medium">Visualisez l'activité de recrutement et estimez l'impact de vos prochaines offres avec l'IA.</p>
                    </div>
                </div>
            </div>

            <!-- Summary Stats -->
            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                <div class="card mb-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/5 border border-blue-500/10 dark:border-blue-500/20 shadow-lg rounded-3xl p-6 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <span class="block text-blue-600 dark:text-blue-400 font-black mb-1 uppercase text-[10px] tracking-widest">Offres Publiées</span>
                            <div class="text-surface-900 dark:text-surface-0 font-extrabold text-3xl">{{ offerCount() }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl w-12 h-12 transition-transform group-hover:rotate-12 duration-300">
                            <i class="pi pi-briefcase text-blue-600 dark:text-blue-400 text-xl font-bold"></i>
                        </div>
                    </div>
                    <div class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <i class="pi pi-arrow-up text-[10px]"></i>
                        <span>+3 cette semaine</span>
                    </div>
                </div>
            </div>

            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                <div class="card mb-0 bg-gradient-to-br from-orange-500/10 to-amber-600/5 border border-orange-500/10 dark:border-orange-500/20 shadow-lg rounded-3xl p-6 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <span class="block text-orange-600 dark:text-orange-400 font-black mb-1 uppercase text-[10px] tracking-widest">Candidatures</span>
                            <div class="text-surface-900 dark:text-surface-0 font-extrabold text-3xl">{{ applicationCount() }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl w-12 h-12 transition-transform group-hover:rotate-12 duration-300">
                            <i class="pi pi-users text-orange-600 dark:text-orange-400 text-xl font-bold"></i>
                        </div>
                    </div>
                    <div class="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <i class="pi pi-clock text-[10px]"></i>
                        <span>{{ pendingCount() }} en attente de revue</span>
                    </div>
                </div>
            </div>

            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                <div class="card mb-0 bg-gradient-to-br from-purple-500/10 to-indigo-600/5 border border-purple-500/10 dark:border-purple-500/20 shadow-lg rounded-3xl p-6 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <span class="block text-purple-600 dark:text-purple-400 font-black mb-1 uppercase text-[10px] tracking-widest">Entretiens</span>
                            <div class="text-surface-900 dark:text-surface-0 font-extrabold text-3xl">14</div>
                        </div>
                        <div class="flex items-center justify-center bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl w-12 h-12 transition-transform group-hover:rotate-12 duration-300">
                            <i class="pi pi-calendar text-purple-600 dark:text-purple-400 text-xl font-bold"></i>
                        </div>
                    </div>
                    <div class="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <i class="pi pi-calendar-plus text-[10px]"></i>
                        <span>5 planifiés aujourd'hui</span>
                    </div>
                </div>
            </div>

            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                <div class="card mb-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/5 border border-emerald-500/10 dark:border-emerald-500/20 shadow-lg rounded-3xl p-6 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <span class="block text-emerald-600 dark:text-emerald-400 font-black mb-1 uppercase text-[10px] tracking-widest">Taux d'Acceptation</span>
                            <div class="text-surface-900 dark:text-surface-0 font-extrabold text-3xl">{{ acceptanceRate() }}%</div>
                        </div>
                        <div class="flex items-center justify-center bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl w-12 h-12 transition-transform group-hover:rotate-12 duration-300">
                            <i class="pi pi-chart-line text-emerald-600 dark:text-emerald-400 text-xl font-bold"></i>
                        </div>
                    </div>
                    <div class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <i class="pi pi-sparkles text-[10px]"></i>
                        <span>+2% vs mois dernier</span>
                    </div>
                </div>
            </div>

            <!-- Left column: Charts & Applications List -->
            <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">
                <!-- Trend Chart Card (Courbe Réelle) -->
                <div class="card border-none shadow-xl rounded-3xl bg-white dark:bg-surface-900 p-6 mb-6 w-full">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h3 class="text-lg font-black text-surface-900 dark:text-surface-0">Évolution des Candidatures</h3>
                            <p class="text-xs text-muted-color mt-0.5 font-medium">Historique des candidatures déposées ces 6 derniers mois</p>
                        </div>
                        <div class="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                            Données Réelles
                        </div>
                    </div>
                    <div class="h-[260px] w-full mt-2">
                        <p-chart *ngIf="chartData()" type="line" [data]="chartData()" [options]="chartOptions()" height="100%" class="w-full h-full"></p-chart>
                    </div>
                </div>

                <!-- Recent Applications Table Card -->
                <div class="card border-none shadow-xl rounded-3xl bg-white dark:bg-surface-900 p-6 mb-6 w-full">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h3 class="text-lg font-black text-surface-900 dark:text-surface-0">Candidatures Récentes</h3>
                            <p class="text-xs text-muted-color mt-0.5 font-medium">Derniers dossiers reçus et analysés par l'IA</p>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="text-muted-color border-b border-surface-200 dark:border-surface-700 text-xs font-black uppercase tracking-wider">
                                    <th class="py-3 px-2 font-black">Candidat</th>
                                    <th class="py-3 px-2 font-black">Offre Visée</th>
                                    <th class="py-3 px-2 font-black text-center">Score IA</th>
                                    <th class="py-3 px-2 font-black text-center">Statut</th>
                                    <th class="py-3 px-2 font-black text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm">
                                <tr *ngFor="let app of recentApplications()" class="hover:bg-surface-50 dark:hover:bg-surface-800/20 transition-colors border-b border-surface-100 dark:border-surface-800 last:border-0">
                                    <td class="py-3.5 px-2">
                                        <div class="flex items-center gap-3">
                                            <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                                                {{ app.firstName.charAt(0) }}{{ app.lastName.charAt(0) }}
                                            </div>
                                            <div>
                                                <div class="font-bold text-surface-900 dark:text-surface-0">{{ app.firstName }} {{ app.lastName }}</div>
                                                <div class="text-[10px] text-muted-color mt-0.5 font-medium">Reçu le {{ app.date | date:'dd/MM/yyyy' }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="py-3.5 px-2 font-bold text-primary max-w-[180px] truncate">{{ app.offerTitle }}</td>
                                    <td class="py-3.5 px-2 text-center">
                                        <div class="inline-flex items-center px-2.5 py-1 rounded-xl font-extrabold text-xs" 
                                             [ngClass]="getScoreClass(app.iaScore)">
                                            <i class="pi pi-bolt mr-1 text-[10px]"></i>
                                            {{ app.iaScore }}%
                                        </div>
                                    </td>
                                    <td class="py-3.5 px-2 text-center">
                                        <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest" 
                                              [ngClass]="getStatusClass(app.status)">
                                            {{ app.status === 'EN_ATTENTE' ? 'En attente' : (app.status === 'ACCEPTEE' ? 'Acceptée' : 'Refusée') }}
                                        </span>
                                    </td>
                                    <td class="py-3.5 px-2 text-right">
                                        <button class="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300 rounded-xl transition-all cursor-pointer">
                                            <i class="pi pi-eye text-xs"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr *ngIf="recentApplications().length === 0">
                                    <td colspan="5" class="py-8 text-center text-muted-color font-medium">
                                        Aucune candidature récente trouvée.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Right column: Prediction Simulator & Pipeline -->
            <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <!-- AI Prediction Simulator Card -->
                <div class="card border-none shadow-2xl rounded-3xl bg-white dark:bg-surface-900 text-surface-800 dark:text-white p-6 relative overflow-visible group border border-surface-100 dark:border-surface-800/80 shadow-[0_0_50px_rgba(59,130,246,0.05)] dark:shadow-[0_0_50px_rgba(59,130,246,0.1)] flex-1 flex flex-col justify-between">
                    <!-- Futuristic Background Elements -->
                    <div class="absolute -right-20 -top-20 w-48 h-48 bg-primary/10 dark:bg-primary/20 rounded-full blur-[60px] pointer-events-none animate-pulse"></div>
                    <div class="absolute -left-20 -bottom-20 w-48 h-48 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none"></div>

                    <div class="relative z-10 flex flex-col h-full">
                        <div class="flex items-center justify-between mb-0">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-sparkles text-primary dark:text-primary-light text-base animate-bounce"></i>
                                <h3 class="text-xs font-black uppercase tracking-widest text-surface-700 dark:text-surface-200">Prédiction IA Offre</h3>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-[9px] bg-primary/10 dark:bg-primary/25 border border-primary/20 dark:border-primary/40 text-primary dark:text-primary-light font-black tracking-widest uppercase">IA Core v2.0</span>
                        </div>

                        <!-- Mode Switch Tabs (Futuristic Floating Toggle) -->
                        <div class="flex bg-surface-100 dark:bg-surface-950/60 p-1.5 rounded-2xl mb-0 border border-surface-200 dark:border-surface-800/80">
                            <button (click)="predictionTab.set('existing')" 
                                    class="flex-1 py-2 text-center text-xs font-black rounded-xl transition-all duration-300 cursor-pointer"
                                    [ngClass]="predictionTab() === 'existing' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]' : 'text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'">
                                Offre Active
                            </button>
                            <button (click)="predictionTab.set('new')" 
                                    class="flex-1 py-2 text-center text-xs font-black rounded-xl transition-all duration-300 cursor-pointer"
                                    [ngClass]="predictionTab() === 'new' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]' : 'text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'">
                                Simuler Nouvelle
                            </button>
                        </div>

                        <!-- TAB 1: Existing Offer Prediction -->
                        <div *ngIf="predictionTab() === 'existing'" class="py-4">
                            <p class="text-xs text-surface-500 dark:text-surface-400 font-medium mb-5 leading-relaxed">Sélectionnez une offre active pour analyser l'attractivité des compétences requises en temps réel.</p>
                            
                            <div *ngIf="allOffers().length > 0" class="mb-5">
                                <label class="block text-[9px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-2">Choisir une offre active</label>
                                <div class="relative">
                                                                            <select [value]="selectedOfferId()" (change)="selectedOfferId.set(getSelectValue($event))"
                                            class="w-full bg-gradient-to-r from-surface-50 to-surface-100 dark:from-surface-800/80 dark:to-surface-900/80 border-2 border-primary/30 rounded-xl pl-4 pr-10 py-3 text-sm font-medium text-surface-800 dark:text-surface-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer shadow-sm"
                                        >>
                                        <option *ngFor="let o of allOffers()" [value]="o.id" class="bg-white dark:bg-surface-900 text-surface-800 dark:text-white font-medium">{{ o.title }}</option>
                                    </select>
                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400 dark:text-surface-500">
                                        <i class="pi pi-chevron-down text-xs"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div *ngIf="allOffers().length === 0" class="py-6 text-center text-surface-400 dark:text-surface-500 text-xs font-medium">
                                <i class="pi pi-exclamation-circle text-lg mb-2 block text-surface-400 dark:text-surface-600"></i>
                                Aucune offre active trouvée.
                            </div>
                        </div>

                        <!-- TAB 2: New Offer Simulation -->
                        <div *ngIf="predictionTab() === 'new'" class="py-4">
                            <p class="text-xs text-surface-500 dark:text-surface-400 font-medium mb-5 leading-relaxed">Configurez votre future offre en sélectionnant les compétences pour simuler l'intérêt candidat.</p>

                            <!-- Custom Skills Selector Chips (Premium Grid layout) -->
                            <div class="mb-5">
                                <label class="block text-[9px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-2.5">Compétences recherchées (Sélectionner)</label>
                                <div class="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                                    <div *ngFor="let tech of techOptions" 
                                         (click)="toggleSimTech(tech.value)"
                                         [ngClass]="selectedSimTechs().includes(tech.value) ? 'border-primary bg-primary/10 text-primary dark:text-white shadow-[0_0_12px_rgba(59,130,246,0.15)] font-bold' : 'border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/40 text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50 hover:text-surface-800 dark:hover:text-surface-200'"
                                         class="flex items-center gap-2 text-xs cursor-pointer p-2.5 border rounded-2xl transition-all duration-300 select-none">
                                        <i class="pi" [ngClass]="selectedSimTechs().includes(tech.value) ? 'pi-check-circle text-primary text-xs' : 'pi-circle text-surface-300 dark:text-surface-700 text-xs'"></i>
                                        <span>{{ tech.label }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Modality & Duration for Simulation (Sleek Input Fields) -->
                            <div class="grid grid-cols-2 gap-3 mb-5">
                                <div>
                                    <label class="block text-[9px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-2">Durée du Stage</label>
                                    <div class="relative">
                                        <select [value]="selectedSimDuration()" (change)="selectedSimDuration.set(+getSelectValue($event))"
                                                class="w-full bg-surface-50 dark:bg-surface-950/80 border border-surface-200 dark:border-surface-800/80 rounded-2xl pl-3.5 pr-8 py-2.5 text-xs font-bold text-surface-800 dark:text-surface-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all appearance-none cursor-pointer">
                                            <option value="3" class="bg-white dark:bg-surface-900 text-surface-800 dark:text-white">3 Mois</option>
                                            <option value="4" class="bg-white dark:bg-surface-900 text-surface-800 dark:text-white">4 Mois</option>
                                            <option value="6" class="bg-white dark:bg-surface-900 text-surface-800 dark:text-white">6 Mois (PFE)</option>
                                        </select>
                                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400 dark:text-surface-500">
                                            <i class="pi pi-clock text-[10px]"></i>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-[9px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-2">Modalité</label>
                                    <div class="relative">
                                        <select [value]="selectedSimModality()" (change)="selectedSimModality.set(getSelectValue($event))"
                                                class="w-full bg-surface-50 dark:bg-surface-950/80 border border-surface-200 dark:border-surface-800/80 rounded-2xl pl-3.5 pr-8 py-2.5 text-xs font-bold text-surface-800 dark:text-surface-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all appearance-none cursor-pointer">
                                            <option value="presentiel" class="bg-white dark:bg-surface-900 text-surface-800 dark:text-white">Présentiel</option>
                                            <option value="hybride" class="bg-white dark:bg-surface-900 text-surface-800 dark:text-white">Hybride</option>
                                            <option value="tele" class="bg-white dark:bg-surface-900 text-surface-800 dark:text-white">Télétravail</option>
                                        </select>
                                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400 dark:text-surface-500">
                                            <i class="pi pi-map-marker text-[10px]"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Results Output Container (Shared between Tabs) -->
                        <div *ngIf="predictionTab() === 'new' || allOffers().length > 0">
                            <!-- Predicted Numbers Badge / Sleek Telemetry Block -->
                            <div class="p-6 bg-gradient-to-br from-surface-50 to-surface-100/50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 border border-surface-200 dark:border-surface-800/80 rounded-3xl flex flex-col relative overflow-hidden mb-5 shadow-inner dark:shadow-2xl">
                                <!-- Live AI Badge overlay -->
                                <div class="absolute top-4 right-4 flex items-center gap-1.5">
                                    <span class="relative flex h-2 w-2">
                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" [ngClass]="backendStatus() === 'OFFLINE' ? 'bg-orange-500' : 'bg-primary'"></span>
                                        <span class="relative inline-flex rounded-full h-2 w-2" [ngClass]="backendStatus() === 'OFFLINE' ? 'bg-orange-500' : 'bg-primary'"></span>
                                    </span>
                                    <span class="text-[9px] font-black tracking-widest uppercase animate-pulse" [ngClass]="backendStatus() === 'OFFLINE' ? 'text-orange-500' : 'text-primary'">{{ isLoadingPrediction() ? 'Calcul en cours...' : (backendStatus() === 'OFFLINE' ? 'ML Service Offline' : 'Modèle ML Backend') }}</span>
                                </div>

                                <!-- Value Display -->
                                <div class="flex flex-col gap-5 mb-5 border-b border-surface-200 dark:border-surface-800/50 pb-5">
                                    <!-- ESTIMATION DES DOSSIERS -->
                                    <div>
                                        <span class="block text-[10px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-2 leading-relaxed">ESTIMATION DES DOSSIERS</span>
                                        <div *ngIf="predictionResult().predictedValue !== null" class="text-4xl font-black text-surface-800 dark:text-white tracking-tight flex items-baseline gap-1.5 select-none leading-tight">
                                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600 dark:from-primary-light dark:to-primary text-5xl font-black">{{ predictionResult().predictedValue }}</span>
                                            <span class="text-[11px] text-surface-500 dark:text-surface-400 font-bold ml-2">Candidats prédits (Modèle ML)</span>
                                        </div>
                                        <div *ngIf="predictionResult().predictedValue === null" class="text-4xl font-black text-surface-800 dark:text-white tracking-tight flex items-baseline gap-1.5 select-none leading-tight">
                                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-surface-800 via-surface-700 to-primary dark:from-white dark:via-surface-100 dark:to-primary-light">{{ predictionResult().min }}</span>
                                            <span class="text-surface-400 dark:text-surface-500 text-lg font-medium">à</span>
                                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600 dark:from-primary-light dark:to-primary">{{ predictionResult().max }}</span>
                                            <span class="text-[11px] text-surface-500 dark:text-surface-400 font-bold ml-2">Candidats</span>
                                        </div>
                                    </div>
                                    <!-- SCORE ATTRACTIVITÉ -->
                                    <div class="flex items-center justify-between bg-surface-100/60 dark:bg-surface-800/30 rounded-2xl px-4 py-3">
                                        <span class="block text-[10px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-widest leading-relaxed">SCORE ATTRACTIVITÉ</span>
                                        <div class="flex items-center gap-2">
                                            <span class="text-2xl font-black" [ngClass]="predictionResult().score >= 80 ? 'text-emerald-500 dark:text-emerald-400' : (predictionResult().score >= 60 ? 'text-primary dark:text-primary-light' : 'text-orange-500 dark:text-orange-400')">
                                                {{ predictionResult().score }}%
                                            </span>
                                            <i class="pi pi-bolt text-sm animate-bounce" [ngClass]="predictionResult().score >= 80 ? 'text-emerald-500 dark:text-emerald-400' : (predictionResult().score >= 60 ? 'text-primary dark:text-primary-light' : 'text-orange-500 dark:text-orange-400')"></i>
                                        </div>
                                    </div>
                                </div>

                                <!-- Attractiveness Bar -->
                                <div class="w-full bg-surface-200 dark:bg-surface-950/80 rounded-full h-2 p-[2px] border border-surface-300/40 dark:border-surface-800/40">
                                    <div class="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r"
                                         [ngClass]="predictionResult().score >= 80 ? 'from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : (predictionResult().score >= 60 ? 'from-primary to-indigo-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'from-orange-500 to-amber-400 shadow-[0_0_8px_rgba(249,115,22,0.3)]')"
                                         [style.width]="predictionResult().score + '%'">
                                    </div>
                                </div>
                            </div>

                            <!-- Heuristics & Metrics Cards -->
                            <div class="grid grid-cols-2 gap-2 mb-4">
                                <div *ngIf="predictionTab() === 'existing'" class="bg-surface-50/50 dark:bg-surface-950/40 border border-surface-200 dark:border-surface-800/50 rounded-2xl p-2.5 flex items-center justify-between">
                                    <div class="flex items-center gap-1.5 text-surface-500 dark:text-surface-400 text-[9px] uppercase tracking-wider">
                                        <i class="pi pi-briefcase text-primary text-[10px]"></i>
                                        <span>Reçues</span>
                                    </div>
                                    <span class="text-xs font-black text-surface-800 dark:text-surface-100">{{ predictionResult().current }}</span>
                                </div>
                                <div [ngClass]="predictionTab() === 'existing' ? 'col-span-1' : 'col-span-2'" class="bg-surface-50/50 dark:bg-surface-950/40 border border-surface-200 dark:border-surface-800/50 rounded-2xl p-2.5 flex items-center justify-between">
                                    <div class="flex items-center gap-1.5 text-surface-500 dark:text-surface-400 text-[9px] uppercase tracking-wider">
                                        <i class="pi pi-verified text-emerald-500 dark:text-emerald-400 text-[10px]"></i>
                                        <span>Fiabilité IA</span>
                                    </div>
                                    <span class="text-xs font-black text-emerald-500 dark:text-emerald-400">{{ predictionResult().confidence }}%</span>
                                </div>
                            </div>

                            <!-- Skills Impacts List with Progress Indicators -->
                            <div class="mb-4" *ngIf="predictionResult().impacts.length > 0">
                                <div class="flex items-center gap-1.5 mb-2">
                                    <i class="pi pi-chart-bar text-surface-400 dark:text-surface-400 text-[10px]"></i>
                                    <span class="text-[9px] font-black text-surface-400 dark:text-surface-400 uppercase tracking-widest">Impact par Compétence</span>
                                </div>
                                <div class="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                                    <div *ngFor="let imp of predictionResult().impacts" class="bg-surface-50/30 dark:bg-surface-950/30 border border-surface-200 dark:border-surface-800/40 rounded-2xl p-2.5 flex flex-col gap-1.5">
                                        <div class="flex justify-between items-center">
                                            <span class="font-bold text-surface-700 dark:text-surface-200 text-[11px] flex items-center gap-1.5">
                                                <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                                {{ imp.name }}
                                            </span>
                                            <span class="text-emerald-500 dark:text-emerald-400 font-extrabold text-[10px]">+{{ imp.impact }}%</span>
                                        </div>
                                        <!-- Miniature progress bar showing impact strength -->
                                        <div class="w-full bg-surface-200 dark:bg-surface-950 rounded-full h-1">
                                            <div class="h-full bg-primary rounded-full" [style.width]="(imp.impact / 35 * 100) + '%'"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Recommendation (Futuristic Glass card) -->
                            <div class="p-3.5 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 border border-primary/20 rounded-2xl relative overflow-hidden">
                                <div class="absolute -right-8 -bottom-8 w-16 h-16 bg-primary/10 rounded-full blur-[20px] pointer-events-none"></div>
                                <div class="flex items-start gap-2.5">
                                    <div class="bg-primary/10 dark:bg-primary/25 border border-primary/20 dark:border-primary/30 p-1.5 rounded-xl text-primary shrink-0 flex items-center justify-center">
                                        <i class="pi pi-sparkles text-[10px] animate-spin" style="animation-duration: 4s;"></i>
                                    </div>
                                    <div class="flex-1">
                                        <span class="block text-[9px] font-black text-primary dark:text-primary-light uppercase tracking-wider mb-0.5">Optimisation & Conseil IA</span>
                                        <p class="text-[10px] text-surface-600 dark:text-surface-200 font-medium leading-relaxed font-sans">{{ predictionResult().rec }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class RHDashboard implements OnInit {
    private internshipService = inject(InternshipService);
    private candidatureService = inject(CandidatureService);
    private backendPredictionService = inject(BackendPredictionService);

    backendPrediction = signal<number | null>(null);
    backendStatus = signal<string>('UNKNOWN');
    isLoadingPrediction = signal<boolean>(false);

    // All candidatures from DB (via /candidatures/all)
    allCandidatures = computed(() => this.candidatureService.getCandidaturesSignal()());

    // Map CandidatureResponseDto to InternshipApplication format with real offer titles
    apps = computed(() => {
        const candidatures = this.allCandidatures();
        const offers = this.allOffers();
        return candidatures.map(c => {
            const offer = offers.find(o => o.id === c.offreStageId?.toString());
            return {
                id: c.id.toString(),
                offerTitle: offer?.title || 'Offre #' + c.offreStageId,
                offerId: c.offreStageId ? c.offreStageId.toString() : '',
                firstName: c.prenom,
                lastName: c.nom,
                cvName: c.cvName,
                letterName: c.lettreMotivationName,
                status: c.etat as any,
                date: c.dateCreation ? new Date(c.dateCreation) : new Date(),
                iaScore: c.scoreAI,
                iaApproved: c.approvedByAI,
                raisonRefus: c.raisonRefus
            } as InternshipApplication;
        });
    });

    offerCount = computed(() => this.allOffers().length);
    applicationCount = computed(() => this.apps().length);
    pendingCount = computed(() => this.apps().filter(a => a.status === 'EN_ATTENTE').length);
    recentApplications = computed(() => {
        // Sort by date descending to show most recent first
        const sorted = [...this.apps()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sorted.slice(0, 5);
    });
    acceptanceRate = computed(() => {
        const total = this.apps().length;
        if (total === 0) return 0;
        const accepted = this.apps().filter(a => a.status === 'ACCEPTEE').length;
        return Math.round((accepted / total) * 100);
    });

    // Selected offer tracking
    selectedOfferId = signal<string>('');

    // Tabs control: existing offers vs new simulated offer
    predictionTab = signal<'existing' | 'new'>('existing');

    // Simulation parameters
    selectedSimTechs = signal<string[]>(['angular', 'spring']);
    selectedSimDuration = signal<number>(6);
    selectedSimModality = signal<string>('hybride');

    techOptions = [
        { label: 'Angular', value: 'angular' },
        { label: 'React', value: 'react' },
        { label: 'Spring Boot', value: 'spring' },
        { label: 'Python / IA', value: 'python' },
        { label: 'DevOps / Cloud', value: 'devops' },
        { label: 'Figma (Design)', value: 'figma' },
        { label: 'Node.js', value: 'node' }
    ];

    // Reactively load all offers from the service
    allOffers = computed(() => {
        return this.internshipService.getOffers()();
    });

    selectedOffer = computed(() => {
        const id = this.selectedOfferId();
        return this.allOffers().find(o => o.id === id) || null;
    });

    constructor() {
        effect(() => {
            const offers = this.allOffers();
            if (offers.length > 0) {
                const currentId = this.selectedOfferId();
                const exists = offers.some(o => o.id === currentId);
                if (!currentId || !exists) {
                    this.selectedOfferId.set(offers[0].id);
                }
            } else {
                this.selectedOfferId.set('');
            }
        });

        effect(() => {
            const tab = this.predictionTab();
            let competences = '';

            if (tab === 'existing') {
                const offer = this.selectedOffer();
                if (offer) {
                    const parts: string[] = [];
                    if (offer.competencesRequises) parts.push(offer.competencesRequises);
                    if (offer.techs && offer.techs.length > 0) parts.push(offer.techs.join(', '));
                    if (offer.title) parts.push(offer.title);
                    competences = parts.join(', ');
                }
            } else {
                competences = this.selectedSimTechs().join(', ');
            }

            if (competences.trim()) {
                this.isLoadingPrediction.set(true);
                this.backendPredictionService.predict(competences).then(res => {
                    this.backendPrediction.set(res.prediction);
                    this.backendStatus.set(res.status || 'ONLINE');
                    this.isLoadingPrediction.set(false);
                }).catch(() => {
                    this.backendPrediction.set(null);
                    this.backendStatus.set('OFFLINE');
                    this.isLoadingPrediction.set(false);
                });
            } else {
                this.backendPrediction.set(null);
                this.backendStatus.set('UNKNOWN');
            }
        });
    }

    chartData = computed(() => {
        const apps = this.apps();
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const labels: string[] = [];
        const counts: number[] = [];
        const monthIndices: { month: number; year: number }[] = [];
        
        for (let i = 5; i >= 0; i--) {
            const m = (currentMonth - i + 12) % 12;
            const y = currentMonth - i < 0 ? currentYear - 1 : currentYear;
            labels.push(months[m]);
            counts.push(0);
            monthIndices.push({ month: m, year: y });
        }

        // Count real candidatures per month/year
        apps.forEach(app => {
            const appDate = new Date(app.date);
            const appMonth = appDate.getMonth();
            const appYear = appDate.getFullYear();
            const idx = monthIndices.findIndex(mi => mi.month === appMonth && mi.year === appYear);
            if (idx !== -1) {
                counts[idx]++;
            }
        });

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Candidatures',
                    data: counts,
                    fill: true,
                    borderColor: '#3b82f6',
                    tension: 0.4,
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    borderWidth: 3,
                    pointBackgroundColor: '#3b82f6',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#3b82f6',
                    pointHoverBorderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        };
    });

    chartOptions = computed(() => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dee2e6';

        return {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    padding: 12,
                    cornerRadius: 12,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    bodyFont: {
                        weight: 'bold'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            family: 'Inter, system-ui, sans-serif',
                            size: 11,
                            weight: '500'
                        }
                    },
                    grid: {
                        color: 'transparent',
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            family: 'Inter, system-ui, sans-serif',
                            size: 11
                        }
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                        borderDash: [5, 5]
                    }
                }
            }
        };
    });

    predictionResult = computed(() => {
        const tab = this.predictionTab();
        const apps = this.apps();
        const backendVal = this.backendPrediction();

        if (tab === 'new') {
            const techs = this.selectedSimTechs();
            const duration = this.selectedSimDuration();
            const modality = this.selectedSimModality();

            let baseMin = 10;
            let baseMax = 20;
            let confidence = 90;
            let skillBonus = 0;
            const skillImpacts: { name: string; impact: number }[] = [];

            techs.forEach(tech => {
                let impact = 10;
                let displayName = tech;
                if (tech === 'angular') { impact = 25; displayName = 'Angular'; }
                else if (tech === 'react') { impact = 22; displayName = 'React'; }
                else if (tech === 'spring') { impact = 20; displayName = 'Spring Boot'; }
                else if (tech === 'python') { impact = 35; displayName = 'Python / IA'; }
                else if (tech === 'devops') { impact = 18; displayName = 'DevOps / Cloud'; }
                else if (tech === 'figma') { impact = 15; displayName = 'Figma (Design)'; }
                else if (tech === 'node') { impact = 16; displayName = 'Node.js'; }
                
                skillBonus += impact;
                skillImpacts.push({ name: displayName, impact });
            });

            // Calculate base prediction
            let predictedMin = Math.round(baseMin * (1 + skillBonus / 100));
            let predictedMax = Math.round(baseMax * (1 + skillBonus / 100));

            if (backendVal !== null && backendVal > 0) {
                predictedMin = Math.max(1, Math.round(backendVal * 0.85));
                predictedMax = Math.round(backendVal * 1.15) + 2;
                confidence = 95;
            } else {
                // Adjust based on duration
                if (duration >= 6) {
                    predictedMin = Math.round(predictedMin * 1.3);
                    predictedMax = Math.round(predictedMax * 1.3);
                } else if (duration <= 3) {
                    predictedMin = Math.round(predictedMin * 0.85);
                    predictedMax = Math.round(predictedMax * 0.9);
                }

                // Adjust based on modality
                if (modality === 'tele') {
                    predictedMin = Math.round(predictedMin * 1.25);
                    predictedMax = Math.round(predictedMax * 1.25);
                    confidence += 5;
                } else if (modality === 'hybride') {
                    predictedMin = Math.round(predictedMin * 1.15);
                    predictedMax = Math.round(predictedMax * 1.15);
                    confidence += 2;
                } else if (modality === 'presentiel') {
                    predictedMin = Math.round(predictedMin * 0.75);
                    predictedMax = Math.round(predictedMax * 0.75);
                    confidence -= 5;
                }
            }

            const score = Math.min(100, Math.round(40 + (skillBonus * 0.8)));

            let rec = '';
            if (techs.length === 0) {
                rec = "Sélectionnez au moins une compétence pour lancer la simulation.";
            } else if (score >= 85) {
                rec = "Excellent choix technologique ! Le modèle backend prédit un fort intérêt des candidats.";
            } else {
                rec = "Bonne configuration de base. Ajoutez du 'Télétravail' ou du 'Hybride' pour augmenter la portée de l'offre.";
            }

            return {
                current: 0,
                predictedValue: backendVal !== null ? backendVal : null,
                min: predictedMin,
                max: predictedMax,
                score: score,
                skills: techs,
                confidence: confidence,
                rec: rec,
                impacts: skillImpacts
            };
        } else {
            // Existing offer logic
            const offer = this.selectedOffer();
            if (!offer) {
                return {
                    current: 0,
                    predictedValue: null,
                    min: 0,
                    max: 0,
                    score: 0,
                    skills: [],
                    confidence: 0,
                    rec: 'Aucune offre sélectionnée.',
                    impacts: []
                };
            }

            // 1. Calculate actual applications for this specific offer
            const actualCount = apps.filter(a => a.offerTitle === offer.title || a.offerId === offer.id).length;

            // 2. Analyze skills (techs)
            const skills = offer.techs || [];
            let skillBonus = 0;
            const skillImpacts: { name: string; impact: number }[] = [];

            skills.forEach(skill => {
                const s = skill.toLowerCase();
                let impact = 5; // default bonus
                if (s.includes('angular') || s.includes('react') || s.includes('vue')) {
                    impact = 25;
                } else if (s.includes('python') || s.includes('ia') || s.includes('ml') || s.includes('data')) {
                    impact = 35;
                } else if (s.includes('spring') || s.includes('java') || s.includes('.net') || s.includes('c#')) {
                    impact = 20;
                } else if (s.includes('devops') || s.includes('docker') || s.includes('kubernetes') || s.includes('cloud')) {
                    impact = 18;
                } else if (s.includes('node') || s.includes('express') || s.includes('nest')) {
                    impact = 15;
                }
                skillBonus += impact;
                skillImpacts.push({ name: skill, impact });
            });

            // 3. Base prediction based on actual count, skills and duration
            let predictedMin = actualCount + 5;
            let predictedMax = actualCount + 15;
            let confidence = 85;

            if (backendVal !== null && backendVal > 0) {
                predictedMin = Math.max(actualCount, Math.round(backendVal * 0.85));
                predictedMax = Math.max(predictedMin + 2, Math.round(backendVal * 1.15) + 2);
                confidence = 95;
            } else {
                if (skills.length === 0) {
                    predictedMin = Math.max(1, actualCount);
                    predictedMax = actualCount + 5;
                } else {
                    const multiplier = 1 + (skillBonus / 100);
                    predictedMin = Math.round((actualCount + 4) * multiplier);
                    predictedMax = Math.round((actualCount + 10) * multiplier);
                }

                // Adjust based on duration
                const duration = offer.dureeStage || 4;
                if (duration >= 6) {
                    predictedMin = Math.round(predictedMin * 1.2);
                    predictedMax = Math.round(predictedMax * 1.2);
                } else if (duration <= 3) {
                    predictedMin = Math.round(predictedMin * 0.9);
                    predictedMax = Math.round(predictedMax * 0.9);
                }

                // Adjust based on modality / location
                const loc = (offer.location || '').toLowerCase();
                if (loc.includes('tele') || loc.includes('distance')) {
                    predictedMin = Math.round(predictedMin * 1.3);
                    predictedMax = Math.round(predictedMax * 1.3);
                    confidence += 5;
                } else if (loc.includes('hybrid')) {
                    predictedMin = Math.round(predictedMin * 1.15);
                    predictedMax = Math.round(predictedMax * 1.15);
                    confidence += 2;
                }
            }

            // Ensure bounds
            if (predictedMin < actualCount) predictedMin = actualCount;
            if (predictedMax < predictedMin) predictedMax = predictedMin + 8;

            const score = Math.min(100, Math.round(50 + (skillBonus / 2)));

            // Generate tailored recommendation
            let rec = '';
            if (skills.length === 0) {
                rec = "Ajoutez des technologies clés (ex: Angular, Spring Boot) pour augmenter l'attractivité de l'offre.";
            } else if (score >= 85) {
                rec = "Excellente combinaison de compétences ! L'offre est extrêmement attractive selon la prédiction du modèle backend.";
            } else if (skills.some(s => s.toLowerCase().includes('angular') && !skills.some(x => x.toLowerCase().includes('typescript')))) {
                rec = "Conseil : Ajoutez la compétence 'TypeScript' pour préciser le profil recherché.";
            } else {
                rec = "L'offre est bien positionnée. Pour capter 20% de profils supplémentaires, envisagez une formule de stage hybride.";
            }

            return {
                current: actualCount,
                predictedValue: backendVal !== null ? backendVal : null,
                min: predictedMin,
                max: predictedMax,
                score: score,
                skills: skills,
                confidence: confidence,
                rec: rec,
                impacts: skillImpacts
            };
        }
    });

    async ngOnInit() {
        this.loadData();
    }

    async loadData() {
        try {
            await Promise.all([
                this.internshipService.getOffersWithRecommendations(),
                this.candidatureService.fetchAll()
            ]);
        } catch (err) {
            console.error('Error loading RH dashboard data', err);
        }
    }

    toggleSimTech(tech: string) {
        const current = this.selectedSimTechs();
        if (current.includes(tech)) {
            this.selectedSimTechs.set(current.filter(t => t !== tech));
        } else {
            this.selectedSimTechs.set([...current, tech]);
        }
    }

    getSelectValue(event: Event): string {
        return (event.target as HTMLSelectElement).value;
    }

    getScoreClass(score: number | undefined): string {
        if (!score) return 'bg-surface-100 text-surface-400';
        if (score >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
        if (score >= 60) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    }

    getStatusClass(status: string | undefined): string {
        switch (status) {
            case 'EN_ATTENTE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'ACCEPTEE': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
            case 'REFUSEE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300';
        }
    }
}
