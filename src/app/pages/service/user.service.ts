import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface User {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    password?: string;
    role?: 'Admin' | 'RH' | 'Encadrant' | 'Stagiaire' | 'User';
    encadrantId?: string; // For Stagiaires
    stagiaireIds?: string[]; // For Encadrants
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient) {}

    getUsersData(): User[] {
        return [
            {
                id: '1',
                firstName: 'Ahmed',
                lastName: 'Ben Ali',
                email: 'ahmed@siga.tn',
                username: 'ahmed.ba',
                role: 'Admin'
            },
            {
                id: '2',
                firstName: 'Sonia',
                lastName: 'Mansour',
                email: 'sonia@siga.tn',
                username: 'sonia.m',
                role: 'RH'
            },
            {
                id: '3',
                firstName: 'Karim',
                lastName: 'Trabelsi',
                email: 'karim@siga.tn',
                username: 'karim.t',
                role: 'Encadrant',
                stagiaireIds: ['4', '5']
            },
            {
                id: '4',
                firstName: 'Yassine',
                lastName: 'Jridi',
                email: 'yassine@example.com',
                username: 'yassine.j',
                role: 'Stagiaire',
                encadrantId: '3'
            },
            {
                id: '5',
                firstName: 'Meryem',
                lastName: 'Feki',
                email: 'meryem@example.com',
                username: 'meryem.f',
                role: 'Stagiaire',
                encadrantId: '3'
            }
        ];
    }

    getUsers() {
        return Promise.resolve(this.getUsersData());
    }
}
