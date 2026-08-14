'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { assignmentService } from '@/services/assignment.service';
import { Assignment } from '@/types';
import { useRouter } from 'next/navigation';

// Prevent static generation
export const dynamic = 'force-dynamic';

export default function TeacherDashboard() {
    const router = useRouter();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        try {
            const data = await assignmentService.getAssignments();
            setAssignments(data);
        } catch (error) {
            console.error('Failed to load assignments: ', error);
        } finally {
            setLoading(false);
        }
    };

    // Use router
    const handleCreateAssignment = () => {
        router.push('/teacher/assignments/new');
    };

    if (!isMounted) {
        return null;
    }

    return (
        <DashboardLayout requiredRole="Teacher">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h2>
                        <button
                            onClick={handleCreateAssignment}  // ✅ FIXED: Use router
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Create Assignment
                        </button>
                    </div>
                    {loading ? (
                        <div className="text-center py-12">Loading....</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Assignments</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{assignments.length}</dd>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                        {assignments.filter(a => a.isPublished).length}
                                    </dd>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                        {assignments.reduce((sum, a) => sum + a.submissionCount, 0)}
                                    </dd>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Assignments</h3>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {assignments.slice(0, 5).map((assignment) => (
                                    <li key={assignment.id}>
                                        <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-indigo-600 truncate">
                                                    {assignment.title}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {assignment.className} - {assignment.subjectName}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${assignment.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {assignment.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {assignment.submissionCount} Submission{assignment.submissionCount !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}