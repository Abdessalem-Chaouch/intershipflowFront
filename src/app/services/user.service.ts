import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable, map, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

export interface User {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    password?: string;
    role?: 'Admin' | 'RH' | 'Encadrant' | 'Stagiaire' | 'User';
    encadrantId?: string;
    stagiaireIds?: string[];
}

export interface KeycloakUserDto {
    id?: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface StagiaireDto extends KeycloakUserDto {
    encadrantId?: string;
}

export interface LoginResponse {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
    data: {
        access_token: string;
        refresh_token: string;
    } | any;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = 'http://localhost:8081/auth';

    // ── Keycloak direct (pour reset password) ──────────────────────────────
    private keycloakUrl = 'http://localhost:8180';
    private realm = 'internshipflow'; // ← remplace par ton realm name exact
    // ───────────────────────────────────────────────────────────────────────

    private _users = signal<User[]>([]);

    currentUser = signal<User | null>(null);
    token = signal<string | null>(null);

    constructor() {
        this.initializeAuth();
    }

    userMenuItems = computed<MenuItem[]>(() => {
        const user = this.currentUser();
        if (!user) return [];

        return [
            {
                label: 'COMPTE',
                items: [
                    {
                        label: `${user.firstName} ${user.lastName}`,
                        icon: 'pi pi-user',
                        disabled: true,
                        styleClass: 'font-bold text-[#063970] dark:text-blue-200'
                    },
                    {
                        label: `Rôle: ${(user.role ?? 'USER').toUpperCase()}`,
                        icon: 'pi pi-shield',
                        disabled: true,
                        styleClass: 'text-xs text-gray-400'
                    }
                ]
            },
            { separator: true },
            {
                label: 'NAVIGATION',
                items: [
                    {
                        label: 'Accueil (Landing)',
                        icon: 'pi pi-home',
                        command: () => { this.router.navigate(['/landing']); }
                    },
                    {
                        label: 'Tableau de bord',
                        icon: 'pi pi-th-large',
                        command: () => { this.router.navigate(['/']); }
                    },
                    {
                        label: 'Paramètres / Profil',
                        icon: 'pi pi-cog',
                        command: () => { this.router.navigate(['/pages/profile']); }
                    }
                ]
            },
            { separator: true },
            {
                label: 'SESSION',
                items: [
                    {
                        label: 'Se déconnecter',
                        icon: 'pi pi-sign-out',
                        styleClass: 'logout-item',
                        command: () => {
                            this.logout();
                            this.router.navigate(['/landing']);
                        }
                    }
                ]
            }
        ];
    });

    // ── Auth init ────────────────────────────────────────────────────────────

    private initializeAuth() {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
            this.token.set(storedToken);
            const decoded: any = this.decodeToken(storedToken);
            if (decoded) {
                this.currentUser.set({
                    username: decoded.preferred_username || decoded.sub,
                    email: decoded.email,
                    firstName: decoded.given_name,
                    lastName: decoded.family_name,
                    role: this.mapBackendRole(decoded.realm_access?.roles || [])
                });
            }
        }
    }

    private mapBackendRole(roles: string[]): any {
        const priorityRoles = ['admin', 'rh', 'encadrant', 'stagiaire', 'user'];
        for (const r of priorityRoles) {
            if (roles.includes(r)) {
                const roleMap: any = {
                    'admin': 'Admin',
                    'rh': 'RH',
                    'encadrant': 'Encadrant',
                    'stagiaire': 'Stagiaire',
                    'user': 'User'
                };
                return roleMap[r];
            }
        }
        return 'User';
    }

