"use client";
import { useState, useEffect } from 'react';
import API from '../lib/api';
import { useRouter } from 'next/navigation';

export default function Quiz() {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionAnsweredIds, setSessionAnsweredIds] = useState([]); // Tracks current session answered IDs
  const [totalPoolSize, setTotalPoolSize] = useState(20);
  const router = useRouter();

  // Fetch next adaptive question passing current session's answered IDs
  const fetchQuestion = async (answeredList = sessionAnsweredIds) => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('user');
      let matric = localStorage.getItem('studentMatric');

      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        matric = userObj.matric_no || userObj.matric || matric;
      }

      if (!matric) {
        router.push('/login');
        return;
      }

      const encodedMatric = encodeURIComponent(matric);
      const excludeParam = answeredList.join(',');

      // Send exclude parameter containing active session question IDs
      const res = await API.get(
        `/quiz/next-question?matric=${encodedMatric}&exclude=${excludeParam}&_t=${Date.now()}`
      );

      if (res.data) {
        setQuestion(res.data);
        setStartTime(Date.now());
        setQuizComplete(false);
      }
    } catch (err) {
      if (err.response && (err.response.status === 404 || err.response.status === 400)) {
        setQuizComplete(true);
      } else {
        console.error("Error communicating with quiz engine:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion([]);
  }, []);

  const handleAnswer = async (selectedOption) => {
    const endTime = Date.now();
    const responseTime = (endTime - startTime) / 1000;
    const isCorrect = selectedOption === question.correct_answer;

    const storedUser = localStorage.getItem('user');
    let matric = localStorage.getItem('studentMatric');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      matric = userObj.matric_no || userObj.matric || matric;
    }

    try {
      // 1. Submit answer log
      await API.post('/quiz/submit', {
        matric: matric.trim().toUpperCase(),
        question_id: question.id,
        is_correct: isCorrect,
        response_time: responseTime
      });

      // 2. Add question.id to current session answered tracking array
      const updatedAnsweredList = [...sessionAnsweredIds, question.id];
      setSessionAnsweredIds(updatedAnsweredList);

      const nextCount = questionCount + 1;
      setQuestionCount(nextCount);

      // 3. Check Session Bounds
      if (nextCount >= totalPoolSize) {
        setQuizComplete(true);
      } else {
        // Fetch next unrepeated question
        await fetchQuestion(updatedAnsweredList);
      }
    } catch (err) {
      console.error("Error logging interaction:", err);
      alert("Error saving interaction. Check your connection.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500 font-medium">
        Fetching Adaptive Question...
      </div>
    );
  }

  // Quiz Complete State
  if (quizComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center space-y-4">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-2xl font-black text-black tracking-tight">Session Complete!</h2>
          <p className="text-sm font-medium text-gray-600">
            You completed {questionCount} evaluation items! Your accuracy and response timing have been logged for EDKT diagnostic analysis.
          </p>
          
          <div className="pt-4 space-y-3">
            <button
              onClick={() => {
                setQuestionCount(0);
                setSessionAnsweredIds([]); // Reset session tracking array for brand new round
                setQuizComplete(false);
                fetchQuestion([]);
              }}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:bg-indigo-700 transition text-sm cursor-pointer"
            >
              Start Another Practice Round
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-100 text-gray-700 font-bold py-3.5 px-4 rounded-xl hover:bg-gray-200 transition text-sm cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Question Layout
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-3xl mx-auto flex justify-between items-center mb-6 px-2">
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-xl uppercase tracking-wider">
          Question {questionCount + 1} of {totalPoolSize}
        </span>
        
        <button
          onClick={() => {
            if (confirm("Are you sure you want to quit this evaluation session?")) {
              router.push('/dashboard');
            }
          }}
          className="flex items-center text-xs font-bold text-red-500 hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-xl cursor-pointer"
        >
          Quit & Exit
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 p-8 text-white">
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">MAT101 Adaptive Diagnostic Session</span>
          <h2 className="text-xl font-bold mt-2 leading-relaxed">{question?.content}</h2>
        </div>

        <div className="p-8 grid grid-cols-1 gap-4">
          {['a', 'b', 'c', 'd'].map((key) => (
            <button
              key={key}
              onClick={() => handleAnswer(key.toUpperCase())}
              className="w-full text-left p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center group cursor-pointer"
            >
              <span className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center font-bold text-gray-700 mr-4 transition-colors text-sm">
                {key.toUpperCase()}
              </span>
              <span className="text-gray-900 font-semibold text-sm">{question?.[`option_${key}`]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}