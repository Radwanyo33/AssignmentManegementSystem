// src/app/(dashboard)/admin/subjects/add/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { subjectService } from '@/services/subject.service';
import { classService } from '@/services/class.service';
import { userService } from '@/services/user.service';
import { Class, User } from '@/types';

export default function AddSubject() {
    const router = useRouter();
    const [classes, setClasses] = useState<Class[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        classId: '',
        teacherId: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [classesData, usersData] = await Promise.all([
                classService.getClasses(),
                userService.getUsers(),
            ]);
            setClasses(classesData);
            // Filter only teachers
            setTeachers(usersData.filter(u => u.role === 'Teacher'));
        } catch (error) {
            console.error('Failed to load data:', error);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Subject name is required');
            return;
        }

        if (!formData.classId) {
            setError('Please select a class');
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                name: formData.name.trim(),
                code: formData.code.trim() || null,
                description: formData.description.trim() || null,
                classId: parseInt(formData.classId),
                teacherId: formData.teacherId ? parseInt(formData.teacherId) : null,
            };

            await subjectService.createSubject(payload);
            setSuccess('Subject created successfully!');

            setTimeout(() => {
                router.push('/admin/subjects');
            }, 1500);

        } catch (error: any) {
            console.error('Failed to create subject:', error);
            setError(error?.response?.data || error?.message || 'Failed to create subject');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout requiredRole="Admin">
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl text-gray-500">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout requiredRole="Admin">
            <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Add New Subject</h2>
                            <p className="text-sm text-gray-500">Create a new subject</p>
                        </div>
                        <button
                            onClick={() => router.push('/admin/subjects')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
                            <p className="text-sm text-green-700">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                        {/* Subject Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Subject Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Mathematics"
                            />
                        </div>

                        {/* Subject Code */}
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Subject Code
                            </label>
                            <input
                                type="text"
                                id="code"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g., MATH101"
                            />
                            <p className="mt-1 text-xs text-gray-500">Unique code for the subject (optional)</p>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Subject description (optional)"
                            />
                        </div>

                        {/* Class */}
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

                        {/* Teacher - NEW FIELD */}
                        <div>
                            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">
                                Teacher
                            </label>
                            <select
                                id="teacherId"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.teacherId}
                                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                            >
                                <option value="">Select a teacher (optional)</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.fullName}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Assign a teacher to this subject (optional)</p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/subjects')}
                                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {submitting ? 'Creating...' : 'Create Subject'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}