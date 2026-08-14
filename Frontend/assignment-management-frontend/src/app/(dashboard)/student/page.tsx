'use client';

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { assignmentService } from "@/services/assignment.service";
import { submissionService } from "@/services/submission.service";
import { Assignment, Submission } from "@/types";

// prevent static generation
export const dynamic = 'force-dynamic';

export default function StudentDashboard() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);  // ✅ Start with true
    const [isMounted, setIsMounted] = useState(false);  // ✅ Add isMounted

    useEffect(() => {
        setIsMounted(true);
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [assignmentsData, submissionsData] = await Promise.all([
                assignmentService.getAssignments(),
                submissionService.getMySubmissions(),
            ]);
            setAssignments(assignmentsData);
            setSubmissions(submissionsData);
        } catch (error) {
            console.error("Failed to load data...", error);
        } finally {
            setLoading(false);
        }
    };
    if (!isMounted) {
        return null;
    }

    return (
        <DashboardLayout requiredRole="Student">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Dashboard</h2>

                    {loading ? (
                        <div className="text-center py-12">Loading....</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Assignments</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                            {assignments.filter(a => a.isPublished).length}
                                        </dd>
                                    </div>
                                </div>
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">Submitted</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                            {submissions.filter(s => s.status === 'Submitted').length}
                                        </dd>
                                    </div>
                                </div>
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">Graded</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                            {submissions.filter(s => s.status === 'Graded').length}
                                        </dd>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">My Submissions</h3>
                                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul className="divide-y divide-gray-200">
                                        {submissions.slice(0, 5).map((submission) => (
                                            <li key={submission.id}>
                                                <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-indigo-600 truncate">
                                                            {submission.assignmentTitle}
                                                        </p>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                                                        </p>
                                                        {submission.marks !== undefined && (
                                                            <p className="mt-1 text-sm text-gray-900 font-medium">
                                                                Marks: {submission.marks}
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
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}