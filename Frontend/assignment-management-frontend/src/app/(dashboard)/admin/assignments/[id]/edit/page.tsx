'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { assignmentService } from '@/services/assignment.service';
import { classService } from '@/services/class.service';
import { subjectService } from '@/services/subject.service';
import { AssignmentDto, Class, Subject, AssignmentPayload } from '@/types';

export const dynamic = 'force-dynamic';

export default function AdminEditAssignment() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [assignmentDto, setAssignmentDto] = useState<AssignmentDto | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        maxMarks: 100,
        isPublished: false,
        classId: '',
        subjectId: '',
    });

    useEffect(() => {
        setIsMounted(true);
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const [assignmentData, classesData, subjectsData] = await Promise.all([
                assignmentService.getAssignment(id),
                classService.getClasses(),
                subjectService.getSubjects(),
            ]);

            setAssignmentDto(assignmentData);
            setClasses(classesData);
            setSubjects(subjectsData);

            // ✅ Derive classId and subjectId from names
            const classMatch = classesData.find(c => c.name === assignmentData.className);
            const subjectMatch = subjectsData.find(s => s.name === assignmentData.subjectName);

            setFormData({
                title: assignmentData.title || '',
                description: assignmentData.description || '',
                deadline: new Date(assignmentData.deadline).toISOString().slice(0, 16),
                maxMarks: assignmentData.maxMarks || 100,
                isPublished: assignmentData.isPublished || false,
                classId: classMatch?.id?.toString() || '',
                subjectId: subjectMatch?.id?.toString() || '',
            });
        } catch (error: any) {
            console.error('Failed to load data:', error);
            setError(error?.response?.data || 'Failed to load assignment');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const payload: AssignmentPayload = {
                title: formData.title,
                description: formData.description,
                deadline: new Date(formData.deadline).toISOString(),
                maxMarks: parseInt(formData.maxMarks.toString()),
                isPublished: formData.isPublished,
                classId: parseInt(formData.classId),
                subjectId: parseInt(formData.subjectId),
            };

            await assignmentService.updateAssignment(id, payload);
            router.push(`/admin/assignments/${id}`);
        } catch (error: any) {
            console.error('Failed to update assignment:', error);
            setError(error?.response?.data || 'Failed to update assignment');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isMounted || loading) {
        return (
            <DashboardLayout requiredRole="Admin">
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl text-gray-500">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !assignmentDto) {
        return (
            <DashboardLayout requiredRole="Admin">
                <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <p className="text-red-600 font-medium">{error || 'Assignment not found'}</p>
                            <button
                                onClick={() => router.push('/admin/assignments')}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Back to Assignments
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout requiredRole="Admin">
            <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Edit Assignment</h2>
                        <button
                            onClick={() => router.push(`/admin/assignments/${id}`)}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                required
                                rows={4}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Class and Subject */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
                                    Class *
                                </label>
                                <select
                                    id="classId"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.classId}
                                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                >
                                    <option value="">Select a class</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700">
                                    Subject *
                                </label>
                                <select
                                    id="subjectId"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.subjectId}
                                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                >
                                    <option value="">Select a subject</option>
                                    {subjects
                                        .filter(s => formData.classId ? s.classId === parseInt(formData.classId) : true)
                                        .map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        {/* Deadline and Max Marks */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                                    Deadline *
                                </label>
                                <input
                                    type="datetime-local"
                                    id="deadline"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="maxMarks" className="block text-sm font-medium text-gray-700">
                                    Maximum Marks *
                                </label>
                                <input
                                    type="number"
                                    id="maxMarks"
                                    required
                                    min="1"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.maxMarks}
                                    onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Published checkbox */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isPublished"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={formData.isPublished}
                                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            />
                            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                                Published
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => router.push(`/admin/assignments/${id}`)}
                                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {submitting ? 'Updating...' : 'Update Assignment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}