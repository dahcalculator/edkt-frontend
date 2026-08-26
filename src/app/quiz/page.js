"use client";
import { useState, useEffect } from 'react';
import API from '../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function Quiz() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicIdParam = searchParams.get('topicId');

  // View States: 'LECTURE' or 'QUIZ'
  const [viewState, setViewState] = useState('LECTURE');
  const [lecture, setLecture] = useState(null);
  const [lectureLoading, setLectureLoading] = useState(true);

  // Quiz States
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionAnsweredIds, setSessionAnsweredIds] = useState([]);
  const [totalPoolSize, setTotalPoolSize] = useState(20);

  // 1. Fetch Pre-Assessment Lecture Content on Load
  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        let matric = localStorage.getItem('studentMatric');
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          matric = userObj.matric_no || userObj.matric || matric;
        }

        const targetTopic = topicIdParam || 1;
        const encodedMatric = encodeURIComponent(matric || '');

        const res = await API.get(`/syllabus/${targetTopic}/lecture?matric=${encodedMatric}`);
        setLecture(res.data);
      } catch (err) {
        console.warn("Lecture fetch note:", err);
        // Fallback lecture content if topic endpoint yields nothing
        setLecture({
          title: "MAT102 Module Review: Calculus & Vectors",
          content_markdown: "Review standard derivative rules, limits, and vector dot products before attempting your practice round.",
          is_first_attempt: true
        });
      } finally {
        setLectureLoading(false);
      }
    };

    fetchLecture();
  }, [topicIdParam]);

  // 2. Fetch Next Adaptive Question
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

      const res = await API.get(
        `/quiz/next-question?matric=${encodedMatric}&exclude=${excludeParam}&_t=${Date.now()}`
      );

      if (res.data) {
        setQuestion(res.data);
        setStartTime(Date.now()); // Start response latency clock ONLY after question renders
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

  // Start practice round after reviewing lecture
  const handleProceedToQuiz = () => {
    setViewState('QUIZ');
    fetchQuestion([]);
  };

  // 3. Submit Answer Telemetry (\Delta\tau_t)
  const handleAnswer = async (selectedOption) => {
    const endTime = Date.now();
    const responseTime = (endTime - startTime) / 1000; // Calculate exact response latency
    const isCorrect = selectedOption === question.correct_answer;

    const storedUser = localStorage.getItem('user');
    let matric = localStorage.getItem('studentMatric');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      matric = userObj.matric_no || userObj.matric || matric;
    }

    try {
      await API.post('/quiz/submit', {
        matric: matric.trim().toUpperCase(),
        question_id: question.id,
        is_correct: isCorrect,
        response_time: responseTime
      });

      const updatedAnsweredList = [...sessionAnsweredIds, question.id];
      setSessionAnsweredIds(updatedAnsweredList);

      const nextCount = questionCount + 1;
      setQuestionCount(nextCount);

      if (nextCount >= totalPoolSize) {
        setQuizComplete(true);
      } else {
        await fetchQuestion(updatedAnsweredList);
      }
    } catch (err) {
      console.error("Error logging interaction:", err);
      alert("Error saving interaction. Check your connection.");
    }
  };

  // View State 1: Pre-Assessment Lecture Card
  if (viewState === 'LECTURE') {
    if (lectureLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500 font-medium">
          Loading MAT102 Instructional Card...
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                MAT102 Instructional Scaffolding
              </span>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
                {lecture?.title}
              </h2>
            </div>
            {lecture?.is_first_attempt && (
              <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                Recommended Reading
              </span>
            )}
          </div>

          <div className="text-gray-700 text-sm leading-relaxed space-y-3 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {lecture?.content_markdown}
            </ReactMarkdown>
          </div>

          <div className="pt-2">
            <button
              onClick={handleProceedToQuiz}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
            >
              <span>Proceed to MAT102 Practice Quiz</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Loading State
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
                setSessionAnsweredIds([]);
                setViewState('LECTURE');
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
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">MAT102 Adaptive Diagnostic Session</span>
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