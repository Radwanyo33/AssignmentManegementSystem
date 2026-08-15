'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { classService } from '@/services/class.service';
import { Class } from '@/types';

export default function ClassManagement() {
    const router = useRouter(); 
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        teacherId: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await classService.getClasses();
            setClasses(data);
        } catch (error: any) {
            console.error('Failed to load classes:', error);
            setError(error?.response?.data || 'Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            teacherId: '',
        });
        setEditingClass(null);
        setError(null);
        setSuccess(null);
        setSubmitting(false);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    // ✅ Updated: Navigate to edit page instead of opening modal
    const handleEdit = (cls: Class) => {
        router.push(`/admin/classes/${cls.id}/edit`);
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

            // ✅ This is for creating new class only
            await classService.createClass(payload);
            setSuccess('Class created successfully!');
            await loadClasses();

            setTimeout(() => {
                setShowModal(false);
                resetForm();
            }, 1500);

        } catch (error: any) {
            console.error('Failed to create class:', error);
            setError(error?.response?.data || error?.message || 'Failed to create class');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this class?')) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await classService.deleteClass(id);
            setSuccess('Class deleted successfully!');
            await loadClasses();
        } catch (error: any) {
            console.error('Failed to delete class:', error);
            setError(error?.response?.data || 'Failed to delete class');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout requiredRole="Admin">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Class Management</h2>
                            <p className="text-sm text-gray-500">Manage classes and their assigned teachers</p>
                        </div>
                        <button
                            onClick={() => router.push('/admin/classes/add')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Class
                        </button>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                            <div className="flex">
                                <div className="shrink-0">
                                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="ml-auto shrink-0"
                                >
                                    <svg className="h-5 w-5 text-red-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
                            <div className="flex">
                                <div className="shrink-0">
                                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">{success}</p>
                                </div>
                                <button
                                    onClick={() => setSuccess(null)}
                                    className="ml-auto shrink-0"
                                >
                                    <svg className="h-5 w-5 text-green-400 hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Classes List */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-xl text-gray-500">Loading classes...</div>
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="bg-white shadow sm:rounded-lg p-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No classes</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new class.</p>
                            <div className="mt-6">
                                <button
                                    onClick={openCreateModal}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New Class
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {classes.map((cls) => (
                                    <li key={cls.id} className="hover:bg-gray-50 transition-colors">
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {cls.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {cls.description || 'No description'}
                                                    </p>
                                                    {cls.teacherId && (
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Teacher ID: {cls.teacherId}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-3 ml-4 shrink-0">
                                                    {/* ✅ Updated: Navigate to edit page */}
                                                    <button
                                                        onClick={() => handleEdit(cls)}
                                                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cls.id)}
                                                        className="text-red-600 hover:text-red-900 font-medium text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500 border-t border-gray-200">
                                Total: {classes.length} class{classes.length !== 1 ? 'es' : ''}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Only for Create New Class */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div 
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                            onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}
                        />

                        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Add New Class
                                        </h3>
                                        
                                        {error && (
                                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                                                {error}
                                            </div>
                                        )}
                                        
                                        {success && (
                                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-600 text-sm">
                                                {success}
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Class Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="e.g., Class 10A"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Description
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="Class description (optional)"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Teacher ID
                                                </label>
                                                <input
                                                    type="number"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={formData.teacherId}
                                                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                                    placeholder="Enter teacher ID (optional)"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">Enter the ID of the teacher assigned to this class</p>
                                            </div>

                                            <div className="flex justify-end space-x-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowModal(false);
                                                        resetForm();
                                                    }}
                                                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                                >
                                                    {submitting ? 'Creating...' : 'Create Class'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}