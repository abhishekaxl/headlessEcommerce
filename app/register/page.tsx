/**
 * Register Page
 * Customer registration form
 */

import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export const metadata = {
  title: 'Create Account',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join us and start shopping</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <RegisterForm />
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


