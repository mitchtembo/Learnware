// CourseDetails.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, Course } from "../services/DataService";
import { ErrorHandler } from "../utils/errorHandler";
import { Loader2 } from "lucide-react";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const courseData = await getCourseById(id);
        setCourse(courseData);
      } catch (err) {
        setError("Failed to load course details.");
        ErrorHandler.handle(err, "An error occurred while fetching course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!course) return <div className="text-center py-8">Course not found.</div>;

  const content = course.content || {};

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Basic Info */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{course.name}</h1>
        {course.description && <p className="text-gray-700">{course.description}</p>}
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
          {course.difficulty && <span>Difficulty: {course.difficulty}</span>}
          {course.progress !== undefined && <span>Progress: {course.progress}%</span>}
          {course.start_date && <span>Start: {new Date(course.start_date).toLocaleDateString()}</span>}
          {course.end_date && <span>End: {new Date(course.end_date).toLocaleDateString()}</span>}
        </div>
      </div>

      {/* Overview */}
      {content.overview && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-2">Overview</h2>
          <p className="text-gray-700">{content.overview}</p>
        </div>
      )}

      {/* Key Topics */}
      {content.key_topics && content.key_topics.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-2xl font-semibold mb-2">Key Topics</h2>
          {content.key_topics.map((topic: any, idx: number) => (
            <div key={idx} className="p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium text-lg">{topic.title}</h3>
              <p className="text-gray-700 mt-1">{topic.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Learning Objectives */}
      {content.learning_objectives && content.learning_objectives.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-2">Learning Objectives</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {content.learning_objectives.map((obj: string, idx: number) => (
              <li key={idx}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Prerequisites */}
      {content.prerequisites && content.prerequisites.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-2">Prerequisites</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {content.prerequisites.map((pre: string, idx: number) => (
              <li key={idx}>{pre}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Study Materials */}
      {course.study_materials && course.study_materials.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-2">Study Materials</h2>
          <ul className="list-disc list-inside space-y-1">
            {course.study_materials.map((mat: any, idx: number) => (
              <li key={idx}>
                <a href={mat.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {mat.title || mat.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quizzes */}
      {course.quizzes && course.quizzes.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Quizzes</h2>
          {course.quizzes.map((quiz: any, idx: number) => (
            <Quiz key={idx} topic={quiz.topic} questions={quiz.questions} />
          ))}
        </div>
      )}
    </div>
  );
};

// Interactive Quiz Component
const Quiz = ({ topic, questions }: { topic: string; questions: any[] }) => {
  return (
    <div className="p-4 bg-white shadow rounded-2xl">
      <h3 className="text-xl font-bold mb-4">{topic} Quiz</h3>
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <QuizQuestion key={idx} question={q} />
        ))}
      </div>
    </div>
  );
};

const QuizQuestion = ({ question }: { question: any }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (option: string) => {
    if (!isAnswered) {
      setSelected(option);
      setIsAnswered(true);
    }
  };

  const isCorrect = selected === question.answer;

  return (
    <div className="p-4 border rounded-xl">
      <p className="font-medium mb-3">{question.question_text}</p>
      <div className="grid gap-2">
        {question.options.map((option: string, i: number) => (
          <button
            key={i}
            onClick={() => handleAnswer(option)}
            className={`px-4 py-2 rounded-lg border text-left transition
              ${
                isAnswered
                  ? option === question.answer
                    ? "bg-green-100 border-green-500"
                    : option === selected
                    ? "bg-red-100 border-red-500"
                    : "bg-gray-100 border-gray-300"
                  : "bg-gray-50 hover:bg-gray-100 border-gray-300"
              }`}
            disabled={isAnswered}
          >
            {option}
          </button>
        ))}
      </div>

      {isAnswered && (
        <p className={`mt-3 font-semibold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
          {isCorrect ? "✔ Correct!" : `❌ Incorrect. Correct answer: ${question.answer}`}
        </p>
      )}
    </div>
  );
};

export default CourseDetails;
