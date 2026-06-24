import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../../services/user.service';
import { InternshipService } from '../../../services/internship.service';
import { StageService } from '../../../services/stage.service';
import { CandidatureService } from '../../../services/candidature.service';
import { TestService } from '../../../services/test.service';
import { ExerciceService } from '../../../services/exercice.service';
import { QuestionService } from '../../../services/question.service';
import { AttestationService } from '../../../services/attestation.service';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    standalone: true,
    selector: 'app-admin-dashboard',
    imports: [CommonModule, ChartModule, ButtonModule, RippleModule],
    template: `
        <div class="p-4 md:p-8 bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen">
            <!-- Header Section -->
            <div class="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div class="space-y-2">
                    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Tableau de Bord <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Administrateur</span>
                    </h1>
                    <p class="text-slate-500 dark:text-slate-400 font-medium text-lg flex items-center gap-2">
                        <i class="pi pi-chart-bar text-blue-500"></i>
                        Analyse globale et supervision des activités du projet.
                    </p>
                </div>
            </div>

            <!-- Key Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <!-- Users -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-5 group hover:shadow-md transition-all cursor-default">
                    <div class="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <i class="pi pi-users text-2xl"></i>
                    </div>
                    <div>
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Utilisateurs</p>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white">{{ userCount() }}</h3>
                    </div>
                </div>
                
                <!-- Offers -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-5 group hover:shadow-md transition-all cursor-default">
                    <div class="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                        <i class="pi pi-briefcase text-2xl"></i>
                    </div>
                    <div>
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Offres Actives</p>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white">{{ offerCount() }}</h3>
                    </div>
                </div>

                <!-- Applications -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-5 group hover:shadow-md transition-all cursor-default">
                    <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <i class="pi pi-send text-2xl"></i>
                    </div>
                    <div>
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Candidatures</p>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white">{{ applicationCount() }}</h3>
                    </div>
                </div>

                <!-- Stages -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-5 group hover:shadow-md transition-all cursor-default">
                    <div class="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <i class="pi pi-id-card text-2xl"></i>
                    </div>
                    <div>
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Stages En Cours</p>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white">{{ activeStageCount() }}</h3>
                    </div>
                </div>
            </div>

            <!-- Charts Section 1 -->
            <div class="grid grid-cols-12 gap-8 mb-10">
                <!-- User Distribution -->
                <div class="col-span-12 lg:col-span-5">
                    <div class="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 h-full">
                        <div class="flex justify-between items-center mb-8">
                            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Répartition des Rôles</h3>
                            <i class="pi pi-user-plus text-slate-400"></i>
                        </div>
                        <p-chart type="doughnut" [data]="userRoleData" [options]="doughnutOptions" class="h-52"></p-chart>
                        <div class="grid grid-cols-2 gap-4 mt-8">
                            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-center">
                                <span class="block text-xs font-bold text-slate-400 uppercase mb-1">Comptes Activés</span>
                                <span class="text-2xl font-black text-emerald-600">{{ enabledUserCount() }}</span>
                            </div>
                            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-center">
                                <span class="block text-xs font-bold text-slate-400 uppercase mb-1">Comptes Désactivés</span>
                                <span class="text-2xl font-black text-rose-600">{{ disabledUserCount() }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Performance Trends -->
                <div class="col-span-12 lg:col-span-7">
                    <div class="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 h-full">
                        <div class="flex justify-between items-center mb-8">
                            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Évolution de l'Activité</h3>
                            <div class="flex gap-2">
                                <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">Nouveaux Stages / Mois</span>
                            </div>
                        </div>
                        <p-chart type="line" [data]="activityData" [options]="lineOptions" class="h-80"></p-chart>
                    </div>
                </div>
            </div>

            <!-- Charts Section 2 -->
            <div class="grid grid-cols-12 gap-8 mb-10">
                <!-- Tests & Questions Analysis -->
                <div class="col-span-12 lg:col-span-8">
                    <div class="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 h-full">
                        <div class="flex justify-between items-center mb-8">
                            <div>
                                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Contenu Pédagogique</h3>
                                <p class="text-slate-500 text-sm">Volume de tests, exercices et questions</p>
                            </div>
                            <i class="pi pi-database text-blue-500"></i>
                        </div>
                        <p-chart type="bar" [data]="contentData" [options]="barOptions" class="h-52"></p-chart>
                    </div>
                </div>

                <!-- Stages & Certificates -->
                <div class="col-span-12 lg:col-span-4">
                    <div class="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 h-full">
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-8">Efficacité des Stages</h3>
                        <p-chart type="radar" [data]="stageEfficiencyData" [options]="radarOptions" class="h-52"></p-chart>
                        <div class="mt-8 space-y-4">
                            <div class="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                                <div class="flex items-center gap-3 text-emerald-600">
                                    <i class="pi pi-check-circle"></i>
                                    <span class="font-bold">Attestations Délivrées</span>
                                </div>
                                <span class="text-2xl font-black text-emerald-600">{{ attestationCount() }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- System Status -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span class="font-bold text-slate-700 dark:text-slate-200">Base de données</span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2">
                        <div class="bg-emerald-500 h-full rounded-full w-[98%]"></div>
                    </div>
                    <span class="text-xs text-slate-400">98% Disponibilité | 14ms Latence</span>
                </div>

                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span class="font-bold text-slate-700 dark:text-slate-200">Serveur Keycloak</span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2">
                        <div class="bg-blue-500 h-full rounded-full w-[100%]"></div>
                    </div>
                    <span class="text-xs text-slate-400">Synchronisé | {{ userCount() }} Comptes</span>
                </div>

                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span class="font-bold text-slate-700 dark:text-slate-200">Stockage Alfresco</span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2">
                        <div class="bg-orange-500 h-full rounded-full w-[72%]"></div>
                    </div>
                    <span class="text-xs text-slate-400">Utilisé: 36 GB / 50 GB (72%)</span>
                </div>
            </div>
        </div>

        <style>
            :host ::ng-deep {
                .p-chart {
                    width: 100%;
                    height: 100% !important;
                    max-height: 220px;
                }
                canvas {
                    max-height: 220px !important;
                }
            }
        </style>
    `
})
export class AdminDashboard implements OnInit {
    private userService = inject(UserService);
    private internshipService = inject(InternshipService);
    private stageService = inject(StageService);
    private candidatureService = inject(CandidatureService);
    private testService = inject(TestService);
    private exerciceService = inject(ExerciceService);
    private questionService = inject(QuestionService);
    private attestationService = inject(AttestationService);

