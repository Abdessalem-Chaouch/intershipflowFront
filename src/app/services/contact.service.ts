import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactRequest {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface ContactResponse {
    status: string;
    message: string;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/contact';

    sendContactMessage(request: ContactRequest): Observable<ContactResponse> {
        return this.http.post<ContactResponse>(this.apiUrl, request);
    }
}
