'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

//Prevent static generation
export const dynamic = 'force-dynamic';

export default function LoginPage(){
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setError('');
        setLoading(true);

        try{
            const response = await authService.login({email, password});
            const user = response.user;

            //Redirect based on role
            switch (user.role) {
                case 'Admin':
                    router.push('/admin');
                    break;
                case 'Teacher':
                    router.push('/teacher');
                    break;
                case 'Student':
                    router.push('/student');
                    break
                default:
                    router.push('/');
            }
        }catch(err:any){
            setError(err.response?.data || 'Login Failed....Please try again later.');
        }finally{
            setLoading(false);
        }
    };
    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Assignment Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-sm text-center">
            <span className="text-gray-600">Demo Credentials:</span>
            <br />
            <span className="text-xs text-gray-500">
              Admin: admin@school.com / Admin@123
            </span>
            <br />
            <span className="text-xs text-gray-500">
              Teacher: teacher@school.com / Teacher@123
            </span>
            <br />
            <span className="text-xs text-gray-500">
              Student: student@school.com / Student@123
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}