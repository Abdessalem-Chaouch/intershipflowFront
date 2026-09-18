import { Component, HostListener, OnInit, OnDestroy, inject, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { UserService } from '@/app/services/user.service';

export interface ChatMessage {
    id: string;
    sender: 'bot' | 'user';
    text: string;
    timestamp: Date;
    options?: { label: string; action: string; icon?: string }[];
}

export interface TourStep {
    targetSelector: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    actionText?: string;
    onBeforeStep?: () => void;
}

@Component({
    selector: 'guide-chatbot',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, TooltipModule],
    template: `
        <!-- Floating Chatbot Launcher Button -->
        <div class="fixed bottom-6 right-6 z-[9998] flex flex-col items-end gap-2">
            <!-- Unread / Welcome Hint Bubble (Visible when chat closed) -->
            <div *ngIf="!isOpen && showHintBubble"
                 class="bg-white dark:bg-[#06203d] text-slate-800 dark:text-blue-100 px-4 py-2.5 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-900/40 text-sm font-semibold flex items-center gap-3 animate-bounce cursor-pointer"
                 (click)="toggleChat()">
                <span class="flex h-2.5 w-2.5 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                </span>
                <span>Besoin d'aide ou de guidage ? 💬</span>
                <button (click)="$event.stopPropagation(); showHintBubble = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs ml-1">✕</button>
            </div>

            <!-- Launcher Icon Button -->
            <button (click)="toggleChat()"
                    style="cursor: pointer !important;"
                    class="cursor-pointer group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#063970] to-blue-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20 focus:outline-none">
                <i [class]="isOpen ? 'pi pi-times text-2xl transition-transform duration-300 rotate-90' : 'pi pi-comments text-2xl group-hover:rotate-12 transition-transform duration-300'"></i>
                <span class="absolute -top-1 -right-1 flex h-4 w-4">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                </span>
            </button>
        </div>

        <!-- Chatbot Window Modal -->
        <div *ngIf="isOpen"
             class="fixed bottom-24 right-6 w-[92vw] sm:w-[420px] max-h-[620px] h-[78vh] z-[9998] bg-white dark:bg-[#03172c] rounded-3xl shadow-2xl border border-slate-200 dark:border-blue-900/50 flex flex-col overflow-hidden transition-all duration-300 backdrop-blur-md">
            
            <!-- Header -->
            <div class="bg-gradient-to-r from-[#063970] via-blue-900 to-[#021427] p-4 px-5 text-white flex items-center justify-between shadow-md">
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white font-black text-xl shadow-inner">
                            🤖
                        </div>
                        <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#063970] rounded-full"></span>
                    </div>
                    <div>
                        <h4 style="color: #ffffff !important;" class="font-black text-base tracking-wide !text-white m-0 flex items-center gap-1.5">
                            Guide Virtuel SIGA
                        </h4>
                        <p style="color: #bfdbfe !important;" class="text-xs !text-blue-200 m-0 font-medium">Assistant interactif 24/7</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-1">
                    <button (click)="resetChat()" title="Recommencer" style="color: #bfdbfe !important;" class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center !text-blue-200 hover:!text-white transition-colors">
                        <i class="pi pi-refresh text-sm"></i>
                    </button>
                    <button (click)="isOpen = false" title="Fermer" style="color: #bfdbfe !important;" class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center !text-blue-200 hover:!text-white transition-colors">
                        <i class="pi pi-times text-sm"></i>
                    </button>
                </div>
            </div>

            <!-- Messages Area -->
            <div #messagesContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-[#020e1a]/60">
                <div *ngFor="let msg of messages" class="flex flex-col space-y-2">
                    
                    <!-- Bot / User Message Bubble -->
                    <div [class]="msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start items-start gap-2.5'">
                        <div *ngIf="msg.sender === 'bot'" class="w-7 h-7 rounded-full bg-[#063970] text-white flex items-center justify-center text-xs shrink-0 mt-1 shadow-sm">
                            🤖
                        </div>
                        <div [class]="msg.sender === 'user' 
                                ? 'bg-gradient-to-r from-[#063970] to-blue-700 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[82%] shadow-md text-sm font-medium leading-relaxed'
                                : 'bg-white dark:bg-[#06203d] text-slate-800 dark:text-blue-50 border border-slate-200/80 dark:border-blue-900/50 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] shadow-sm text-sm font-normal leading-relaxed'">
                            <p class="m-0 whitespace-pre-line">{{ msg.text }}</p>
                        </div>
                    </div>

                    <!-- Action Option Buttons attached to message -->
                    <div *ngIf="msg.options && msg.options.length > 0" class="flex flex-col gap-2 pl-9 pr-2 pt-1">
                        <button *ngFor="let opt of msg.options"
                                (click)="handleOptionClick(opt)"
                                class="flex items-center justify-between w-full text-left px-4 py-2.5 bg-white dark:bg-[#07284d] hover:bg-blue-50 dark:hover:bg-blue-900/40 text-[#063970] dark:text-blue-200 font-semibold text-xs border border-blue-200 dark:border-blue-800/60 rounded-xl transition-all shadow-xs hover:shadow-md hover:border-blue-400 group">
                            <span class="flex items-center gap-2">
                                <span *ngIf="opt.icon">{{ opt.icon }}</span>
                                <span>{{ opt.label }}</span>
                            </span>
                            <i class="pi pi-chevron-right text-[10px] text-blue-400 group-hover:translate-x-1 transition-transform"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Footer Input -->
            <div class="p-3 bg-white dark:bg-[#03172c] border-t border-slate-100 dark:border-blue-900/40 flex items-center gap-2">
                <input type="text"
                       [(ngModel)]="userInput"
                       (keyup.enter)="sendMessage()"
                       placeholder="Posez une question ou demandez de l'aide..."
                       class="flex-1 bg-slate-100 dark:bg-[#072445] text-slate-800 dark:text-blue-100 placeholder-slate-400 dark:placeholder-blue-300/40 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent dark:border-blue-800/40 transition-all" />
                <button (click)="sendMessage()"
                        [disabled]="!userInput.trim()"
                        class="w-9 h-9 rounded-xl bg-[#063970] hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shrink-0">
                    <i class="pi pi-send text-xs"></i>
                </button>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- DARK OVERLAY & INTERACTIVE STEP-BY-STEP GUIDED TOUR SYSTEM -->
        <!-- ========================================================================= -->
        <ng-container *ngIf="isGuideActive && currentStep">
            
            <!-- Pure Box-Shadow Spotlight Ring (Highlights target element cleanly without masking the page) -->
            <div *ngIf="spotlightRect"
                 class="fixed z-[9990] pointer-events-none transition-all duration-400 ease-out border-2 border-blue-400 rounded-2xl shadow-[0_0_0_9999px_rgba(2,11,20,0.78),0_0_30px_rgba(59,130,246,0.6)] animate-pulse"
                 [style.top.px]="spotlightRect.top"
                 [style.left.px]="spotlightRect.left"
                 [style.width.px]="spotlightRect.width"
                 [style.height.px]="spotlightRect.height">
            </div>

            <!-- Tour Step Floating Card (Popover) -->
            <div #tourCard
                 class="fixed z-[99999] bg-white/95 dark:bg-[#06203d]/95 backdrop-blur-md border-2 border-blue-500 dark:border-blue-400 rounded-3xl shadow-2xl p-5 sm:p-6 max-w-md w-[92vw] sm:w-[460px] max-h-[calc(100vh-140px)] overflow-y-auto transition-all duration-300 animate-fade-in text-slate-800 dark:text-blue-50"
                 [style.top.px]="cardPosition.top"
                 [style.left.px]="cardPosition.left">
                
                <!-- Tour Header -->
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-blue-900/50 pb-3 mb-3">
                    <div class="flex items-center gap-2">
                        <span class="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[11px] font-black tracking-wider uppercase">
                            Étape {{ activeStepIndex + 1 }} / {{ activeTaskSteps.length }}
                        </span>
                        <span class="text-xs font-bold text-slate-500 dark:text-blue-300/70">
                            {{ activeTaskName }}
                        </span>
                    </div>
                    <button (click)="stopGuide()" class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors text-xs font-bold px-2 py-1 rounded-md">
                        ✕ Quitter
                    </button>
                </div>

                <!-- Tour Content -->
                <div class="mb-4">
                    <h3 class="text-base sm:text-lg font-black text-[#063970] dark:text-blue-200 mb-1.5 leading-tight flex items-center gap-2">
                        <span>📍</span> {{ currentStep.title }}
                    </h3>
                    <p class="text-xs text-slate-600 dark:text-blue-100/80 leading-relaxed m-0 font-normal">
                        {{ currentStep.description }}
                    </p>
                </div>

                <!-- Progress Bar -->
                <div class="w-full bg-slate-100 dark:bg-blue-950 rounded-full h-1.5 mb-4 overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-500 to-[#063970] h-1.5 rounded-full transition-all duration-500"
                         [style.width.%]="((activeStepIndex + 1) / activeTaskSteps.length) * 100">
                    </div>
                </div>

                <!-- Navigation Controls -->
                <div class="flex items-center justify-between gap-3 pt-1">
                    <button (click)="prevStep()"
                            [disabled]="activeStepIndex === 0"
                            class="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-blue-200 hover:bg-slate-100 dark:hover:bg-blue-900/40 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5">
                        <i class="pi pi-arrow-left text-[10px]"></i> Précédent
                    </button>

                    <button (click)="nextStep()"
                            class="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#063970] to-blue-600 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2">
                        <span>{{ activeStepIndex === activeTaskSteps.length - 1 ? 'Terminer 🎉' : 'Suivant' }}</span>
                        <i *ngIf="activeStepIndex < activeTaskSteps.length - 1" class="pi pi-arrow-right text-[10px]"></i>
                    </button>
                </div>
            </div>
        </ng-container>
    `,
    styles: [`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
            animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
    `]
})
export class GuideChatbotComponent implements OnInit, OnDestroy {
    @ViewChild('tourCard') tourCardRef?: ElementRef;

    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);
    private userService = inject(UserService);

    isOpen = false;
    showHintBubble = true;
    userInput = '';

    messages: ChatMessage[] = [];

    // Tour State
    isGuideActive = false;
    activeTaskKey = '';
    activeTaskName = '';
    activeTaskSteps: TourStep[] = [];
    activeStepIndex = 0;

    spotlightRect: { top: number; left: number; width: number; height: number } | null = null;
    cardPosition: { top: number; left: number } = { top: 105, left: 100 };

    private resizeObserver: ResizeObserver | null = null;

    ngOnInit() {
        this.initWelcomeMessage();
    }

    ngOnDestroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.showHintBubble = false;
        }
    }

    resetChat() {
        this.messages = [];
        this.initWelcomeMessage();
    }

    private initWelcomeMessage() {
        this.messages.push({
            id: 'welcome',
            sender: 'bot',
            text: 'Bonjour ! 👋 Je suis votre guide virtuel SIGA.\n\nJe peux vous accompagner pas à pas sur la plateforme avec un guide interactif ! Que souhaitez-vous faire ?',
            timestamp: new Date(),
            options: [
                { label: 'Postuler à une offre de stage', action: 'guide_apply', icon: '🎯' },
                { label: 'Consulter mes candidatures', action: 'guide_applications', icon: '📋' },
                { label: 'Contacter le support / RH', action: 'guide_support', icon: '📞' },
                { label: 'Poser une autre question', action: 'ask_question', icon: '❓' }
            ]
        });
    }

    handleOptionClick(option: { label: string; action: string }) {
        this.messages.push({
            id: Date.now().toString(),
            sender: 'user',
            text: option.label,
            timestamp: new Date()
        });

        switch (option.action) {
            case 'guide_apply': {
                const isConnected = !!this.userService.currentUser();
                this.messages.push({
                    id: Date.now().toString(),
                    sender: 'bot',
                    text: isConnected
                        ? 'Excellent choix ! 🎯 Seules les offres ouvertes (statut "OUVERT") acceptent les candidatures. Comme vous êtes connecté, suivez le guide pour explorer et postuler directement.'
                        : 'Excellent choix ! 🎯 Je vais vous guider pas à pas pour rechercher une offre ouverte (statut "OUVERT"), cliquer sur "Postuler" et vous connecter.',
                    timestamp: new Date(),
                    options: [{ label: '▶ Lancer le guide interactif', action: 'start_tour_apply', icon: '🚀' }]
                });
                break;
            }

            case 'start_tour_apply':
                this.isOpen = false;
                this.startTour('apply');
                break;

            case 'guide_applications': {
                const isConnected = !!this.userService.currentUser();
                this.messages.push({
                    id: Date.now().toString(),
                    sender: 'bot',
                    text: isConnected
                        ? 'Parfait ! 📋 Vous êtes connecté. Suivez le guide pour consulter directement vos candidatures.'
                        : 'Parfait ! 📋 Pour consulter vos candidatures :\n• 1ère étape : Se connecter\n• 2ème étape : Consulter vos candidatures',
                    timestamp: new Date(),
                    options: [{ label: '▶ Lancer le guide des candidatures', action: 'start_tour_applications', icon: '🚀' }]
                });
                break;
            }

            case 'start_tour_applications':
                this.isOpen = false;
                this.startTour('applications');
                break;

            case 'guide_support':
                this.messages.push({
                    id: Date.now().toString(),
                    sender: 'bot',
                    text: 'Très bien ! 📞 Je vais vous montrer comment joindre l\'équipe SIGA et soumettre un message direct au support.',
                    timestamp: new Date(),
                    options: [{ label: '▶ Lancer le guide support', action: 'start_tour_support', icon: '🚀' }]
                });
                break;

            case 'start_tour_support':
                this.isOpen = false;
                this.startTour('support');
                break;

            case 'ask_question':
                this.messages.push({
                    id: Date.now().toString(),
                    sender: 'bot',
                    text: 'Je suis votre assistant dédié exclusivement à la plateforme **SIGA** ! 🏢\n\nPosez-moi vos questions sur la société SIGA, les opportunités de stage (PFE/Initiation), les procédures de candidature, ou nos informations de contact.',
                    timestamp: new Date()
                });
                break;

            default:
                break;
        }
    }

    sendMessage() {
        const text = this.userInput.trim();
        if (!text) return;

        this.messages.push({
            id: Date.now().toString(),
            sender: 'user',
            text: text,
            timestamp: new Date()
        });

        this.userInput = '';
        this.processBotResponse(text);
    }

    private processBotResponse(query: string) {
        const lower = query.toLowerCase();
        let botText = '';
        let options: { label: string; action: string; icon?: string }[] | undefined = undefined;

        if (lower.includes('postuler') || lower.includes('offre') || lower.includes('stage') || lower.includes('candidat') || lower.includes('pfe')) {
            const isConnected = !!this.userService.currentUser();
            if (isConnected) {
                botText = 'Pour postuler à une offre de stage chez SIGA :\n1. Vérifiez que l\'état de l\'offre est "Ouverte" (statut OUVERT).\n2. Sélectionnez l\'offre qui vous convient.\n3. Cliquez sur "Postuler" pour valider votre candidature. (Si vous avez déjà postulé, le statut de votre dossier sera affiché).';
            } else {
                botText = 'Pour postuler à une offre de stage chez SIGA :\n1. Rendez-vous dans la section "Offres de Stage" (statut OUVERT).\n2. Choisissez l\'offre qui correspond à votre profil.\n3. Cliquez sur "Postuler" puis connectez-vous pour soumettre votre dossier.';
            }
            options = [{ label: 'Lancer le guide "Postuler"', action: 'start_tour_apply', icon: '🎯' }];
        } else if (lower.includes('candidature') || lower.includes('suivi') || lower.includes('mes offres')) {
            const isConnected = !!this.userService.currentUser();
            if (isConnected) {
                botText = 'Vous êtes connecté ! Cliquez sur "Mes candidatures" en haut de la page pour suivre le statut de vos dossiers (En attente ⏳, Acceptée ✅, Refusée ❌, Fini 🎓).';
            } else {
                botText = 'Pour consulter l\'état de vos candidatures chez SIGA (En attente, Acceptée, Refusée) :\n1. Étape 1 : Connectez-vous à votre compte.\n2. Étape 2 : Cliquez sur "Mes candidatures" dans la barre de navigation.';
            }
            options = [{ label: 'Lancer le guide "Candidatures"', action: 'start_tour_applications', icon: '📋' }];
        } else if (lower.includes('siga') || lower.includes('entreprise') || lower.includes('societe') || lower.includes('société') || lower.includes('qui etes') || lower.includes('qui vous')) {
            botText = '🏢 **À propos de SIGA** :\nSIGA (Société Internationale d\'Ingénierie et de Gestion d\'Applications) est une entreprise spécialisée dans les solutions logicielles et la transformation digitale. Nous proposons des projets de stage PFE innovants dans diverses technologies (Angular, Spring Boot, AI, Cloud, DevOps).';
            options = [
                { label: 'Voir les offres de stage', action: 'guide_apply', icon: '🎯' },
                { label: 'Contacter le support', action: 'guide_support', icon: '📞' }
            ];
        } else if (lower.includes('contact') || lower.includes('support') || lower.includes('aide') || lower.includes('rh') || lower.includes('telephone') || lower.includes('mail') || lower.includes('adresse') || lower.includes('horaire') || lower.includes('lieu')) {
            botText = '📍 **Contact & Emplacement SIGA** :\n• Adresse : Les Berges du Lac 3, Tunis, Tunisie\n• Téléphone : (+216) 71 960 281\n• Horaires : Lundi - Vendredi (08h30 - 17h30)';
            options = [{ label: 'Lancer le guide "Support"', action: 'start_tour_support', icon: '📞' }];
        } else {
            botText = 'Je suis le guide officiel dédié uniquement aux questions sur la plateforme et la société **SIGA** 🏢 (offres de stage, candidatures, contact).\n\nPour vos questions sur SIGA, voici les raccourcis disponibles :';
            options = [
                { label: 'Postuler à une offre de stage', action: 'guide_apply', icon: '🎯' },
                { label: 'Consulter mes candidatures', action: 'guide_applications', icon: '📋' },
                { label: 'Contacter le support SIGA', action: 'guide_support', icon: '📞' }
            ];
        }

        setTimeout(() => {
            this.messages.push({
                id: Date.now().toString(),
                sender: 'bot',
                text: botText,
                timestamp: new Date(),
                options: options
            });
            this.cdr.detectChanges();
        }, 400);
    }

    // =========================================================================
    // GUIDED TOUR ENGINE
    // =========================================================================

    get currentStep(): TourStep | null {
        if (!this.isGuideActive || !this.activeTaskSteps.length) return null;
        return this.activeTaskSteps[this.activeStepIndex] || null;
    }

    startTour(taskKey: string) {
        this.activeTaskKey = taskKey;
        this.activeStepIndex = 0;

        if (taskKey === 'apply') {
            const isConnected = !!this.userService.currentUser();
            this.activeTaskName = 'Postuler à une offre';
            this.activeTaskSteps = [
                {
                    targetSelector: '#pricing',
                    title: 'Section Opportunités de Stage',
                    description: 'Toutes les offres de stage actives de SIGA (statut Ouvert) sont regroupées ici. Les offres fermées ne reçoivent plus de candidatures.',
                    position: 'bottom'
                },
                {
                    targetSelector: '[data-tour="offer-card"]',
                    title: 'Découvrir une Offre de Stage',
                    description: 'Consultez le statut de l\'offre (Ouverte/Fermée), la stack technique et les détails du stage proposé.',
                    position: 'top'
                },
                {
                    targetSelector: '[data-tour="apply-btn"]',
                    title: 'Bouton de Postulation',
                    description: 'Si l\'offre est ouverte et que vous n\'avez pas encore postulé, cliquez sur "Postuler" pour ouvrir le formulaire de candidature.',
                    position: 'top'
                }
            ];

            if (!isConnected) {
                this.activeTaskSteps.push({
                    targetSelector: '[data-tour="nav-auth"]',
                    title: 'Connexion & Inscription',
                    description: 'Pour finaliser votre candidature, vous devez être connecté. Si vous n\'avez pas encore de compte, vous pouvez vous inscrire en 1 clic.',
                    position: 'bottom'
                });
            }
        } else if (taskKey === 'applications') {
            const isConnected = !!this.userService.currentUser();
            this.activeTaskName = 'Mes Candidatures';
            if (!isConnected) {
                this.activeTaskSteps = [
                    {
                        targetSelector: '[data-tour="nav-auth"]',
                        title: 'Étape 1 : Connexion à votre compte',
                        description: 'Pour consulter vos candidatures, vous devez être connecté. Cliquez sur le bouton "Connexion" dans la barre de navigation.',
                        position: 'bottom'
                    },
                    {
                        targetSelector: '[data-tour="nav-candidatures"]',
                        title: 'Étape 2 : Consulter vos candidatures',
                        description: 'Une fois connecté, cliquez sur "Mes candidatures" dans le menu pour consulter vos dossiers et suivre leur avancement.',
                        position: 'bottom'
                    }
                ];
            } else {
                this.activeTaskSteps = [
                    {
                        targetSelector: '[data-tour="nav-candidatures"]',
                        title: 'Consulter vos candidatures',
                        description: 'Cliquez sur "Mes candidatures" dans la barre de navigation pour consulter vos dossiers et suivre leur statut (En attente, Acceptée, Refusée, Fini).',
                        position: 'bottom'
                    }
                ];
            }
        } else if (taskKey === 'support') {
            this.activeTaskName = 'Support & Contact';
            this.activeTaskSteps = [
                {
                    targetSelector: '#contact',
                    title: 'Section Contact',
                    description: 'Découvrez les coordonnées officielles de SIGA (Berges du Lac 3, Tunis) ainsi que nos numéros de téléphone direct.',
                    position: 'top'
                },
                {
                    targetSelector: '[data-tour="contact-form"]',
                    title: 'Formulaire de Message Direct',
                    description: 'Remplissez ce formulaire avec votre nom, email et message pour transmettre directement votre requête à l\'équipe RH et support.',
                    position: 'top'
                }
            ];
        }

        this.isGuideActive = true;
        this.updateStepPosition();
    }

    nextStep() {
        if (this.activeStepIndex < this.activeTaskSteps.length - 1) {
            this.activeStepIndex++;
            this.updateStepPosition();
        } else {
            this.finishTour();
        }
    }

    prevStep() {
        if (this.activeStepIndex > 0) {
            this.activeStepIndex--;
            this.updateStepPosition();
        }
    }

    stopGuide() {
        this.isGuideActive = false;
        this.spotlightRect = null;
        this.isOpen = true;
    }

    private finishTour() {
        this.isGuideActive = false;
        this.spotlightRect = null;
        this.isOpen = true;

        this.messages.push({
            id: Date.now().toString(),
            sender: 'bot',
            text: `🎉 Bravo ! Vous avez terminé le guide interactif "${this.activeTaskName}".\n\nAvez-vous d'autres questions ou souhaitez-vous explorer une autre tâche ?`,
            timestamp: new Date(),
            options: [
                { label: 'Postuler à une offre de stage', action: 'guide_apply', icon: '🎯' },
                { label: 'Consulter mes candidatures', action: 'guide_applications', icon: '📋' },
                { label: 'Contacter le support', action: 'guide_support', icon: '📞' }
            ]
        });
        this.cdr.detectChanges();
    }

    private updateStepPosition() {
        const step = this.currentStep;
        if (!step) return;

        setTimeout(() => {
            let elem = document.querySelector(step.targetSelector) as HTMLElement;
            if (!elem && step.targetSelector === '[data-tour="offers-list"]') {
                elem = document.querySelector('#pricing') as HTMLElement;
            }
            if (!elem && step.targetSelector === '[data-tour="offer-card"]') {
                elem = document.querySelector('.pricing-card') as HTMLElement || document.querySelector('#pricing') as HTMLElement;
            }
            if (!elem && step.targetSelector === '[data-tour="apply-btn"]') {
                elem = document.querySelector('.pricing-card') as HTMLElement || document.querySelector('#pricing') as HTMLElement;
            }
            if (!elem && step.targetSelector === '[data-tour="nav-candidatures"]') {
                elem = document.querySelector('[data-tour="nav-auth"]') as HTMLElement || document.querySelector('topbar-widget') as HTMLElement;
            }

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            const cardNative = this.tourCardRef?.nativeElement;
            const cardWidth = cardNative?.offsetWidth || Math.min(460, viewportWidth * 0.92);
            const cardHeight = cardNative?.offsetHeight || 220;

            if (elem) {
                const currentScrollY = window.scrollY || window.pageYOffset;
                const elemRectBefore = elem.getBoundingClientRect();
                const elemAbsoluteTop = currentScrollY + elemRectBefore.top;

                if (step.targetSelector === '#pricing') {
                    // Instant scroll to top of #pricing component (85px under navbar) so layout recalculates immediately
                    window.scrollTo({
                        top: Math.max(0, elemAbsoluteTop - 85),
                        behavior: 'auto'
                    });
                } else {
                    elem.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }

                setTimeout(() => {
                    const rect = elem.getBoundingClientRect();
                    const pad = 12;

                    if (step.targetSelector === '#pricing') {
                        // FOR #PRICING: Always start spotlight at 85px max so header/title/badge are NEVER covered after refresh!
                        const spotlightTop = Math.min(85, Math.max(0, rect.top - pad));
                        const spotlightBottom = Math.max(viewportHeight, rect.bottom + pad);
                        this.spotlightRect = {
                            top: spotlightTop,
                            left: Math.max(0, rect.left - pad),
                            width: rect.width + pad * 2,
                            height: Math.max(200, spotlightBottom - spotlightTop)
                        };
                    } else {
                        this.spotlightRect = {
                            top: Math.max(0, rect.top - pad),
                            left: Math.max(0, rect.left - pad),
                            width: rect.width + pad * 2,
                            height: rect.height + pad * 2
                        };
                    }

                    const spotlightRight = this.spotlightRect.left + this.spotlightRect.width;

                    let safeTop = 105;
                    let safeLeft = (viewportWidth - cardWidth) / 2;

                    // SPECIAL POSITIONING FOR STEP 2 (offer-card step):
                    if (this.activeStepIndex === 1 || step.targetSelector === '[data-tour="offer-card"]') {
                        if (spotlightRight + cardWidth + 36 <= viewportWidth - 16) {
                            safeLeft = spotlightRight + 36;
                            safeTop = Math.max(105, Math.min(viewportHeight - cardHeight - 20, rect.top));
                        } else {
                            safeTop = 105;
                            safeLeft = Math.max(16, (viewportWidth - cardWidth) / 2);
                        }
                    } else {
                        safeTop = 105;
                        safeLeft = Math.max(16, (viewportWidth - cardWidth) / 2);
                    }

                    this.cardPosition = { top: safeTop, left: safeLeft };
                    this.cdr.detectChanges();
                }, 300);
            } else {
                // Fallback top center
                this.spotlightRect = null;
                const safeTop = 105;
                const safeLeft = Math.max(16, (viewportWidth - cardWidth) / 2);
                this.cardPosition = { top: safeTop, left: safeLeft };
                this.cdr.detectChanges();
            }
        }, 100);
    }

    @HostListener('window:resize')
    onResize() {
        if (this.isGuideActive) {
            this.updateStepPosition();
        }
    }
}
