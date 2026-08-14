import { api } from './api';
import { AssignmentDto, Assignment, AssignmentPayload, Class, Subject } from '@/types';

export const assignmentService = {
    async getAssignments(): Promise<AssignmentDto[]> {
        const response = await api.get<AssignmentDto[]>('/assignments');
        return response.data;
    },

    async getAssignment(id: number): Promise<AssignmentDto> {
        const response = await api.get<AssignmentDto>(`/assignments/${id}`);
        return response.data;
    },

    async createAssignment(data: AssignmentPayload): Promise<AssignmentDto> {
        const response = await api.post<AssignmentDto>('/assignments', data);
        return response.data;
    },

    async updateAssignment(id: number, data: AssignmentPayload): Promise<AssignmentDto> {
        const response = await api.put<AssignmentDto>(`/assignments/${id}`, data);
        return response.data;
    },

    async deleteAssignment(id: number): Promise<void> {
        await api.delete(`/assignments/${id}`);
    },

    async publishAssignment(id: number): Promise<void> {
        await api.post(`/assignments/${id}/publish`);
    },

    async getFullAssignment(id: number, classes: Class[], subjects: Subject[]): Promise<Assignment> {
        const dto = await this.getAssignment(id);

        const classMatch = classes.find(c => c.name === dto.className);
        const subjectMatch = subjects.find(s => s.name === dto.subjectName);

        return {
            ...dto,
            classId: classMatch?.id || 0,
            subjectId: subjectMatch?.id || 0,
            teacherId: 0,
        };
    }
};