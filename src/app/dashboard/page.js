"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API from '../lib/api';

export default function Dashboard() {
  const router = useRouter();

  // User Session & Analytics States
  const [currentUser, setCurrentUser] = useState(null);
  const [studentName, setStudentName] = useState('User');
  const [matric, setMatric] = useState('');
  const [analytics, setAnalytics] = useState({ overall_mastery: 0, topics: [] });
  const [explainabilityData, setExplainabilityData] = useState({ matrix_data: [], timeline_labels: [] });
  const [loading, setLoading] = useState(true);

  // Admin File Ingestion States
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ message: '', error: false });

  // 1. Load User Session and Fetch Analytics
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const legacyMatric = localStorage.getItem('studentMatric');
    const legacyName = localStorage.getItem('studentName');

    if (!storedUser && !legacyMatric) {
      router.push('/login');
      return;
    }

    let userObj = {};
    if (storedUser) {
      userObj = JSON.parse(storedUser);
    } else {
      userObj = {
        full_name: legacyName || 'Student',
        matric_no: legacyMatric,
        role: 'student'
      };
    }

    setCurrentUser(userObj);
    const activeName = userObj.full_name || userObj.fullName || 'Student';
    const activeMatric = userObj.matric_no || userObj.matric || legacyMatric;

    setStudentName(activeName);
    setMatric(activeMatric);

    // Fetch analytics using encodeURIComponent to prevent route breaks on slashes
    const fetchDashboardData = async () => {
      try {
        if (!activeMatric) return;

        const encodedMatric = encodeURIComponent(activeMatric);

        const resMastery = await API.get(`/analytics/mastery?matric=${encodedMatric}`);
        setAnalytics(resMastery.data);

        const resExplain = await API.get(`/analytics/explainability-matrix?matric=${encodedMatric}`);
        setExplainabilityData(resExplain.data);
      } catch (err) {
        console.warn("Analytics fetch note:", err?.response?.data || err.message);
        setAnalytics({ overall_mastery: 0, topics: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // 2. Multi-Question Pool Bulk Ingestion Handler (Single Declaration)
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadStatus({ message: 'Please select questions_pool.json first.', error: true });
      return;
    }

    setUploading(true);
    setUploadStatus({ message: 'Processing multi-question ingestion pool...', error: false });

    try {
      const reader = new FileReader();
      reader.readAsText(uploadFile, "UTF-8");
      reader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          const questionsArray = Array.isArray(jsonData) ? jsonData : [jsonData];

          // Pass user role header to pass API authorization checks
          const response = await API.post('/setup/bulk-upload-direct', questionsArray, {
            headers: {
              'X-User-Role': currentUser?.role || 'admin',
              'Content-Type': 'application/json'
            }
          });

          setUploadStatus({
            message: `🎉 Success! Ingested ${response.data.count} new questions into edkt.db (${response.data.skipped} duplicates skipped).`,
            error: false
          });
          setUploadFile(null);
          
          const fileInput = document.getElementById('questions-pool-picker');
          if (fileInput) fileInput.value = '';
        } catch (parseErr) {
          setUploadStatus({ message: 'Malformed JSON array file. Ensure your file contains valid questions.', error: true });
        }
      };
    } catch (err) {
      setUploadStatus({ message: err?.response?.data?.detail || 'Upload failed. Ensure admin privileges are active.', error: true });
    } finally {
      setUploading(false);
    }
  };

  // 3. System Logout Handler
  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500 font-medium">
        Loading Cognitive Diagnostic Engine Workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Upper Navigation Header Banner */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">EDKT Platform</h1>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mt-0.5">
              MAT101 Analytics Suite
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">{studentName}</p>
              <p className="text-xs text-gray-500 font-medium">
                {currentUser?.role === 'admin' ? '🛡️ Administrator' : matric}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8 mt-4">
        
        {/* Row Welcome Greeting & Quick Practice Action Anchor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Barka da zuwa, {studentName.split(' ')[0]}! 👋
              </h2>
              <p className="text-sm opacity-85 mt-2 max-w-md">
                Welcome back to your adaptive learning environment. The AI checks your accuracy and speed to trace what concepts you have fully mastered.
              </p>
            </div>
            <button 
              onClick={() => router.push('/quiz')}
              className="mt-6 bg-white text-indigo-700 font-bold px-6 py-3.5 rounded-xl shadow-md hover:bg-indigo-50 transition self-start flex items-center group text-sm"
            >
              Launch Adaptive Practice Round
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Primary Metrics Total Gauge Component Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center text-center">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Overall Syllabus Mastery</h3>
            <div className="text-6xl font-black text-indigo-600 my-3 tracking-tight">
              {analytics.overall_mastery}%
            </div>
            <p className="text-xs font-medium text-gray-500 px-4">
              Weighted metric compiled from response correctness and temporal speeds.
            </p>
          </div>
        </div>

        {/* Syllabus Breakdown & Weak Area Section */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Syllabus Breakdown & Weak Area Diagnostics</h3>
            <p className="text-sm text-gray-500 mt-1">Review your calculated mastery for specific sub-topics below to plan your study sessions.</p>
          </div>

          {analytics.topics.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
              <p className="text-gray-400 font-medium text-sm">No evaluation interactions tracked yet. Start practicing to generate diagnostic profiles!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {analytics.topics.map((item, index) => (
                <div key={index} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100/50 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg tracking-tight">{item.topic_name}</h4>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full mt-1.5 inline-block ${
                        item.color === 'red' ? 'bg-red-50 text-red-600' :
                        item.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-right font-black text-gray-900 text-2xl tracking-tight">
                      {item.mastery}%
                    </div>
                  </div>

                  {/* Progressive Tracking Gauge Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ease-out ${
                        item.color === 'red' ? 'bg-red-500' :
                        item.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.mastery}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Explainability Matrix Layer Interactive Heatmap */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              🧠 Deep Attention Matrix Explainability Layer
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              This grid visualizes the raw internal multi-head attention weights of the EDKT Transformer. It tracks exactly how past responses influence the system's current estimate of your mastery.
            </p>
          </div>

          {explainabilityData.timeline_labels.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
              <p className="text-gray-400 font-medium text-sm">
                Complete at least two custom adaptive practice loops to generate dependency maps!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[600px] p-4 bg-gray-50 rounded-2xl border border-gray-100">
                
                {/* Column Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2 text-center font-bold text-xs text-gray-400 uppercase tracking-wider">
                  <div className="text-left text-gray-500 flex items-center pl-2">Timeline History</div>
                  {explainabilityData.timeline_labels.map((lbl, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-gray-700 font-sans">
                      {lbl}
                    </div>
                  ))}
                </div>

                {/* Heatmap Grid Cell Generation */}
                {explainabilityData.timeline_labels.map((rowLbl, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-7 gap-2 items-center text-center mb-2 last:mb-0">
                    <div className="text-left text-xs font-bold text-gray-700 truncate pr-2 bg-white/60 p-2 rounded-lg border border-gray-100/50 font-sans">
                      {rowLbl}
                    </div>

                    {explainabilityData.timeline_labels.map((_, colIndex) => {
                      const cell = explainabilityData.matrix_data.find(
                        (c) => c.row === rowIndex && c.col === colIndex
                      );
                      const weight = cell ? cell.weight : 0.0;

                      return (
                        <div
                          key={colIndex}
                          className="p-4 rounded-xl font-black text-xs transition-all hover:scale-105 select-none border font-sans"
                          style={{
                            backgroundColor: `rgba(79, 70, 229, ${weight})`, 
                            color: weight > 0.5 ? '#fff' : '#4f46e5',
                            borderColor: weight > 0.5 ? 'transparent' : 'rgba(79, 70, 229, 0.15)'
                          }}
                          title={`Attention weight link index: ${weight}`}
                        >
                          {weight}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Legend Context Key */}
                <div className="mt-4 flex items-center justify-end space-x-4 text-xs font-semibold text-gray-500 px-2">
                  <span className="flex items-center">
                    <span className="w-3 h-3 rounded bg-indigo-50 border border-indigo-200 mr-1.5 inline-block"></span> 
                    Low Correlation Impact
                  </span>
                  <span className="flex items-center">
                    <span className="w-3 h-3 rounded bg-indigo-600 mr-1.5 inline-block"></span> 
                    Deep Attention Connection Boundary
                  </span>
                </div>

              </div>
            </div>
          )}
        </section>

        {/* Course Administrator Utilities (Only visible to logged-in admins) */}
        {currentUser?.role === 'admin' && (
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 border-t-4 border-t-indigo-600">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-black tracking-tight">
                🛠️ Course Administrator Utilities
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Upload a multi-question array file (<code className="text-black font-semibold">questions_pool.json</code>) to expand the live MAT101 evaluation bank.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 max-w-xl">
              <h4 className="text-xs font-bold text-black uppercase tracking-wider mb-3">
                Bulk Question Ingestion Pipeline
              </h4>
              
              <form onSubmit={handleBulkUpload} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input 
                    id="questions-pool-picker"
                    type="file" 
                    accept=".json"
                    onChange={(e) => {
                      setUploadFile(e.target.files[0] || null);
                      setUploadStatus({ message: '', error: false });
                    }}
                    className="block w-full text-xs text-black bg-white p-3 rounded-xl border border-gray-300 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer"
                  />
                  
                  <button
                    type="submit"
                    disabled={uploading}
                    className="bg-indigo-600 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md hover:bg-indigo-700 transition disabled:bg-gray-400 whitespace-nowrap"
                  >
                    {uploading ? 'Ingesting...' : 'Upload Pool'}
                  </button>
                </div>

                {uploadStatus.message && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${
                    uploadStatus.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {uploadStatus.message}
                  </div>
                )}
              </form>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}