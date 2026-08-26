"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import 'katex/dist/katex.min.css';

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user session exists in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Session parse error:", e);
      }
    }
  }, []);

  // Animation Variant Configs
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. Global Navigation Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              E
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-black">EDKT Platform</h1>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                MAT101 Adaptive Diagnostic Suite
              </p>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                Go to Workspace →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold text-gray-700 hover:text-black px-4 py-2.5 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16 w-full">

        {/* 2. Hero Banner Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Transformer-Powered Knowledge Tracing
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-black tracking-tight leading-tight">
              Master MAT101 with AI-Driven Precision.
            </h2>

            <p className="text-gray-600 text-base leading-relaxed max-w-xl font-medium">
              An intelligent evaluation system that tracks your accuracy and response speeds in real time—predicting concept mastery and surfacing exact weak areas before your exams.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              {currentUser ? (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/quiz')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-lg transition-colors flex items-center justify-center group cursor-pointer"
                >
                  Launch Adaptive Practice Round
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>
              ) : (
                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/register"
                    className="block bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-lg transition-colors text-center"
                  >
                    Create Student Profile
                  </Link>
                </motion.div>
              )}

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Link
                  href={currentUser ? "/dashboard" : "/login"}
                  className="block bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 font-bold text-sm px-6 py-4 rounded-2xl transition-colors text-center"
                >
                  View Analytics Suite
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Hero Visual Teaser Component */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 space-y-5"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Diagnostic Preview</span>
                <h3 className="text-sm font-bold text-black">Live Cognitive Mastery Index</h3>
              </div>
              <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-100">
                Active Tracking
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-700">Matrices & Determinants</span>
                  <span className="text-indigo-600">84.5%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "84.5%" }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="bg-indigo-600 h-full rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-700">Set Theory & Venn Diagrams</span>
                  <span className="text-green-600">92.0%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "92%" }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="bg-green-500 h-full rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-700">Quadratic Equations & Surds</span>
                  <span className="text-amber-600">42.0%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "42%" }}
                    transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                    className="bg-amber-500 h-full rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-[11px] font-medium text-gray-500 flex items-center space-x-2">
              <span>🧠</span>
              <span>PyTorch Transformer model continuously updates weights after every 3 practice interactions.</span>
            </div>
          </motion.div>
        </motion.section>

        {/* 3. Key Capabilities Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-black text-black tracking-tight">
              Engineered for Deep Knowledge Tracing
            </h3>
            <p className="text-sm font-medium text-gray-500 mt-2">
              Unlike traditional fixed quizzes, EDKT evaluates behavioral speed and accuracy patterns to deliver personalized learning paths.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-3 transition-shadow hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xl">
                ⚡
              </div>
              <h4 className="text-base font-bold text-black tracking-tight">Adaptive Question Engine</h4>
              <p className="text-xs font-medium text-gray-500 leading-relaxed">
                Automatically adjusts target questions based on your latest predicted probabilities to reinforce areas where accuracy drops.
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-3 transition-shadow hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xl">
                🔍
              </div>
              <h4 className="text-base font-bold text-black tracking-tight">Explainability Heatmap</h4>
              <p className="text-xs font-medium text-gray-500 leading-relaxed">
                Extracts raw multi-head self-attention weights from the underlying Neural Network to show you exactly why specific questions are recommended.
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-3 transition-shadow hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xl">
                📈
              </div>
              <h4 className="text-base font-bold text-black tracking-tight">Diagnostic Mastery Index</h4>
              <p className="text-xs font-medium text-gray-500 leading-relaxed">
                Combines accuracy percentages with temporal slowness factors to provide a weighted mastery score across the MAT101 syllabus.
              </p>
            </motion.div>
          </div>
        </motion.section>

      </main>

      {/* 4. Global System Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 px-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>EDKT Backend Engine: <strong className="text-black">Connected (FastAPI + PyTorch)</strong></span>
          </div>

          <p>© {new Date().getFullYear()} MAT101 Deep Knowledge Tracing System</p>
        </div>
      </footer>

    </div>
  );
}