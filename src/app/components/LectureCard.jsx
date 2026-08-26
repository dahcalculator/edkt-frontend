import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function LectureCard({ topicId, matric, onStartQuiz }) {
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API Call to fetch topic pre-assessment lecture
    axios.get(`http://localhost:8000/syllabus/${topicId}/lecture?matric=${matric}`)
      .then(res => {
        setLecture(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading lecture card:", err);
        setLoading(false);
      });
  }, [topicId, matric]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-white rounded-xl shadow-md">
        <p className="text-gray-500 animate-pulse">Loading MAT102 Instructional Card...</p>
      </div>
    );
  }

  if (!lecture) return null;

  return (
    <div className="max-w-2xl mx-auto my-6 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <h2 className="text-xl font-bold text-blue-900">{lecture.title}</h2>
        {lecture.is_first_attempt && (
          <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold">
            Pre-Assessment Scaffolding
          </span>
        )}
      </div>

      <div className="prose text-gray-700 text-sm leading-relaxed mb-6 whitespace-pre-line">
        {lecture.content_markdown}
      </div>

      <button
        onClick={onStartQuiz}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow transition duration-150 flex items-center justify-center gap-2"
      >
        <span>Proceed to MAT102 Practice Quiz</span>
        <span>→</span>
      </button>
    </div>
  );
}