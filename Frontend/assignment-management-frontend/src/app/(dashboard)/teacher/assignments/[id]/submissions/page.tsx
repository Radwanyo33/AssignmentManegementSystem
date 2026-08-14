'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { submissionService } from '@/services/submission.service';
import { assignmentService } from '@/services/assignment.service';
import { Submission, AssignmentDto } from '@/types';

export default function TeacherSubmissions() {
  const params = useParams();
  const assignmentId = parseInt(params.id as string);
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<{ [key: number]: { marks: number; feedback: string } }>({});

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  const loadData = async () => {
    try {
      const [submissionsData, assignmentData] = await Promise.all([
        submissionService.getSubmissions(assignmentId),
        assignmentService.getAssignment(assignmentId),
      ]);
      setSubmissions(submissionsData);
      setAssignment(assignmentData);
      
      // Initialize grading state
      const gradingState: { [key: number]: { marks: number; feedback: string } } = {};
      submissionsData.forEach(s => {
        gradingState[s.id] = {
          marks: s.marks || 0,
          feedback: s.feedback || '',
        };
      });
      setGrading(gradingState);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId: number) => {
    const gradeData = grading[submissionId];
    if (gradeData.marks === undefined || gradeData.marks === null) {
      alert('Please enter marks');
      return;
    }

    try {
      await submissionService.gradeSubmission(submissionId, {
        marks: gradeData.marks,
        feedback: gradeData.feedback || '',
      });
      await loadData();
      alert('Submission graded successfully!');
    } catch (error) {
      console.error('Failed to grade submission:', error);
      alert('Failed to grade submission');
    }
  };

  const handleMarksChange = (submissionId: number, marks: number) => {
    setGrading(prev => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], marks }
    }));
  };

  const handleFeedbackChange = (submissionId: number, feedback: string) => {
    setGrading(prev => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], feedback }
    }));
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="Teacher">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="Teacher">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Submissions</h2>
            {assignment && (
              <p className="mt-1 text-sm text-gray-500">
                {assignment.title} - {assignment.className} ({assignment.subjectName})
              </p>
            )}
          </div>

          {submissions.length === 0 ? (
            <div className="bg-white shadow sm:rounded-lg p-6 text-center">
              <p className="text-gray-500">No submissions yet for this assignment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {submission.studentName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: <span className={`font-medium ${
                            submission.status === 'Graded' ? 'text-green-600' : 'text-yellow-600'
                          }`}>{submission.status}</span>
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        submission.status === 'Graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {submission.status}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Answer:</h4>
                      <div className="mt-1 bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{submission.answer}</p>
                      </div>
                    </div>

                    {submission.status === 'Graded' && submission.marks !== undefined && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          Grade: {submission.marks}/{assignment?.maxMarks}
                        </p>
                        {submission.feedback && (
                          <p className="text-sm text-gray-700 mt-1">
                            Feedback: {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}

                    {submission.status !== 'Graded' && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Marks (max: {assignment?.maxMarks})
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={assignment?.maxMarks}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={grading[submission.id]?.marks || ''}
                              onChange={(e) => handleMarksChange(submission.id, parseInt(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Feedback
                            </label>
                            <textarea
                              rows={2}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={grading[submission.id]?.feedback || ''}
                              onChange={(e) => handleFeedbackChange(submission.id, e.target.value)}
                              placeholder="Provide feedback..."
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleGrade(submission.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Grade Submission
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}