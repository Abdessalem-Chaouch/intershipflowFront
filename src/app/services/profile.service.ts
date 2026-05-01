import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';

export interface ProfileResponseDto {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    photoUrl?: string;
    cin?: string;
    phone?: string;
    address?: string;
    bio?: string;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    cin?: string;
    phone?: string;
    address?: string;
    bio?: string;
}

export interface UpdatePasswordRequest {
    oldPassword?: string;
    newPassword?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/profile';

    getProfile(): Observable<ProfileResponseDto> {
        return this.http.get<ProfileResponseDto>(this.apiUrl);
    }

    async updateProfile(data: UpdateProfileRequest, file?: File): Promise<ProfileResponseDto> {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        if (file) {
            formData.append('file', file);
        }

        return firstValueFrom(
            this.http.patch<ProfileResponseDto>(this.apiUrl, formData)
        );
    }

    deleteProfilePhoto(): Observable<any> {
        return this.http.delete(`${this.apiUrl}/photo`);
    }

    updatePassword(request: UpdatePasswordRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/change-password`, request);
    }
}
