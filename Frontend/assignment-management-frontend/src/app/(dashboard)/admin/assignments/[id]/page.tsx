'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { assignmentService } from '@/services/assignment.service';
import { submissionService } from '@/services/submission.service';
import { AssignmentDto, Submission } from '@/types';

export const dynamic = 'force-dynamic';

export default function AdminAssignmentDetail() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);

    const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const [assignmentData, submissionsData] = await Promise.all([
                assignmentService.getAssignment(id),
                submissionService.getSubmissions(id),
            ]);
            
            setAssignment(assignmentData);
            setSubmissions(submissionsData);
        } catch (error: any) {
            console.error('Failed to load data:', error);
            setError(error?.response?.data || 'Failed to load assignment details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await assignmentService.deleteAssignment(id);
                router.push('/admin/assignments');
            } catch (error: any) {
                alert(error?.response?.data || 'Failed to delete assignment');
            }
        }
    };

    const handlePublish = async () => {
        try {
            await assignmentService.publishAssignment(id);
            await loadData();
            alert('Assignment published successfully!');
        } catch (error: any) {
            alert(error?.response?.data || 'Failed to publish assignment');
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

    if (error || !assignment) {
        return (
            <DashboardLayout requiredRole="Admin">
                <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
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

    const isDeadlinePassed = new Date(assignment.deadline) < new Date();

    return (
        <DashboardLayout requiredRole="Admin">
            <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900">{assignment.title}</h2>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    assignment.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {assignment.isPublished ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Created: {new Date(assignment.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {!assignment.isPublished && (
                                <button
                                    onClick={handlePublish}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                >
                                    Publish
                                </button>
                            )}
                            <Link
                                href={`/admin/assignments/${assignment.id}/edit`}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => router.push('/admin/assignments')}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                            >
                                Back
                            </button>
                        </div>
                    </div>

                    {/* Assignment Details */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg font-medium text-gray-900">Assignment Details</h3>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Title</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{assignment.title}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Class</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{assignment.className}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Subject</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{assignment.subjectName}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Teacher</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{assignment.teacherName}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Max Marks</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{assignment.maxMarks}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(assignment.deadline).toLocaleString()}
                                        {isDeadlinePassed && (
                                            <span className="ml-2 text-red-600 font-medium">(Passed)</span>
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {assignment.isPublished ? 'Published' : 'Draft'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Total Submissions</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{submissions.length}</dd>
                                </div>
                            </dl>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                {assignment.description || 'No description provided'}
                            </dd>
                        </div>
                    </div>

                    {/* Submissions List */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Submissions</h3>
                            <span className="text-sm text-gray-500">{submissions.length} total</span>
                        </div>
                        <div className="border-t border-gray-200">
                            {submissions.length === 0 ? (
                                <div className="px-4 py-12 text-center text-gray-500">
                                    No submissions yet for this assignment.
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {submissions.map((submission) => (
                                        <li key={submission.id}>
                                            <div className="px-4 py-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {submission.studentName}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                                        </p>
                                                        {submission.status === 'Graded' && submission.marks !== undefined && (
                                                            <p className="text-sm font-medium text-gray-900">
                                                                Marks: {submission.marks}/{assignment.maxMarks}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            submission.status === 'Graded' ? 'bg-green-100 text-green-800' :
                                                            submission.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {submission.status}
                                                        </span>
                                                        <Link
                                                            href={`/admin/submissions/${submission.id}`}
                                                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                                                        >
                                                            View Details
                                                        </Link>
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
            </div>
        </DashboardLayout>
    );
}