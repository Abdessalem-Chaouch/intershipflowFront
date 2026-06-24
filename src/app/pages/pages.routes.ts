import { Routes } from '@angular/router';
import { UserManagement } from './user-management/user-management';
import { OfferManagement } from './offer-management/offer-management';
import { TestManagement } from './test-management/test-management';
import { ApplicationManagement } from './application-management/application-management';
import { ExerciceManagement } from './exercice-management/exercice-management';
import { QuestionManagement } from './question-management/question-management';
import { StagiaireDocumentsComponent } from './stagiaire-documents/stagiaire-documents.component';
import { EncadrantDocumentsComponent } from './encadrant-documents/encadrant-documents';
import { MesStagesComponent } from './stages/mes-stages.component';
import { GestionStagesComponent } from './stages/gestion-stages.component';
import { MesAttestationsComponent } from './attestation/mes-attestations.component';
import { GestionAttestationsComponent } from './attestation/gestion-attestations.component';
import { ProfileComponent } from './profile/profile.component';
import { MesStagiairesComponent } from './mes-stagiaires/mes-stagiaires.component';

import { authGuard } from '../services/auth.guard';

export default [
    { path: 'user-management', component: UserManagement, canActivate: [authGuard], data: { roles: ['Admin', 'RH'] } },
    { path: 'offer-management', component: OfferManagement, canActivate: [authGuard], data: { roles: ['Admin', 'RH'] } },
    { path: 'test-management', component: TestManagement, canActivate: [authGuard], data: { roles: ['Admin', 'RH', 'Encadrant'] } },
    { path: 'application-management', component: ApplicationManagement, canActivate: [authGuard], data: { roles: ['Admin', 'RH'] } },
    { path: 'exercice-management', component: ExerciceManagement, canActivate: [authGuard], data: { roles: ['Admin', 'RH', 'Encadrant'] } },
    { path: 'question-management', component: QuestionManagement, canActivate: [authGuard], data: { roles: ['Admin', 'RH', 'Encadrant'] } },
    { path: 'stagiaire-documents', component: StagiaireDocumentsComponent, canActivate: [authGuard], data: { roles: ['Stagiaire'] } },
    { path: 'encadrant-documents', component: EncadrantDocumentsComponent, canActivate: [authGuard], data: { roles: ['Encadrant', 'Admin', 'RH'] } },
    { path: 'mes-stagiaires', component: MesStagiairesComponent, canActivate: [authGuard], data: { roles: ['Encadrant'] } },
    { path: 'mes-stages', component: MesStagesComponent, canActivate: [authGuard], data: { roles: ['Stagiaire'] } },
    { path: 'gestion-stages', component: GestionStagesComponent, canActivate: [authGuard], data: { roles: ['Admin', 'RH', 'Encadrant'] } },
    { path: 'mes-attestations', component: MesAttestationsComponent, canActivate: [authGuard], data: { roles: ['Stagiaire'] } },
    { path: 'gestion-attestations', component: GestionAttestationsComponent, canActivate: [authGuard], data: { roles: ['Admin', 'RH'] } },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard], data: { roles: ['Admin', 'RH', 'Encadrant', 'Stagiaire'] } },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
