/**
 * Login Page
 * Customer login form
 */

import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export const metadata = {
  title: 'Login - My Account',
  description: 'Login to your account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <LoginForm />
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


