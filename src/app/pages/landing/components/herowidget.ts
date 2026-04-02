import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'hero-widget',
    imports: [CommonModule, ButtonModule, RippleModule],
    styles: [`
        .hero-section {
            position: relative;
            min-height: 92vh;
            overflow: hidden;
        }

        /* Diagonal clip for the right side image panel */
        .image-panel {
            position: absolute;
            top: 0;
            right: 0;
            width: 58%;
            height: 100%;
            clip-path: polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%);
            overflow: hidden;
        }

        .slide-image {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center top;
            opacity: 0;
            transform: scale(1.06);
            transition: opacity 0.9s ease, transform 1.2s ease;
        }

        .slide-image.active {
            opacity: 1;
            transform: scale(1);
        }

        /* Left text content */
        .content-panel {
            position: relative;
            z-index: 10;
            width: 50%;
            min-height: 92vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 3rem 0 4rem;
        }

        /* Slide indicator dots */
        .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .dot.active {
            width: 28px;
            border-radius: 6px;
        }

        @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        .animate-in {
            animation: slideUpFade 0.7s ease-out forwards;
        }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.3s; opacity: 0; }
        .delay-3 { animation-delay: 0.5s; opacity: 0; }
        .delay-4 { animation-delay: 0.7s; opacity: 0; }
        .delay-5 { animation-delay: 0.9s; opacity: 0; }

        @media (max-width: 768px) {
            .image-panel {
                position: relative;
                width: 100%;
                height: 350px;
                clip-path: none;
            }
            .content-panel {
                width: 100%;
                padding: 2rem 1.5rem;
                min-height: auto;
            }
            .hero-section {
                flex-direction: column;
                min-height: auto;
            }
        }
    `],
    template: `
        <div id="home" class="hero-section flex flex-row bg-white dark:bg-[#021427] transition-colors pt-[100px] lg:pt-[62px]">

            <!-- Left: Text Content -->
            <div class="content-panel">
                <p class="animate-in delay-1 text-sm font-bold tracking-widest uppercase mb-4 text-[#063970] dark:text-blue-300" style="letter-spacing: 0.2em;">
                    Système Informatique & Gestion Automatisée
                </p>
                <h1 class="animate-in delay-2 font-extrabold leading-tight mb-4 text-[#0a0a0a] dark:text-gray-100 transition-colors" style="font-size: clamp(2.8rem, 5vw, 4.2rem); line-height: 1.1;">
                    Bienvenue chez<br>
                    <span class="text-[#063970] dark:text-blue-400">SIGA</span>
                </h1>
                <p class="animate-in delay-3 text-gray-500 dark:text-blue-100/60 text-xl leading-relaxed mb-8 transition-colors" style="max-width: 420px;">
                    Des solutions informatiques innovantes pour transformer et automatiser votre entreprise depuis 1996.
                </p>

                <div class="animate-in delay-4 flex gap-4 flex-wrap">
                    <button pButton pRipple label="Contactez-nous" class="font-bold rounded-lg border-none text-white dark:text-surface-900 bg-[#063970] dark:bg-blue-300 hover:bg-blue-900 dark:hover:bg-blue-200 text-base py-3 px-6 hover:-translate-y-1 transition-all shadow-lg"
                        onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'})">
                    </button>
                    <button pButton pRipple label="Nos Produits" [outlined]="true" class="font-bold rounded-lg text-base py-3 px-6 hover:-translate-y-1 transition-all border-2 text-[#063970] border-[#063970] hover:bg-blue-50 dark:text-blue-300 dark:border-blue-300 dark:hover:bg-blue-900/20"
                        style="background:transparent;"
                        onclick="document.getElementById('produits').scrollIntoView({behavior:'smooth'})">
                    </button>
                </div>

                <!-- Stats row -->
                <div class="animate-in delay-5 flex gap-8 mt-12">
                    <div>
                        <div class="text-4xl font-extrabold text-[#063970] dark:text-blue-400 transition-colors">20+</div>
                        <div class="text-gray-500 dark:text-blue-200/50 text-sm mt-1">Pays couverts</div>
                    </div>
                    <div class="w-px bg-gray-200 dark:bg-blue-900/50 transition-colors"></div>
                    <div>
                        <div class="text-4xl font-extrabold text-[#063970] dark:text-blue-400 transition-colors">200+</div>
                        <div class="text-gray-500 dark:text-blue-200/50 text-sm mt-1">Projets réalisés</div>
                    </div>
                    <div class="w-px bg-gray-200 dark:bg-blue-900/50 transition-colors"></div>
                    <div>
                        <div class="text-4xl font-extrabold text-[#063970] dark:text-blue-400 transition-colors">150+</div>
                        <div class="text-gray-500 dark:text-blue-200/50 text-sm mt-1">Clients satisfaits</div>
                    </div>
                </div>

                <!-- Slide Dots -->
                <div class="flex gap-2 mt-10">
                    <div
                        *ngFor="let slide of slides; let i = index"
                        class="dot bg-blue-200 dark:bg-blue-900/40"
                        [class.!bg-[#063970]]="i === currentIndex"
                        [class.dark:!bg-blue-400]="i === currentIndex"
                        (click)="goTo(i)">
                    </div>
                </div>
            </div>

            <!-- Right: Image Slider Panel -->
            <div class="image-panel bg-gray-100 dark:bg-[#063970]/20 transition-colors">
                <img
                    *ngFor="let slide of slides; let i = index"
                    [src]="slide.image"
                    [alt]="slide.alt"
                    class="slide-image"
                    [class.active]="i === currentIndex"
                />
                <!-- Color overlay for branding -->
                <div style="position:absolute;inset:0;background:linear-gradient(to right, rgba(255,255,255,0.08), rgba(6,57,112,0.1));z-index:2;pointer-events:none;"></div>
                <div class="hidden dark:block" style="position:absolute;inset:0;background:linear-gradient(to right, rgba(2,20,39,0.5), rgba(6,57,112,0.3));z-index:3;pointer-events:none;"></div>
            </div>

        </div>
    `
})
export class HeroWidget implements OnInit, OnDestroy {
    currentIndex = 0;
    private timer: any;

    slides = [
        { image: 'bg_1.jpg', alt: 'Professionnel SIGA 1' },
        { image: 'bg_2.jpg', alt: 'Professionnel SIGA 2' }
    ];

    constructor(private ngZone: NgZone) {}

    ngOnInit() {
        this.startTimer();
    }

    ngOnDestroy() {
        clearInterval(this.timer);
    }

    goTo(index: number) {
        this.currentIndex = index;
        clearInterval(this.timer);
        this.startTimer();
    }

    private startTimer() {
        // Run outside Angular zone to avoid triggering unnecessary CD checks,
        // but wrap the state mutation in ngZone.run() so Angular detects the change.
        this.ngZone.runOutsideAngular(() => {
            this.timer = setInterval(() => {
                this.ngZone.run(() => {
                    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
                });
            }, 5000);
        });
    }
}
