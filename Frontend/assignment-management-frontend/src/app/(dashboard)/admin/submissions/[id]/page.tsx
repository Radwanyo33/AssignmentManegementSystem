'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { submissionService } from '@/services/submission.service';
import { assignmentService } from '@/services/assignment.service';
import { Submission, AssignmentDto } from '@/types';

export const dynamic = 'force-dynamic';

export default function AdminSubmissionDetail() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);

    const [submission, setSubmission] = useState<Submission | null>(null);
    const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [grading, setGrading] = useState({ marks: 0, feedback: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const submissionData = await submissionService.getSubmission(id);
            setSubmission(submissionData);
            
            // Load the assignment details
            if (submissionData.assignmentId) {
                const assignmentData = await assignmentService.getAssignment(submissionData.assignmentId);
                setAssignment(assignmentData);
            }
            
            // Set grading state
            setGrading({
                marks: submissionData.marks || 0,
                feedback: submissionData.feedback || '',
            });
        } catch (error: any) {
            console.error('Failed to load data:', error);
            setError(error?.response?.data || 'Failed to load submission details');
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async () => {
        if (grading.marks === undefined || grading.marks === null) {
            alert('Please enter marks');
            return;
        }

        if (assignment && grading.marks > assignment.maxMarks) {
            alert(`Marks cannot exceed maximum marks (${assignment.maxMarks})`);
            return;
        }

        if (grading.marks < 0) {
            alert('Marks cannot be negative');
            return;
        }

        setSubmitting(true);
        
        try {
            await submissionService.gradeSubmission(id, {
                marks: grading.marks,
                feedback: grading.feedback || '',
            });
            await loadData();
            alert('Submission graded successfully!');
        } catch (error: any) {
            console.error('Failed to grade submission:', error);
            alert(error?.response?.data || 'Failed to grade submission');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this submission?')) {
            try {
                await submissionService.deleteSubmission(id);
                router.push(`/admin/assignments/${submission?.assignmentId}`);
            } catch (error: any) {
                alert(error?.response?.data || 'Failed to delete submission');
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

    if (error || !submission) {
        return (
            <DashboardLayout requiredRole="Admin">
                <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <p className="text-red-600 font-medium">{error || 'Submission not found'}</p>
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

    const isGraded = submission.status === 'Graded';

    return (
        <DashboardLayout requiredRole="Admin">
            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Submission Details</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Assignment: {submission.assignmentTitle}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push(`/admin/assignments/${submission.assignmentId}`)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                            >
                                Back to Assignment
                            </button>
                            {!isGraded && (
                                <button
                                    onClick={handleGrade}
                                    disabled={submitting}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                                >
                                    {submitting ? 'Grading...' : 'Grade Submission'}
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Student Information */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{submission.studentName}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Student ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{submission.studentId}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Assignment</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        <Link 
                                            href={`/admin/assignments/${submission.assignmentId}`}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            {submission.assignmentTitle}
                                        </Link>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            submission.status === 'Graded' ? 'bg-green-100 text-green-800' :
                                            submission.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {submission.status}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Submitted At</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(submission.submittedAt).toLocaleString()}
                                    </dd>
                                </div>
                                {submission.updatedAt && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {new Date(submission.updatedAt).toLocaleString()}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>

                    {/* Answer */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg font-medium text-gray-900">Student Answer</h3>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                    {submission.answer || 'No answer provided'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Grade Section */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg font-medium text-gray-900">
                                {isGraded ? 'Grade & Feedback' : 'Grade Submission'}
                            </h3>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            {isGraded ? (
                                // Display grade if already graded
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Marks</dt>
                                            <dd className="mt-1 text-lg font-semibold text-gray-900">
                                                {submission.marks} / {assignment?.maxMarks || 'N/A'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Percentage</dt>
                                            <dd className="mt-1 text-lg font-semibold text-gray-900">
                                                {assignment && submission.marks !== undefined 
                                                    ? `${((submission.marks / assignment.maxMarks) * 100).toFixed(1)}%` 
                                                    : 'N/A'}
                                            </dd>
                                        </div>
                                    </div>
                                    {submission.feedback && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Feedback</dt>
                                            <dd className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-lg p-4">
                                                {submission.feedback}
                                            </dd>
                                        </div>
                                    )}
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => router.push(`/admin/assignments/${submission.assignmentId}`)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                                        >
                                            Back to Assignment
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Grade form if not graded
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Marks (max: {assignment?.maxMarks || 'N/A'})
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={assignment?.maxMarks}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={grading.marks}
                                                onChange={(e) => setGrading({ ...grading, marks: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Percentage
                                            </label>
                                            <div className="mt-1 text-sm text-gray-500">
                                                {assignment && grading.marks 
                                                    ? `${((grading.marks / assignment.maxMarks) * 100).toFixed(1)}%` 
                                                    : '0%'}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Feedback
                                        </label>
                                        <textarea
                                            rows={4}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={grading.feedback}
                                            onChange={(e) => setGrading({ ...grading, feedback: e.target.value })}
                                            placeholder="Provide feedback to the student..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleGrade}
                                            disabled={submitting}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                                        >
                                            {submitting ? 'Grading...' : 'Submit Grade'}
                                        </button>
                                        <button
                                            onClick={() => router.push(`/admin/assignments/${submission.assignmentId}`)}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}