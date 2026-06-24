import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, ContactRequest } from '@/app/services/contact.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'footer-widget',
    standalone: true,
    imports: [RouterModule, CommonModule, FormsModule, ToastModule],
    providers: [MessageService],
    template: `
        <!-- Contact Section -->
        <div id="contact" class="py-20 px-6 lg:px-20 mx-0 lg:mx-20 bg-slate-50 dark:bg-[#021427] rounded-3xl transition-colors border border-gray-100 dark:border-blue-900/30 shadow-sm mt-10">
            
            <div class="text-center mb-16">
                <div class="text-[#063970] dark:text-blue-300 font-bold mb-4 text-5xl tracking-tight transition-colors">
                    Contactez-nous
                </div>
                <span class="text-gray-500 dark:text-blue-100/70 text-xl block max-w-2xl mx-auto transition-colors">
                    Nous sommes à votre disposition pour donner vie à vos projets de gestion et d'informatique.
                </span>
            </div>

            <!-- items-stretch to ensure left and right columns have equal height -->
            <div class="grid grid-cols-12 gap-10 items-stretch">

                <!-- LEFT SIDE (Contact Info) -->
                <div class="col-span-12 md:col-span-5 flex flex-col gap-6 h-full">

                    <!-- flex-1 to each box makes them equal in height and fills the container -->
                    <div class="flex flex-1 items-start gap-5 p-6 bg-white dark:bg-[#063970] rounded-2xl border border-gray-100 dark:border-blue-800/40 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all cursor-default text-lg">
                        <div class="w-12 h-12 rounded-full bg-[#063970] dark:bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md transition-colors">
                            <i class="pi pi-map-marker text-white text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h5 class="font-bold text-gray-900 dark:text-blue-50 text-xl mb-1 transition-colors">Notre Siège</h5>
                            <p class="text-gray-600 dark:text-blue-100/70 leading-relaxed transition-colors">
                                13 Rue Ibn Nafis, Les berges du Lac 3,<br>Tunis 2015, Tunisie
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-1 items-start gap-5 p-6 bg-white dark:bg-[#063970] rounded-2xl border border-gray-100 dark:border-blue-800/40 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all cursor-default text-lg">
                        <div class="w-12 h-12 rounded-full bg-[#063970] dark:bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md transition-colors">
                            <i class="pi pi-phone text-white text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h5 class="font-bold text-gray-900 dark:text-blue-50 text-xl mb-1 transition-colors">Appelez-nous</h5>
                            <p class="text-gray-600 dark:text-blue-100/70 transition-colors">(+216) 71 960 281</p>
                            <p class="text-gray-500 dark:text-blue-200/50 text-base mt-1 transition-colors">Fax : (+216) 71 960 336</p>
                        </div>
                    </div>

                    <div class="flex flex-1 items-start gap-5 p-6 bg-white dark:bg-[#063970] rounded-2xl border border-gray-100 dark:border-blue-800/40 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all cursor-default text-lg">
                        <div class="w-12 h-12 rounded-full bg-[#063970] dark:bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md transition-colors">
                            <i class="pi pi-envelope text-white text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h5 class="font-bold text-gray-900 dark:text-blue-50 text-xl mb-1 transition-colors">Email Support</h5>
                            <p class="text-gray-600 dark:text-blue-100/70 transition-colors">contact&#64;siga.com.tn</p>
                        </div>
                    </div>

                </div>

                <!-- RIGHT SIDE (Contact Form) -->
                <div class="col-span-12 md:col-span-7 h-full">

                    <form (ngSubmit)="onSubmit()" #contactFormRef="ngForm" class="h-full p-8 lg:p-10 bg-white dark:bg-[#063970] rounded-3xl border border-gray-100 dark:border-blue-800/40 shadow-xl dark:shadow-none flex flex-col gap-6 transition-all">

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="flex flex-col gap-2">
                                <label class="text-gray-700 dark:text-blue-50 font-semibold transition-colors text-lg">Nom complet</label>
                                <input type="text" name="name" [(ngModel)]="contactForm.name" required placeholder="Votre nom"
                                    class="border-2 border-gray-100 dark:border-blue-900/50 dark:bg-[#021427] dark:placeholder:text-blue-200/30 dark:text-white rounded-xl px-4 py-3 text-base outline-none focus:border-[#063970] dark:focus:border-blue-400 transition-all shadow-sm focus:shadow-md" />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="text-gray-700 dark:text-blue-50 font-semibold transition-colors text-lg">Adresse email</label>
                                <input type="email" name="email" [(ngModel)]="contactForm.email" required email placeholder="votre@email.com"
                                    class="border-2 border-gray-100 dark:border-blue-900/50 dark:bg-[#021427] dark:placeholder:text-blue-200/30 dark:text-white rounded-xl px-4 py-3 text-base outline-none focus:border-[#063970] dark:focus:border-blue-400 transition-all shadow-sm focus:shadow-md" />
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-gray-700 dark:text-blue-50 font-semibold transition-colors text-lg">Objet</label>
                            <input type="text" name="subject" [(ngModel)]="contactForm.subject" required placeholder="Sujet de votre message"
                                class="border-2 border-gray-100 dark:border-blue-900/50 dark:bg-[#021427] dark:placeholder:text-blue-200/30 dark:text-white rounded-xl px-4 py-3 text-base outline-none focus:border-[#063970] dark:focus:border-blue-400 transition-all shadow-sm focus:shadow-md" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-gray-700 dark:text-blue-50 font-semibold transition-colors text-lg">Message</label>
                            <textarea name="message" [(ngModel)]="contactForm.message" required rows="4" placeholder="Votre message détaillé..."
                                class="border-2 border-gray-100 dark:border-blue-900/50 dark:bg-[#021427] dark:placeholder:text-blue-200/30 dark:text-white rounded-xl px-4 py-3 text-base outline-none focus:border-[#063970] dark:focus:border-blue-400 transition-all shadow-sm focus:shadow-md resize-none"></textarea>
                        </div>

                        <!-- mt-auto to push button to the bottom if container is larger -->
                        <button type="submit" [disabled]="!contactFormRef.valid || isSubmitting"
                            class="mt-auto bg-[#063970] dark:bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-900 dark:hover:bg-blue-400 transition-all text-xl cursor-pointer border-none shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-50 disabled:cursor-not-allowed">
                            <span *ngIf="!isSubmitting">Envoyer le message <i class="pi pi-send ml-2"></i></span>
                            <span *ngIf="isSubmitting">Envoi en cours... <i class="pi pi-spin pi-spinner ml-2"></i></span>
                        </button>

                    </form>

                </div>

            </div>
        </div>

        <!-- Footer Bar -->
        <div class="py-12 px-6 lg:px-20 mx-0 bg-[#063970] dark:bg-[#021427] mt-16 transition-colors border-t border-transparent dark:border-blue-900/50">
            <div class="grid grid-cols-12 gap-10 items-start">
                
                <div class="col-span-12 md:col-span-3">
                    <a (click)="router.navigate(['/landing'], { fragment: 'home' })" 
                       class="flex items-center justify-center md:justify-start mb-6 cursor-pointer">
                        <img src="sigaLogo3_cropped.png" alt="SIGA Logo" class="h-16 lg:h-20 w-auto brightness-0 invert transition-all hover:scale-105" />
                    </a>
                    <p class="text-blue-200 dark:text-blue-100/60 text-base leading-relaxed text-center md:text-left transition-colors">
                        Système Informatique et Gestion Automatisée. Innovons ensemble depuis 1996.
                    </p>
                </div>

                <div class="col-span-12 md:col-span-9">
                    <div class="grid grid-cols-12 gap-8 text-center md:text-left">
                        
                        <div class="col-span-12 md:col-span-3">
                            <h4 class="font-bold text-xl mb-6 !text-white tracking-wide ">Entreprise</h4>
                            <ul class="list-none p-0 m-0 flex flex-col gap-3">
                                <li><a class="text-blue-100 dark:text-blue-100/70 hover:text-white transition-colors cursor-pointer text-base">À propos</a></li>
                                <li><a class="text-blue-100 dark:text-blue-100/70 hover:text-white transition-colors cursor-pointer text-base">Actualités</a></li>
                                <li><a class="text-blue-100 dark:text-blue-100/70 hover:text-white transition-colors cursor-pointer text-base">Carrières</a></li>
                            </ul>
                        </div>

                        <div class="col-span-12 md:col-span-3">
                            <h4 class="font-bold text-xl mb-6 !text-white tracking-wide">Produits</h4>
                            <ul class="list-none p-0 m-0 flex flex-col gap-3">
                                <li><a class="text-blue-100 dark:text-blue-100/70 hover:text-white transition-colors cursor-pointer text-base">SIGA'Logis</a></li>
                                <li><a class="text-blue-100 dark:text-blue-100/70 hover:text-white transition-colors cursor-pointer text-base">SIGA'Com</a></li>
                                <li><a class="text-blue-100 dark:text-blue-100/70 hover:text-white transition-colors cursor-pointer text-base">SIGA'Finance</a></li>
                            </ul>
                        </div>

                        <div class="col-span-12 md:col-span-3">
                            <h4 class="font-bold text-xl mb-6 !text-white tracking-wide">Références</h4>
                            <ul class="list-none p-0 m-0 flex flex-col gap-3">
                                <li><a class="text-blue-100 dark:text-blue-100/70 hover:text-white transition-colors cursor-pointer text-base">Banques & Assurances</a></li>
                                <li><a class="text-blue-100 dark:text-blue-100/70 hover:text-white transition-colors cursor-pointer text-base">Administrations</a></li>
                                <li><a class="text-blue-100 dark:text-blue-100/70 hover:text-white transition-colors cursor-pointer text-base">Télécoms</a></li>
                            </ul>
                        </div>

                        <div class="col-span-12 md:col-span-3">
                            <h4 class="font-bold text-xl mb-6 !text-white tracking-wide">Contact</h4>
                            <div class="flex flex-col gap-3 text-blue-100 dark:text-blue-100/70 text-base transition-colors">
                                <p>13 Rue Ibn Nafis, Tunis 2015</p>
                                <p>contact&#64;siga.com.tn</p>
                                <p>(+216) 71 960 281</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            <div class="border-t border-blue-800 dark:border-blue-900/50 mt-12 pt-8 text-center transition-colors">
                <p class="text-blue-300 dark:text-blue-100/50 text-base transition-colors">
                    &copy; 2026 SIGA — Système Informatique et Gestion Automatisée. Tous droits réservés.
                </p>
            </div>
        </div>
        <p-toast />
    `
})
export class FooterWidget {
    contactForm: ContactRequest = {
        name: '',
        email: '',
        subject: '',
        message: ''
    };
    isSubmitting = false;

    private contactService = inject(ContactService);
    private messageService = inject(MessageService);

    constructor(public router: Router) { }

    onSubmit() {
        if (this.isSubmitting) return;

        this.isSubmitting = true;
        this.contactService.sendContactMessage(this.contactForm).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: response.message || 'Votre message a été envoyé avec succès.',
                    life: 5000
                });
                this.resetForm();
                this.isSubmitting = false;
            },
            error: (error) => {
                console.error('Erreur lors de l\'envoi du message:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.',
                    life: 5000
                });
                this.isSubmitting = false;
            }
        });
    }

    resetForm() {
        this.contactForm = {
            name: '',
            email: '',
            subject: '',
            message: ''
        };
    }
}