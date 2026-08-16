import { api } from './api';
import { LoginRequest, AuthResponse } from '@/types';

//Helper to safely access localStorage
const isBrowser = () => typeof window !== 'undefined';

export const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', data);

        if (response.data.token && isBrowser()) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Add the register method
    async register(data : {
        email: string;
        fullName: string;
        password: string;
        role: string;
    }) : Promise<any>{
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    logout(): void {
        if (isBrowser()) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    },

    getCurrentUser() {
        //Check if running in browser
        if (!isBrowser()) {
            return null;
        }
        
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                return JSON.parse(userStr);
            }
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
        }
        return null;
    },

    getToken(): string | null {
        if (!isBrowser()) {
            return null;
        }
        return localStorage.getItem('token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    },
};