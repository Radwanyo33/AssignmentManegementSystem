// src/services/class.service.ts
import { api } from './api';
import { Class } from '@/types';

export const classService = {
    async getClasses(): Promise<Class[]> {
        const response = await api.get<Class[]>('/classes');
        return response.data;
    },

    async getClass(id: number): Promise<Class> {
        const response = await api.get<Class>(`/classes/${id}`);
        return response.data;
    },

    async createClass(data: any): Promise<Class> {
        const response = await api.post<Class>('/classes', data);
        return response.data;
    },

    async updateClass(id: number, data: any): Promise<Class> {
        const response = await api.put<Class>(`/classes/${id}`, data);
        return response.data;
    },

    async deleteClass(id: number): Promise<void> {
        await api.delete(`/classes/${id}`);
    },
};