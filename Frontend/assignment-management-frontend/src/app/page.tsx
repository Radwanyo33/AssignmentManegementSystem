'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function HomePage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        const token = authService.getToken();
        const user = authService.getCurrentUser();
        setIsAuthenticated(!!token);
        setUserRole(user?.role || null);
    }, []);

    const getDashboardLink = () => {
        if (!userRole) return '/login';
        switch (userRole) {
            case 'Admin': return '/admin';
            case 'Teacher': return '/teacher';
            case 'Student': return '/student';
            default: return '/login';
        }
    };

    if (!isMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <span className="text-2xl font-bold text-indigo-600">📚</span>
                                <span className="ml-2 text-xl font-bold text-gray-900">Assignment System</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        href={getDashboardLink()}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            authService.logout();
                                            router.push('/login');
                                        }}
                                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight">
                            Assignment & Submission
                            <span className="block text-indigo-600">Management System</span>
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
                            A complete solution for schools and colleges to manage assignments, 
                            submissions, and grading with role-based access.
                        </p>
                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            {!isAuthenticated ? (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-8 py-4 text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
                                    >
                                        Get Started
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-8 py-4 text-lg font-medium rounded-md text-indigo-600 bg-white border-2 border-indigo-600 hover:bg-indigo-50 transition-all"
                                    >
                                        Register
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={getDashboardLink()}
                                    className="px-8 py-4 text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
                                >
                                    Go to Dashboard
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="mt-32">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
                            <p className="mt-4 text-lg text-gray-500">Everything you need to manage assignments efficiently</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Feature 1 - Admin */}
                            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                                <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-3xl">👑</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin</h3>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>✓ Manage users (CRUD)</li>
                                    <li>✓ Manage classes and subjects</li>
                                    <li>✓ View all assignments and submissions</li>
                                    <li>✓ Assign teachers to subjects/classes</li>
                                </ul>
                            </div>

                            {/* Feature 2 - Teacher */}
                            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-3xl">👨‍🏫</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Teacher</h3>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>✓ Create, update, delete assignments</li>
                                    <li>✓ Assign to specific class & subject</li>
                                    <li>✓ View student submissions</li>
                                    <li>✓ Grade and provide feedback</li>
                                </ul>
                            </div>

                            {/* Feature 3 - Student */}
                            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-3xl">🎓</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Student</h3>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>✓ View assignments and deadlines</li>
                                    <li>✓ Submit answers</li>
                                    <li>✓ Update submissions before deadline</li>
                                    <li>✓ View marks and feedback</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack Section */}
                    <div className="mt-32">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900">Built With</h2>
                            <p className="mt-4 text-lg text-gray-500">Modern technologies for a robust application</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="bg-white rounded-lg shadow-md px-6 py-3 flex items-center gap-2">
                                <span className="text-blue-600 font-semibold">Next.js</span>
                                <span className="text-xs text-gray-400">15</span>
                            </div>
                            <div className="bg-white rounded-lg shadow-md px-6 py-3 flex items-center gap-2">
                                <span className="text-purple-600 font-semibold">React</span>
                                <span className="text-xs text-gray-400">18</span>
                            </div>
                            <div className="bg-white rounded-lg shadow-md px-6 py-3 flex items-center gap-2">
                                <span className="text-blue-700 font-semibold">TypeScript</span>
                            </div>
                            <div className="bg-white rounded-lg shadow-md px-6 py-3 flex items-center gap-2">
                                <span className="text-purple-700 font-semibold">Tailwind CSS</span>
                            </div>
                            <div className="bg-white rounded-lg shadow-md px-6 py-3 flex items-center gap-2">
                                <span className="text-green-700 font-semibold">ASP.NET Core</span>
                                <span className="text-xs text-gray-400">8</span>
                            </div>
                            <div className="bg-white rounded-lg shadow-md px-6 py-3 flex items-center gap-2">
                                <span className="text-blue-800 font-semibold">PostgreSQL</span>
                            </div>
                            <div className="bg-white rounded-lg shadow-md px-6 py-3 flex items-center gap-2">
                                <span className="text-gray-700 font-semibold">JWT</span>
                            </div>
                        </div>
                    </div>

                    {/* Demo Credentials */}
                    {/* <div className="mt-32">
                        <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-6">Demo Credentials</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                    <p className="font-semibold text-red-700 text-center">👑 Admin</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        <span className="font-medium">Email:</span> admin@school.com
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        <span className="font-medium">Password:</span> Admin@123
                                    </p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <p className="font-semibold text-blue-700 text-center">👨‍🏫 Teacher</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        <span className="font-medium">Email:</span> teacher@school.com
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        <span className="font-medium">Password:</span> Teacher@123
                                    </p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <p className="font-semibold text-green-700 text-center">🎓 Student</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        <span className="font-medium">Email:</span> student@school.com
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        <span className="font-medium">Password:</span> Student@123
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* Footer */}
                    <footer className="mt-32 border-t border-gray-200 pt-8 pb-6">
                        <p className="text-center text-sm text-gray-500">
                            © {new Date().getFullYear()} <a href="https://www.linkedin.com/in/radwanul-hoque-rafi-2406911b9/" target='_blank'>Md.Radwanul Hoque Rafi</a>. All rights reserved.
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
}