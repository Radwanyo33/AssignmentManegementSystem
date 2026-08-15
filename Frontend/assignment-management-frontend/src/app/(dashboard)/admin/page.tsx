'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { assignmentService } from '@/services/assignment.service';
import { userService } from '@/services/user.service';
import { classService } from '@/services/class.service';
import { subjectService } from '@/services/subject.service';
import { User, AssignmentDto, Class, Subject } from '@/types';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [assignments, setAssignments] = useState<AssignmentDto[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersData, assignmentsData, classesData, subjectsData] = await Promise.all([
                userService.getUsers(),
                assignmentService.getAssignments(),
                classService.getClasses(),
                subjectService.getSubjects(),
            ]);
            setUsers(usersData);
            setAssignments(assignmentsData);
            setClasses(classesData);
            setSubjects(subjectsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { 
            name: 'Total Users', 
            value: users.length, 
            icon: '👥',
            bgColor: 'bg-blue-500',
            link: '/admin/users'
        },
        { 
            name: 'Total Assignments', 
            value: assignments.length, 
            icon: '📝',
            bgColor: 'bg-purple-500',
            link: '/admin/assignments'
        },
        { 
            name: 'Total Classes', 
            value: classes.length, 
            icon: '🏫',
            bgColor: 'bg-green-500',
            link: '/admin/classes'
        },
        { 
            name: 'Total Subjects', 
            value: subjects.length, 
            icon: '📚',
            bgColor: 'bg-orange-500',
            link: '/admin/subjects'
        },
        { 
            name: 'Published Assignments', 
            value: assignments.filter(a => a.isPublished).length, 
            icon: '✅',
            bgColor: 'bg-indigo-500',
            link: '/admin/assignments'
        },
    ];

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
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                            <p className="text-sm text-gray-500">Overview of your system</p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href="/admin/users"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add New User
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                        {stats.map((stat) => (
                            <Link
                                key={stat.name}
                                href={stat.link}
                                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                            >
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className={`shrink-0 rounded-md p-3 ${stat.bgColor}`}>
                                            <span className="text-2xl">{stat.icon}</span>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    {stat.name}
                                                </dt>
                                                <dd className="text-2xl font-semibold text-gray-900">
                                                    {stat.value}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Link
                            href="/admin/users"
                            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900">Manage Users</h3>
                                <p className="mt-2 text-sm text-gray-500">Add, edit, or remove users from the system</p>
                                <div className="mt-4 text-indigo-600">View all users →</div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/classes"
                            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900">Manage Classes</h3>
                                <p className="mt-2 text-sm text-gray-500">Create and manage classes</p>
                                <div className="mt-4 text-indigo-600">View all classes →</div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/subjects"
                            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900">Manage Subjects</h3>
                                <p className="mt-2 text-sm text-gray-500">Create and manage subjects</p>
                                <div className="mt-4 text-indigo-600">View all subjects →</div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/assignments"
                            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900">View All Assignments</h3>
                                <p className="mt-2 text-sm text-gray-500">Monitor all assignments in the system</p>
                                <div className="mt-4 text-indigo-600">View all assignments →</div>
                            </div>
                        </Link>
                    </div>

                    {/* Recent Activity - Recent Assignments */}
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Assignments</h3>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            {assignments.length === 0 ? (
                                <div className="px-4 py-12 text-center text-gray-500">
                                    No assignments created yet.
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {assignments.slice(0, 5).map((assignment) => (
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
                                                                {assignment.submissionCount} submissions
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                assignment.isPublished 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-yellow-100 text-yellow-800'
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
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Recent Subjects */}
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Subjects</h3>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            {subjects.length === 0 ? (
                                <div className="px-4 py-12 text-center text-gray-500">
                                    No subjects created yet.
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {subjects.slice(0, 5).map((subject) => (
                                        <li key={subject.id}>
                                            <div className="px-4 py-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {subject.name}
                                                            {subject.code && (
                                                                <span className="text-sm text-gray-500 ml-2">
                                                                    ({subject.code})
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {subject.className || 'No class assigned'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <Link
                                                            href={`/admin/subjects/${subject.id}`}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                                        >
                                                            View
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

                    {/* Recent Users */}
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h3>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            {users.length === 0 ? (
                                <div className="px-4 py-12 text-center text-gray-500">
                                    No users found.
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {users.slice(0, 5).map((user) => (
                                        <li key={user.id}>
                                            <div className="px-4 py-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {user.fullName}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            user.role === 'Admin' 
                                                                ? 'bg-red-100 text-red-800' 
                                                                : user.role === 'Teacher'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            {user.role}
                                                        </span>
                                                        <Link
                                                            href={`/admin/users/${user.id}/edit`}
                                                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                                                        >
                                                            Edit
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