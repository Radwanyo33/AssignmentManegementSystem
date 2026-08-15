'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { classService } from '@/services/class.service';

export default function AddClass() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        teacherId: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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

            await classService.createClass(payload);
            setSuccess('Class created successfully!');

            setTimeout(() => {
                router.push('/admin/classes');
            }, 1500);

        } catch (error: any) {
            console.error('Failed to create class:', error);
            setError(error?.response?.data || error?.message || 'Failed to create class');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout requiredRole="Admin">
            <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Add New Class</h2>
                            <p className="text-sm text-gray-500">Create a new class</p>
                        </div>
                        <button
                            onClick={() => router.push('/admin/classes')}
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
                                {submitting ? 'Creating...' : 'Create Class'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}