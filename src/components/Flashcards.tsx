import { useState, useEffect } from 'react';
import { Flashcard } from '../types';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, BookOpen, CheckCircle2 } from 'lucide-react';

interface Props {
  cards: Flashcard[];
}

export default function Flashcards({ cards }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => setSlideDirection(null), 300);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setFlipped(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMastered();
      } else if (e.key === 's' || e.key === 'S') {
        handleShuffle();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, cards.length]);

  const handleNext = () => {
    setSlideDirection('left');
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setSlideDirection('right');
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const handleShuffle = () => {
    setFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * cards.length));
  };

  const toggleMastered = () => {
    setMastered(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentIndex)) {
        newSet.delete(currentIndex);
      } else {
        newSet.add(currentIndex);
      }
      return newSet;
    });
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <BookOpen className="w-16 h-16 text-gray-300" />
        <p className="text-xl text-gray-500 font-medium">No flashcards available</p>
        <p className="text-sm text-gray-400">Upload a document to generate flashcards</p>
      </div>
    );
  }

  const card = cards[currentIndex];
  const progress = ((mastered.size / cards.length) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Study Flashcards
          </h1>
          <p className="text-gray-600">Master your knowledge one card at a time</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Progress</span>
            <span className="text-indigo-600 font-semibold">{mastered.size} / {cards.length} mastered</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard Container */}
        <div className="relative">
          {/* Background Cards for Depth Effect */}
          <div className="absolute inset-0 transform translate-y-4 scale-95 opacity-30">
            <div className="w-full h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-3xl" />
          </div>
          <div className="absolute inset-0 transform translate-y-2 scale-97 opacity-50">
            <div className="w-full h-96 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-3xl" />
          </div>

          {/* Main Card */}
          <div className="relative">
            <div
              onClick={() => setFlipped(!flipped)}
              className="w-full h-96 cursor-pointer perspective-1000"
              style={{ perspective: '1000px' }}
            >
              <div
                className={`relative w-full h-full transition-all duration-700 ease-out ${slideDirection === 'left' ? 'animate-slide-out-left' :
                  slideDirection === 'right' ? 'animate-slide-out-right' : ''
                  }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front Side - Question */}
                <div
                  className="absolute w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-10 flex flex-col justify-between"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                      Question
                    </span>
                    {mastered.has(currentIndex) && (
                      <CheckCircle2 className="w-6 h-6 text-green-300" />
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-2xl md:text-3xl font-semibold text-white text-center leading-relaxed px-4">
                      {card.question}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full">
                      <p className="text-white/80 text-sm font-medium">
                        Tap to reveal answer
                      </p>
                    </div>
                  </div>
                </div>

                {/* Back Side - Answer */}
                <div
                  className="absolute w-full h-full bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl shadow-2xl p-10 flex flex-col justify-between"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                      Answer
                    </span>
                    {mastered.has(currentIndex) && (
                      <CheckCircle2 className="w-6 h-6 text-green-300" />
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-2xl md:text-3xl font-semibold text-white text-center leading-relaxed px-4">
                      {card.answer}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full">
                      <p className="text-white/80 text-sm font-medium">
                        Tap to see question
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Navigation */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrev}
                disabled={cards.length === 1}
                className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <span className="text-lg font-bold text-gray-800">
                  {currentIndex + 1}
                </span>
                <span className="text-gray-500 mx-2">/</span>
                <span className="text-lg font-medium text-gray-600">
                  {cards.length}
                </span>
              </div>

              <button
                onClick={handleNext}
                disabled={cards.length === 1}
                className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMastered}
                className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${mastered.has(currentIndex)
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{mastered.has(currentIndex) ? 'Mastered' : 'Mark as Mastered'}</span>
                </div>
              </button>

              <button
                onClick={handleShuffle}
                disabled={cards.length === 1}
                className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={() => setFlipped(false)}
                className="p-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                title="Reset card"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Use <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">←</kbd> and <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">→</kbd> to navigate • <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Space</kbd> to flip
          </p>
        </div>
      </div>
    </div>
  );
}
