'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { classService } from '@/services/class.service';
import { Class } from '@/types';

export const dynamic = 'force-dynamic';

export default function EditClassPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [classData, setClassData] = useState<Class | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        teacherId: '',
    });

    useEffect(() => {
        setIsMounted(true);
        loadClass();
    }, [id]);

    const loadClass = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await classService.getClass(id);
            setClassData(data);
            setFormData({
                name: data.name || '',
                description: data.description || '',
                teacherId: data.teacherId?.toString() || '',
            });
        } catch (error: any) {
            console.error('Failed to load class:', error);
            setError(error?.response?.data || 'Failed to load class');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Class name is required');
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                teacherId: formData.teacherId ? parseInt(formData.teacherId) : null,
            };

            await classService.updateClass(id, payload);
            setSuccess('Class updated successfully!');

            setTimeout(() => {
                router.push('/admin/classes');
            }, 1500);

        } catch (error: any) {
            console.error('Failed to update class:', error);
            setError(error?.response?.data || error?.message || 'Failed to update class');
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

    if (error || !classData) {
        return (
            <DashboardLayout requiredRole="Admin">
                <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <p className="text-red-600 font-medium">{error || 'Class not found'}</p>
                            <button
                                onClick={() => router.push('/admin/classes')}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Back to Classes
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
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Edit Class</h2>
                            <p className="text-sm text-gray-500">Update class details</p>
                        </div>
                        <button
                            onClick={() => router.push('/admin/classes')}
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

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Class Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Class 10A"
                            />
                        </div>

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
                                placeholder="Class description (optional)"
                            />
                        </div>

                        <div>
                            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">
                                Teacher ID
                            </label>
                            <input
                                type="number"
                                id="teacherId"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.teacherId}
                                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                placeholder="Enter teacher ID (optional)"
                            />
                            <p className="mt-1 text-xs text-gray-500">Enter the ID of the teacher assigned to this class</p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/classes')}
                                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {submitting ? 'Updating...' : 'Update Class'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}