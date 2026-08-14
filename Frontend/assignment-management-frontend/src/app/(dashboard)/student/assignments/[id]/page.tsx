'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { assignmentService } from '@/services/assignment.service';
import { submissionService } from '@/services/submission.service';
import { AssignmentDto, Submission } from '@/types';

export const dynamic = 'force-dynamic';

export default function StudentAssignmentDetails() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);

    const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const assignmentData = await assignmentService.getAssignment(id);
            setAssignment(assignmentData);

            const submissionsData = await submissionService.getMySubmissions();
            const existingSubmission = submissionsData.find(s => s.assignmentId === id);
            if (existingSubmission) {
                setSubmission(existingSubmission);
                setAnswer(existingSubmission.answer || '');
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            setError('Failed to load assignment');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim()) {
            setError('Please provide an answer');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await submissionService.createSubmission({
                assignmentId: id,
                answer: answer.trim(),
            });
            router.push('/student/assignments');
        } catch (err: any) {
            setError(err.response?.data || 'Failed to submit assignment');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isMounted || loading) {
        return (
            <DashboardLayout requiredRole="Student">
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl text-gray-500">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (!assignment) {
        return (
            <DashboardLayout requiredRole="Student">
                <div className="text-center py-12">
                    <p className="text-xl text-gray-500">Assignment not found</p>
                </div>
            </DashboardLayout>
        );
    }

    const isDeadlinePassed = new Date(assignment.deadline) < new Date();
    const canSubmit = assignment.isPublished && !isDeadlinePassed;
    const isGraded = submission?.status === 'Graded';

    return (
        <DashboardLayout requiredRole="Student">
            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {assignment.title}
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                                <span>Class: {assignment.className || 'N/A'}</span>
                                <span>Subject: {assignment.subjectName}</span>
                                <span>Teacher: {assignment.teacherName}</span>
                                <span>Max Marks: {assignment.maxMarks}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                        {assignment.description || 'No description provided'}
                                    </dd>
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
                            </dl>
                        </div>

                        {submission && (
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <h4 className="text-md font-medium text-gray-900 mb-3">Your Submission</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.answer}</p>
                                    <div className="mt-3 flex items-center gap-4">
                                        <span className="text-sm text-gray-500">
                                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                        </span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            submission.status === 'Graded' ? 'bg-green-100 text-green-800' :
                                            submission.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {submission.status}
                                        </span>
                                        {submission.marks !== undefined && (
                                            <span className="text-sm font-medium text-gray-900">
                                                Marks: {submission.marks}/{assignment.maxMarks}
                                            </span>
                                        )}
                                    </div>
                                    {submission.feedback && (
                                        <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                                            <p className="text-sm font-medium text-gray-700">Feedback:</p>
                                            <p className="text-sm text-gray-600 mt-1">{submission.feedback}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {isGraded && (
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">This assignment has been graded.</p>
                                    <p className="text-lg font-medium text-gray-900 mt-1">
                                        Score: {submission?.marks}/{assignment.maxMarks}
                                    </p>
                                </div>
                            </div>
                        )}

                        {!isGraded && canSubmit && (
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
                                            Your Answer *
                                        </label>
                                        <textarea
                                            id="answer"
                                            rows={6}
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Write your answer here..."
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            disabled={!!submission && isDeadlinePassed}
                                        />
                                    </div>

                                    {error && (
                                        <div className="mt-4 text-red-600 text-sm">{error}</div>
                                    )}

                                    <div className="mt-4 flex justify-between items-center">
                                        <p className="text-sm text-gray-500">
                                            {submission ? 'Update your submission before the deadline' : 'Submit your answer'}
                                        </p>
                                        <button
                                            type="submit"
                                            disabled={submitting || isDeadlinePassed}
                                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            {submitting ? 'Submitting...' : submission ? 'Update Submission' : 'Submit Answer'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {!canSubmit && !isGraded && (
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <div className="text-center text-gray-500">
                                    {!assignment.isPublished ? (
                                        <p>This assignment is not yet available for submission.</p>
                                    ) : isDeadlinePassed ? (
                                        <p>The deadline for this assignment has passed.</p>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}