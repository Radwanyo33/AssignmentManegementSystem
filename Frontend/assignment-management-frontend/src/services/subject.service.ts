import { api } from './api';
import { Subject } from '@/types';

export const subjectService = {
  async getSubjects(classId?: number): Promise<Subject[]> {
    const params = classId ? `?classId=${classId}` : '';
    const response = await api.get<Subject[]>(`/subjects${params}`);
    return response.data;
  },

  async getSubject(id: number): Promise<Subject> {
    const response = await api.get<Subject>(`/subjects/${id}`);
    return response.data;
  },

  async createSubject(data: any): Promise<Subject> {
    const response = await api.post<Subject>('/subjects', data);
    return response.data;
  },

  async updateSubject(id: number, data: any): Promise<Subject> {
    const response = await api.put<Subject>(`/subjects/${id}`, data);
    return response.data;
  },

  async deleteSubject(id: number): Promise<void> {
    await api.delete(`/subjects/${id}`);
  },
};