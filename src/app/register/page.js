"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '../lib/api';

export default function Register() {
  const router = useRouter();
  
  // Form State Inputs
  const [fullName, setFullName] = useState('');
  const [matric, setMatric] = useState('');
  const [password, setPassword] = useState('');
  
  // Interface Feedback States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !matric.trim() || !password) {
      setError('Please fill in all required registration fields.');
      return;
    }

    setLoading(true);

    try {
      // 1. Send clean payload matching backend expectations
      const response = await API.post('/auth/register', {
        fullName: fullName.trim(),
        matric: matric.trim().toUpperCase(),
        password: password
      });

      if (response.data.status === 'success') {
        // 2. Clear old browser state to prevent session contamination
        localStorage.clear();
        
        // 3. Save standardized user object in localStorage
        const newUser = {
          id: response.data.user_id,
          full_name: fullName.trim(),
          matric_no: matric.trim().toUpperCase(),
          role: response.data.role || 'student'
        };

        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Legacy fallback keys
        localStorage.setItem('studentMatric', matric.trim().toUpperCase());
        localStorage.setItem('studentName', fullName.trim());

        // 4. Redirect cleanly to student workspace dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      console.error("Registration error:", err);
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string' 
          ? detail 
          : 'Registration failed. Ensure your details are correct or try logging in.'
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
          MAT101 Adaptive Diagnostic Registration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-100 sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Saleh Jude"
                className="block w-full text-sm font-semibold text-black bg-white p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition placeholder:text-gray-400"
              />
            </div>

            {/* Matriculation Number Input */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                Matriculation Number
              </label>
              <input
                type="text"
                required
                value={matric}
                onChange={(e) => setMatric(e.target.value)}
                placeholder="e.g. FUT/CS/2022/001"
                className="block w-full text-sm font-semibold text-black bg-white p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition placeholder:text-gray-400"
              />
            </div>

            {/* Account Password Input */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full text-sm font-semibold text-black bg-white p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition placeholder:text-gray-400"
              />
            </div>

            {/* Registration Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-4 rounded-xl shadow-md transition duration-150 disabled:bg-gray-400 mt-2"
            >
              {loading ? 'Creating Student Profile...' : 'Register Account'}
            </button>
          </form>

          {/* Navigation Anchor to Login */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-indigo-600 hover:underline">
                Sign In here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}