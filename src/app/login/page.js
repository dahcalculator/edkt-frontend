"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '../lib/api';

export default function Login() {
  const router = useRouter();
  
  // Form State Inputs
  const [formData, setFormData] = useState({ matric: '', password: '' });
  
  // Interface Feedback States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.matric.trim() || !formData.password) {
      setError('Please enter both your Matriculation/Staff number and password.');
      return;
    }

    setLoading(true);

    try {
      const cleanMatric = formData.matric.trim().toUpperCase();

      // Send normalized login payload to FastAPI backend
      const response = await API.post('/auth/login', {
        matric_no: cleanMatric,
        password: formData.password
      });

      if (response.data.status === 'success') {
        // Clear old browser storage to prevent session conflicts
        localStorage.clear();

        const userObj = response.data.user;

        // Store complete user object returned from FastAPI
        localStorage.setItem('user', JSON.stringify(userObj));

        // Legacy fallback keys to prevent UI breaks on existing components
        localStorage.setItem('studentMatric', userObj.matric_no);
        localStorage.setItem('studentName', userObj.full_name);

        // Redirect directly to dashboard workspace
        router.push('/dashboard');
      }
    } catch (err) {
      console.error("Login authentication error:", err);
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'Invalid login credentials. Please verify your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-black text-black tracking-tight">EDKT Platform</h1>
        <p className="mt-2 text-xs font-bold text-indigo-600 uppercase tracking-widest">
          MAT101 Diagnostic Portal Sign In
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-100 sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Matriculation / Staff ID Input */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                Matric / Staff Number
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. FUT/CS/2022/001 or STAFF/MAT101" 
                value={formData.matric}
                onChange={(e) => setFormData({ ...formData, matric: e.target.value })}
                className="block w-full text-sm font-semibold text-black bg-white p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition placeholder:text-gray-400"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                Password
              </label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full text-sm font-semibold text-black bg-white p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition placeholder:text-gray-400"
              />
            </div>

            {/* Login Action Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-4 rounded-xl shadow-md transition duration-150 disabled:bg-gray-400 mt-2"
            >
              {loading ? 'Authenticating Profile...' : 'Sign In'}
            </button>
          </form>

          {/* Registration Navigation Anchor */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 font-medium">
              Don't have a student profile yet?{' '}
              <Link href="/register" className="font-bold text-indigo-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}