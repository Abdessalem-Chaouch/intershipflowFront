import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule],
    styles: [`
        .feature-card {
            transition: all 0.3s ease;
        }
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(6, 57, 112, 0.1), 0 10px 10px -5px rgba(6, 57, 112, 0.04);
        }
        :global(.dark) .feature-card:hover {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
        }
    `],
    template: ` <div id="apropos" class="py-16 px-6 lg:px-20 mt-8 mx-0 lg:mx-20 bg-slate-50 dark:bg-[#021427] rounded-3xl transition-colors border border-transparent dark:border-blue-900/30">
        <div class="grid grid-cols-12 gap-8 justify-center">
<div class="col-span-12 flex flex-col items-center justify-center text-center mt-10 mb-10">
    
    <div class="text-[#063970] dark:text-blue-300 font-bold mb-4 text-5xl transition-colors">
        À Propos
    </div>

    <p class="text-gray-600 dark:text-blue-100/70 text-xl leading-relaxed max-w-5xl transition-colors">
        SIGA a été créée en 1996 par des spécialistes du traitement des données et des ingénieurs ayant une expérience multidisciplinaire dans le domaine du développement des systèmes d'information et de gestion. Nos services couvrent tous les aspects du cycle de développement des progiciels.
    </p>

</div>

            <div class="col-span-12 md:col-span-6 lg:col-span-3 p-0">
                <div class="p-6 bg-white border border-gray-100 dark:bg-[#063970] dark:border-blue-800/50 h-full rounded-2xl feature-card shadow-sm transition-all">
                    <div class="flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 mb-6 w-16 h-16 rounded-xl transition-colors">
                        <i class="pi pi-search text-3xl text-[#063970] dark:text-blue-300"></i>
                    </div>
                    <h5 class="mb-3 text-2xl font-semibold text-[#063970] dark:text-blue-100 transition-colors">Diagnostic</h5>
                    <span class="text-gray-600 dark:text-blue-100/60 leading-relaxed block transition-colors">Diagnostic des systèmes d'information existants.</span>
                </div>
            </div>

            <div class="col-span-12 md:col-span-6 lg:col-span-3 p-0">
                <div class="p-6 bg-white border border-gray-100 dark:bg-[#063970] dark:border-blue-800/50 h-full rounded-2xl feature-card shadow-sm transition-all">
                    <div class="flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 mb-6 w-16 h-16 rounded-xl transition-colors">
                        <i class="pi pi-code text-3xl text-[#063970] dark:text-blue-300"></i>
                    </div>
                    <h5 class="mb-3 text-2xl font-semibold text-[#063970] dark:text-blue-100 transition-colors">Développement</h5>
                    <span class="text-gray-600 dark:text-blue-100/60 leading-relaxed block transition-colors">La conception et le développement des systèmes avec des outils avancés.</span>
                </div>
            </div>

            <div class="col-span-12 md:col-span-6 lg:col-span-3 p-0">
                <div class="p-6 bg-white border border-gray-100 dark:bg-[#063970] dark:border-blue-800/50 h-full rounded-2xl feature-card shadow-sm transition-all">
                    <div class="flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 mb-6 w-16 h-16 rounded-xl transition-colors">
                        <i class="pi pi-chart-line text-3xl text-[#063970] dark:text-blue-300"></i>
                    </div>
                    <h5 class="mb-3 text-2xl font-semibold text-[#063970] dark:text-blue-100 transition-colors">Gestion de projet</h5>
                    <span class="text-gray-600 dark:text-blue-100/60 leading-relaxed block transition-colors">Gestion de projet, intégration et implémentation des systèmes.</span>
                </div>
            </div>

            <div class="col-span-12 md:col-span-6 lg:col-span-3 p-0">
                <div class="p-6 bg-white border border-gray-100 dark:bg-[#063970] dark:border-blue-800/50 h-full rounded-2xl feature-card shadow-sm transition-all">
                    <div class="flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 mb-6 w-16 h-16 rounded-xl transition-colors">
                        <i class="pi pi-server text-3xl text-[#063970] dark:text-blue-300"></i>
                    </div>
                    <h5 class="mb-3 text-2xl font-semibold text-[#063970] dark:text-blue-100 transition-colors">Optimisation</h5>
                    <span class="text-gray-600 dark:text-blue-100/60 leading-relaxed block transition-colors">L'optimisation des structures de base de données en fonction des contraintes.</span>
                </div>
            </div>

        </div>
    </div>`
})
export class FeaturesWidget { }
