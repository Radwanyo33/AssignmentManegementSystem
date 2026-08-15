// src/app/(dashboard)/admin/subjects/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { subjectService } from '@/services/subject.service';
import { classService } from '@/services/class.service';
import { Subject, Class } from '@/types';

export default function SubjectManagement() {
    const router = useRouter();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [subjectsData, classesData] = await Promise.all([
                subjectService.getSubjects(selectedClassId ? parseInt(selectedClassId) : undefined),
                classService.getClasses(),
            ]);
            setSubjects(subjectsData);
            setClasses(classesData);
        } catch (error: any) {
            console.error('Failed to load data:', error);
            setError(error?.response?.data || 'Failed to load subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = async (classId: string) => {
        setSelectedClassId(classId);
        setLoading(true);
        try {
            const data = await subjectService.getSubjects(classId ? parseInt(classId) : undefined);
            setSubjects(data);
        } catch (error: any) {
            console.error('Failed to filter subjects:', error);
            setError(error?.response?.data || 'Failed to filter subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await subjectService.deleteSubject(id);
            setSuccess('Subject deleted successfully!');
            await loadData();
        } catch (error: any) {
            console.error('Failed to delete subject:', error);
            setError(error?.response?.data || 'Failed to delete subject');
        } finally {
            setLoading(false);
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
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Subject Management</h2>
                            <p className="text-sm text-gray-500">Manage subjects and their assigned classes</p>
                        </div>
                        <button
                            onClick={() => router.push('/admin/subjects/add')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Subject
                        </button>
                    </div>

                    {/* Filter by Class */}
                    <div className="mb-6 flex flex-wrap items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Filter by Class:</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">All Classes</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => handleFilterChange('')}
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                        >
                            Clear Filter
                        </button>
                    </div>

                    {/* Messages */}
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

                    {/* Subjects List */}
                    {subjects.length === 0 ? (
                        <div className="bg-white shadow sm:rounded-lg p-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new subject.</p>
                            <button
                                onClick={() => router.push('/admin/subjects/add')}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Add New Subject
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {subjects.map((subject) => (
                                    <li key={subject.id} className="hover:bg-gray-50 transition-colors">
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {subject.name}
                                                        {subject.code && (
                                                            <span className="text-sm text-gray-500 ml-2">({subject.code})</span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{subject.description || 'No description'}</p>
                                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                                        <span className="text-xs text-gray-400">
                                                            Class: {subject.className || 'Not assigned'}
                                                        </span>
                                                        {subject.teacherName && (
                                                            <span className="text-xs text-gray-400">
                                                                | Teacher: {subject.teacherName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => router.push(`/admin/subjects/${subject.id}/edit`)}
                                                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(subject.id)}
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
                                Total: {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
                                {selectedClassId && ` (Filtered by class)`}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}