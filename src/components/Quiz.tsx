import { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';

interface Props {
  questions: QuizQuestion[];
}

export default function Quiz({ questions }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  if (questions.length === 0) {
    return <p className="text-gray-600">No quiz questions available</p>;
  }

  const question = questions[currentIndex];

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  const isFinished = currentIndex === questions.length - 1 && showResult;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Quiz</h2>

      {!isFinished ? (
        <>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-blue-600">
                Score: {score}/{questions.length}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {question.question}
            </h3>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showResult && handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    showResult
                      ? index === question.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : index === selectedAnswer
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white'
                      : 'border-gray-200 bg-white hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showResult && index === question.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {showResult && index === selectedAnswer && index !== question.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {showResult && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  {question.explanation}
                </p>
              </div>
            )}
          </div>

          {showResult && (
            <button
              onClick={handleNext}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete!</h3>
          <p className="text-xl text-gray-700 mb-6">
            Your Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
          </p>
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Restart Quiz
          </button>
        </div>
      )}
    </div>
  );
}