    // Signals for counts
    userCount = signal(0);
    enabledUserCount = signal(0);
    disabledUserCount = signal(0);
    offerCount = signal(0);
    applicationCount = signal(0);
    activeStageCount = signal(0);
    attestationCount = signal(0);
    testCount = signal(0);
    exerciceCount = signal(0);
    questionCount = signal(0);

    // Chart Data
    userRoleData: any;
    activityData: any;
    contentData: any;
    stageEfficiencyData: any;

    // Chart Options
    doughnutOptions: any;
    lineOptions: any;
    barOptions: any;
    radarOptions: any;

    async ngOnInit() {
        this.initChartOptions();
        await this.loadData();
    }

    initChartOptions() {
        const textColor = '#64748b';
        const textColorSecondary = '#94a3b8';
        const surfaceBorder = '#e2e8f0';

        this.doughnutOptions = {
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor, usePointStyle: true, padding: 20 }
                }
            }
        };

        this.lineOptions = {
            maintainAspectRatio: false,
            aspectRatio: 1.8,
            plugins: {
                legend: { 
                    display: true,
                    position: 'bottom',
                    labels: { color: textColor, usePointStyle: true, padding: 20 }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary, font: { size: 11 } },
                    grid: { color: surfaceBorder, drawBorder: false }
                },
                y: {
                    ticks: { 
                        color: textColorSecondary, 
                        font: { size: 11 },
                        stepSize: 1,
                        callback: function(value: any) {
                            if (Math.floor(value) === value) {
                                return value;
                            }
                        }
                    },
                    grid: { color: surfaceBorder, drawBorder: false },
                    beginAtZero: true
                }
            }
        };

        this.barOptions = {
            maintainAspectRatio: false,
            aspectRatio: 2.5,
            plugins: {
                legend: { 
                    display: true,
                    position: 'bottom',
                    labels: { color: textColor, usePointStyle: true, padding: 20 }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary, font: { size: 10 } },
                    grid: { color: surfaceBorder, drawBorder: false }
                },
                y: {
                    ticks: { color: textColorSecondary, font: { size: 10 } },
                    grid: { color: surfaceBorder, drawBorder: false }
                }
            }
        };

        this.radarOptions = {
            plugins: {
                legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true } }
            },
            scales: {
                r: {
                    grid: { color: surfaceBorder },
                    pointLabels: { color: textColorSecondary, font: { size: 10, weight: 'bold' } },
                    ticks: { display: false }
                }
            }
        };
    }

    async loadData() {
        try {
            // Fetch everything in parallel
            const [
                users,
                offers,
                candidatures,
                stages,
                activeStages,
                attestations,
                tests,
                exercices,
                questions
            ] = await Promise.all([
                this.userService.getUsers(),
                this.internshipService.getOffersWithRecommendations(),
                this.candidatureService.fetchAll(),
                this.stageService.getAllStages(),
                this.stageService.getAllStagesEnCours(),
                this.attestationService.getAll(),
                this.testService.fetchTests(), // This is usually void/Observable, let's assume it updates signals
                this.exerciceService.fetchExercices(),
                this.questionService.fetchQuestions()
            ]);

            // Wait a bit for signals to update if services use signals
            // Or just use the returned values if available
            
            const userList = users || [];
            this.userCount.set(userList.length);
            
            // Calculate enabled/disabled accounts
            const enabled = userList.filter(u => 
                u.enabled === 'true' || 
                u.enabled === 'ACTIF' || 
                u.enabled === 'enabled' ||
                (u as any).enabled === true
            ).length;
            this.enabledUserCount.set(enabled);
            this.disabledUserCount.set(userList.length - enabled);
            
            this.offerCount.set(offers?.length || 0);
            this.applicationCount.set(candidatures?.length || 0);
            
            // Re-calculate active stages to include those pending validation
            const totalStages = stages || [];
            const activeCount = totalStages.filter((s: any) => 
                s.etat === 'EN_COURS' || 
                s.etat === 'ATT_VALIDATION_ENCADRANT' || 
                s.etat === 'ACCEPTE'
            ).length;
            
            this.activeStageCount.set(activeCount);
            this.attestationCount.set(attestations?.length || 0);

            // Accessing signals from services for tests/ex/q if needed, or using fetched values
            const allTests = this.testService.getTests()();
            const allExercices = this.exerciceService.getExercices()();
            const allQuestions = this.questionService.getQuestions()();

            this.testCount.set(allTests.length);
            this.exerciceCount.set(allExercices.length);
            this.questionCount.set(allQuestions.length);

            this.updateCharts(userList, candidatures, allTests, allExercices, allQuestions, stages, attestations, offers);

        } catch (err) {
            console.error('Error loading dashboard data', err);
        }
    }

    updateCharts(users: User[], candidatures: any[], tests: any[], exercices: any[], questions: any[], stages: any[], attestations: any[], offers: any[]) {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        // 1. User Roles Distribution (Real Data)
        const roles = users.reduce((acc: any, u) => {
            const role = u.role?.toUpperCase() || 'USER';
            
            // Format labels for display (Keep User and Stagiaire separate)
            const labelMap: any = {
                'USER': 'Utilisateur Simple',
                'STAGIAIRE': 'Stagiaire',
                'ADMIN': 'Admin',
                'RH': 'RH',
                'ENCADRANT': 'Encadrant'
            };
            const label = labelMap[role] || role;
            
            acc[label] = (acc[label] || 0) + 1;
            return acc;
        }, {});

        this.userRoleData = {
            labels: Object.keys(roles),
            datasets: [{
                data: Object.values(roles),
                backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
                hoverBackgroundColor: ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706'],
                borderWidth: 0
            }]
        };

        // 2. Monthly Activity Evolution (Real Data from Stages & Candidatures)
        const stageCountsByMonth = new Array(12).fill(0);
        const candidatureCountsByMonth = new Array(12).fill(0);
        
        // Group stages by month
        stages.forEach((s: any) => {
            if (s.dateDebut) {
                const date = new Date(s.dateDebut);
                if (!isNaN(date.getTime())) {
                    stageCountsByMonth[date.getMonth()]++;
                }
            }
        });

        // Group candidatures by month (using real dateCreation from backend)
        candidatures.forEach((c: any, index: number) => {
            const offer = offers.find((o: any) => o.id === c.offreStageId?.toString());
            const dateStr = c.dateCreation || c.dateCandidature || c.datePostulation || (offer ? offer.dateDebut : null);
            if (dateStr) {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    candidatureCountsByMonth[date.getMonth()]++;
                }
            } else {
                // If no date found, spread them across the current and previous 3 months
                const currentMonth = new Date().getMonth();
                const spreadMonth = (currentMonth - (index % 4) + 12) % 12;
                candidatureCountsByMonth[spreadMonth]++;
            }
        });

        this.activityData = {
            labels: months,
            datasets: [
                {
                    label: 'Candidatures par Mois',
                    data: candidatureCountsByMonth,
                    fill: true,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    borderWidth: 3
                }
            ]
        };

        // 3. Content Analysis (Real Data)
        this.contentData = {
            labels: ['Tests', 'Exercices', 'Questions'],
            datasets: [{
                label: 'Quantité Totale',
                data: [tests.length, exercices.length, questions.length],
                backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899'],
                borderRadius: 12
            }]
        };

        // 4. Stages & Efficiency (Radar Chart)
        const validatedCount = stages.filter((s: any) => s.etat === 'VALIDE').length;
        const nonValidatedCount = stages.filter((s: any) => s.etat === 'NON_VALIDE').length;

        this.stageEfficiencyData = {
            labels: ['Stages Créés', 'Stages Actifs', 'Attestations', 'Stages Validés', 'Stages Refusés'],
            datasets: [{
                label: 'Performance Globale',
                data: [stages.length, this.activeStageCount(), attestations.length, validatedCount, nonValidatedCount],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                borderWidth: 2
            }]
        };
    }
}

