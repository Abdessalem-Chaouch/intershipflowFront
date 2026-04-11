import { Routes } from '@angular/router';
import { UserManagement } from './user-management/user-management';
import { OfferManagement } from './offer-management/offer-management';
import { TestManagement } from './test-management/test-management';
import { ApplicationManagement } from './application-management/application-management';
import { ExerciceManagement } from './exercice-management/exercice-management';
import { QuestionManagement } from './question-management/question-management';
import { StagiaireDocumentsComponent } from './stagiaire-documents/stagiaire-documents.component';
import { EncadrantDocumentsComponent } from './encadrant-documents/encadrant-documents';

export default [
    { path: 'user-management', component: UserManagement },
    { path: 'offer-management', component: OfferManagement },
    { path: 'test-management', component: TestManagement },
    { path: 'application-management', component: ApplicationManagement },
    { path: 'exercice-management', component: ExerciceManagement },
    { path: 'question-management', component: QuestionManagement },
    { path: 'stagiaire-documents', component: StagiaireDocumentsComponent },
    { path: 'encadrant-documents', component: EncadrantDocumentsComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
