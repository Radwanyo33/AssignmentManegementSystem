'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { assignmentService } from '@/services/assignment.service';
import { AssignmentDto } from '@/types';

export const dynamic = 'force-dynamic';

export default function AdminAssignments() {
    const [assignments, setAssignments] = useState<AssignmentDto[]>([]);
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
            console.error('Failed to load assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await assignmentService.deleteAssignment(id);
                await loadAssignments();
                alert('Assignment deleted successfully');
            } catch (error: any) {
                console.error('Failed to delete assignment:', error);
                alert(error?.response?.data || 'Failed to delete assignment');
            }
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

    return (
        <DashboardLayout requiredRole="Admin">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">All Assignments</h2>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        {assignments.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No assignments found.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {assignments.map((assignment) => (
                                    <li key={assignment.id}>
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                                        {assignment.title}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                                        <span className="text-sm text-gray-500">
                                                            {assignment.className} - {assignment.subjectName}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            Teacher: {assignment.teacherName}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {assignment.submissionCount} submissions
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            assignment.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {assignment.isPublished ? 'Published' : 'Draft'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <Link
                                                        href={`/admin/assignments/${assignment.id}`}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                                    >
                                                        View
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(assignment.id)}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}