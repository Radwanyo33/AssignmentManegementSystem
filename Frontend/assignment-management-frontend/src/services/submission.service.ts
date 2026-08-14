import { api } from './api';
import { Submission, CreateSubmissionDto, GradeSubmissionDto } from '@/types';

export const submissionService = {
  async getSubmissions(assignmentId?: number): Promise<Submission[]> {
    const params = assignmentId ? `?assignmentId=${assignmentId}` : '';
    const response = await api.get<Submission[]>(`/submissions${params}`);
    return response.data;
  },

  async getMySubmissions(): Promise<Submission[]> {
    const response = await api.get<Submission[]>('/submissions/my-submissions');
    return response.data;
  },

  async getSubmission(id: number): Promise<Submission> {
    const response = await api.get<Submission>(`/submissions/${id}`);
    return response.data;
  },

  async createSubmission(data: CreateSubmissionDto): Promise<Submission> {
    const response = await api.post<Submission>('/submissions', data);
    return response.data;
  },

  async gradeSubmission(id: number, data: GradeSubmissionDto): Promise<Submission> {
    const response = await api.put<Submission>(`/submissions/${id}/grade`, data);
    return response.data;
  },

  async deleteSubmission(id: number): Promise<void> {
    await api.delete(`/submissions/${id}`);
  },
};