'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { classService } from '@/services/class.service';
import { userService } from '@/services/user.service';
import { Class, User } from '@/types';

export default function ClassStudents() {
  const params = useParams();
  const classId = parseInt(params.id as string);
  
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = async () => {
    try {
      const [classInfo, allStudents] = await Promise.all([
        classService.getClass(classId),
        userService.getUsers(),
      ]);
      setClassData(classInfo);
      
      // Filter students (in real app, this would come from enrollment API)
      const enrolledStudents = allStudents.filter(u => u.role === 'Student');
      setStudents(enrolledStudents);
      setAvailableStudents(enrolledStudents);
    } catch (error) {
      console.error('Failed to load data:', error);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Students in {classData?.name}
          </h2>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No students enrolled in this class.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {students.map((student) => (
                  <li key={student.id}>
                    <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.fullName}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      <button
                        className="text-red-600 hover:text-red-900 text-sm"
                        onClick={() => {
                          if (window.confirm(`Remove ${student.fullName} from this class?`)) {
                            // API call to remove student
                          }
                        }}
                      >
                        Remove
                      </button>
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