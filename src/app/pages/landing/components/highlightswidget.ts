import { Component } from '@angular/core';

@Component({
    selector: 'highlights-widget',
    styles: [`
        .product-card {
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.3s ease, border-color 0.3s ease;
        }
        .product-card:hover {
            transform: scale(1.05);
        }
    `],
    template: `
        <div id="produits" class="py-16 px-6 lg:px-20 mx-0 my-12 lg:mx-20 bg-slate-50 dark:bg-[#021427] rounded-3xl transition-colors border border-transparent dark:border-blue-900/30">
            <div class="text-center mb-16">
                <div class="text-[#063970] dark:text-blue-300 font-bold mb-4 text-5xl transition-colors">Produits</div>
                <span class="text-gray-500 dark:text-blue-100/70 text-xl block max-w-2xl mx-auto transition-colors">Découvrez notre gamme de solutions logicielles adaptées à vos besoins professionnels.</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
                <div class="product-card bg-white dark:bg-[#063970] p-8 rounded-2xl shadow-lg dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-blue-800/40 flex flex-col items-center text-center cursor-pointer transition-all">
                    <div class="w-20 h-20 rounded-full bg-[#063970] dark:bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md transition-colors">
                        <i class="pi pi-home text-4xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-blue-50 mb-4 transition-colors">SIGA'Logis</h3>
                    <p class="text-gray-600 dark:text-blue-100/60 leading-relaxed transition-colors">Solution complète pour la gestion immobilière et locative.</p>
                </div>

                <div class="product-card bg-white dark:bg-[#063970] p-8 rounded-2xl shadow-lg dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-blue-800/40 flex flex-col items-center text-center cursor-pointer transition-all">
                    <div class="w-20 h-20 rounded-full bg-[#063970] dark:bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md transition-colors">
                        <i class="pi pi-comments text-4xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-blue-50 mb-4 transition-colors">SIGA'Com</h3>
                    <p class="text-gray-600 dark:text-blue-100/60 leading-relaxed transition-colors">Plateforme de communication et de gestion des relations clients.</p>
                </div>

                <div class="product-card bg-white dark:bg-[#063970] p-8 rounded-2xl shadow-lg dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-blue-800/40 flex flex-col items-center text-center cursor-pointer transition-all">
                    <div class="w-20 h-20 rounded-full bg-[#063970] dark:bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md transition-colors">
                        <i class="pi pi-chart-pie text-4xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-blue-50 mb-4 transition-colors">SIGA'Finance</h3>
                    <p class="text-gray-600 dark:text-blue-100/60 leading-relaxed transition-colors">Outil puissant pour l'analyse financière et la comptabilité.</p>
                </div>
            </div>
        </div>
    `
})
export class HighlightsWidget {}