    private decodeToken(token: string) {
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) return null;
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c =>
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                ).join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Error decoding token', e);
            return null;
        }
    }

    // ── Users CRUD ───────────────────────────────────────────────────────────

    async fetchAllUsers() {
        try {
            const dtos = await firstValueFrom(
                this.http.get<KeycloakUserDto[]>(`${this.apiUrl}/users`)
            );
            const mapped = dtos.map(dto => this.mapToUser(dto));
            this._users.set(mapped);
            return mapped;
        } catch (err) {
            console.error('Error fetching users', err);
            return [];
        }
    }

    private mapToUser(dto: any): User {
        let mappedRole: any = dto.role;
        if (dto.role) {
            const roleMap: any = {
                'admin': 'Admin',
                'rh': 'RH',
                'encadrant': 'Encadrant',
                'stagiaire': 'Stagiaire',
                'user': 'User'
            };
            mappedRole = roleMap[dto.role.toLowerCase()] || dto.role;
        }
        return {
            id: dto.id || dto.username,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            username: dto.username,
            role: mappedRole,
            encadrantId: dto.encadrantId,
            stagiaireIds: dto.stagiaireIds
        };
    }

    getUsersSignal() {
        return this._users;
    }

    async getUsers(): Promise<User[]> {
        return this.fetchAllUsers();
    }

    async createUser(user: User) {
        const request = {
            username: user.username,
            email: user.email,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role?.toLowerCase()
        };
        try {
            await firstValueFrom(
                this.http.post(`${this.apiUrl}/createUser`, request, { responseType: 'text' })
            );
            await this.fetchAllUsers();
        } catch (err) {
            console.error('Error creating user', err);
            throw err;
        }
    }

    async editUser(username: string, user: User) {
        const request = {
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role?.toLowerCase()
        };
        try {
            const params = new HttpParams().set('username', username);
            await firstValueFrom(
                this.http.put(`${this.apiUrl}/editUser`, request, { params, responseType: 'text' })
            );
            await this.fetchAllUsers();
        } catch (err) {
            console.error('Error editing user', err);
            throw err;
        }
    }

    async deleteUser(username: string) {
        try {
            const params = new HttpParams().set('username', username);
            await firstValueFrom(
                this.http.delete(`${this.apiUrl}/deleteUser`, { params, responseType: 'text' })
            );
            await this.fetchAllUsers();
        } catch (err) {
            console.error('Error deleting user', err);
            throw err;
        }
    }

    async getEncadrants(): Promise<User[]> {
        const dtos = await firstValueFrom(
            this.http.get<KeycloakUserDto[]>(`${this.apiUrl}/encadrants`)
        );
        return dtos.map(dto => this.mapToUser(dto));
    }

    async getStagiaires(): Promise<User[]> {
        const dtos = await firstValueFrom(
            this.http.get<any[]>(`${this.apiUrl}/stagiaires`)
        );
        return dtos.map(dto => this.mapToUser(dto));
    }

    async getRH(): Promise<User[]> {
        const dtos = await firstValueFrom(
            this.http.get<KeycloakUserDto[]>(`${this.apiUrl}/rh`)
        );
        return dtos.map(dto => this.mapToUser(dto));
    }

    // ── Auth ─────────────────────────────────────────────────────────────────

    async login(request: any): Promise<any> {
        try {
            console.log('Attempting login with:', request.username);
            const response = await firstValueFrom(
                this.http.post<any>(`${this.apiUrl}/login`, request)
            );
            console.log('Login response received:', response);

            const tokens = response.data || response.tokenResponse || response.tokens || response.token || response;
            const accessToken = tokens?.access_token || tokens?.accessToken || (typeof tokens === 'string' ? tokens : null);
            const refreshToken = tokens?.refresh_token || tokens?.refreshToken;

            console.log('Extracted Access Token:', accessToken ? 'Present' : 'Missing');

            if (accessToken) {
                localStorage.setItem('auth_token', accessToken);
                if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
                this.token.set(accessToken);

                const decoded: any = this.decodeToken(accessToken);
                const userObj: User = {
                    username: response.username || decoded?.preferred_username || decoded?.sub || response.email || request.username,
                    email: response.email || decoded?.email,
                    firstName: response.firstName || decoded?.given_name || 'Utilisateur',
                    lastName: response.lastName || decoded?.family_name || '',
                    role: this.mapBackendRole(decoded?.realm_access?.roles || [])
                };

                console.log('Setting currentUser signal with:', userObj);
                this.currentUser.set(userObj);
                return response;
            } else {
                console.error('Login failed: Token missing in response structure', response);
                throw new Error(response.message || 'Jeton d\'accès introuvable dans la réponse du serveur.');
            }
        } catch (error) {
            console.error('Login service error:', error);
            throw error;
        }
    }

    refreshToken(): Observable<any> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return throwError(() => new Error('No refresh token available'));

        const params = new HttpParams().set('token', refreshToken);
        return this.http.post<any>(`${this.apiUrl}/refresh`, null, { params }).pipe(
            map(response => {
                const tokens = response.data || response;
                const newAccessToken = tokens.access_token || tokens.accessToken;
                const newRefreshToken = tokens.refresh_token || tokens.refreshToken;

                if (newAccessToken) {
                    localStorage.setItem('auth_token', newAccessToken);
                    this.token.set(newAccessToken);
                    if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken);
                    return newAccessToken;
                }
                throw new Error('Refresh failed - No access token in response');
            })
        );
    }

    logout() {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            const params = new HttpParams().set('refreshToken', refreshToken);
            // On tente de prévenir le backend, mais on déconnecte quand même localement
            this.http.post(`${this.apiUrl}/logout`, null, { params, responseType: 'text' }).subscribe({
                next: () => console.log('Backend logout success'),
                error: (err) => console.error('Logout error on backend', err)
            });
        }
        this.clearLocalSession();
    }

    private clearLocalSession() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        this.token.set(null);
        this.currentUser.set(null);
    }

    async registerPublic(request: any) {
        return firstValueFrom(
            this.http.post(`${this.apiUrl}/register-public`, request, { responseType: 'text' })
        );
    }

    // ── Password Reset ───────────────────────────────────────────────────────

    /**
     * Appelle le backend Spring pour envoyer l'email de reset
     */
    forgotPassword(emailOrUsername: string): Observable<any> {
        const params = new HttpParams().set('emailOrUsername', emailOrUsername);
        return this.http.post(
            `${this.apiUrl}/forgot-password`,
            null,
            { params, responseType: 'text' as 'json' }
        );
    }
    resetPasswordWithToken(token: string, newPassword: string): Observable<any> {
    return this.http.post(
        `${this.apiUrl}/reset-password-token`,
        { token, newPassword },
        { responseType: 'text' as 'json' }
    );
}
 

    /**
     * Cas 1 — Lien reçu par mail (action token Keycloak)
     * L'URL Angular reçoit ?key=TOKEN
     */
    resetPasswordWithKey(key: string, newPassword: string): Observable<any> {
        const body = new HttpParams()
            .set('key', key)
            .set('password-new', newPassword)
            .set('password-confirm', newPassword);

        return this.http.post(
            `${this.keycloakUrl}/realms/${this.realm}/login-actions/action-token`,
            body.toString(),
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
                responseType: 'text' as 'json'
            }
        );
    }

    /**
     * Cas 2 — Session active (session_code + execution params)
     * L'URL Angular reçoit ?session_code=...&execution=...&client_id=...&tab_id=...
     */
    resetPasswordWithSession(
        sessionCode: string,
        execution: string,
        clientId: string,
        tabId: string,
        newPassword: string
    ): Observable<any> {
        const params = new HttpParams()
            .set('session_code', sessionCode)
            .set('execution', execution)
            .set('client_id', clientId)
            .set('tab_id', tabId);

        const body = new HttpParams()
            .set('password-new', newPassword)
            .set('password-confirm', newPassword);

        return this.http.post(
            `${this.keycloakUrl}/realms/${this.realm}/login-actions/authenticate`,
            body.toString(),
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
                params,
                responseType: 'text' as 'json'
            }
        );
    }
}