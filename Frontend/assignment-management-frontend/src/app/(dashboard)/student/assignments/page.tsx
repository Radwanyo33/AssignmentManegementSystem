'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { assignmentService } from '@/services/assignment.service';
import { submissionService } from '@/services/submission.service';
import { Assignment, Submission } from '@/types';
import Link from 'next/link';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionForAssignment = (assignmentId: number) => {
    return submissions.find(s => s.assignmentId === assignmentId);
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="Student">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="Student">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Assignments</h2>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {assignments.map((assignment) => {
                const submission = getSubmissionForAssignment(assignment.id);
                return (
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
                              Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                            </span>
                            {assignment.isPublished ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Published
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                Draft
                              </span>
                            )}
                          </div>
                          {submission && (
                            <div className="mt-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                submission.status === 'Graded' ? 'bg-green-100 text-green-800' :
                                submission.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {submission.status} {submission.marks !== undefined && `- ${submission.marks}/${assignment.maxMarks}`}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          {submission ? (
                            <Link
                              href={`/student/assignments/${assignment.id}`}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                            >
                              View Submission
                            </Link>
                          ) : (
                            assignment.isPublished && (
                              <Link
                                href={`/student/assignments/${assignment.id}`}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                              >
                                Submit
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}