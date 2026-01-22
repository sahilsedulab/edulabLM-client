import { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

interface Props {
  text: string;
}

export default function AudioOverview({ text }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressInterval = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        const duration = (text.length / 15) * 1000; // Approximate duration
        const startTime = Date.now();
        
        progressInterval.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const currentProgress = Math.min((elapsed / duration) * 100, 100);
          setProgress(currentProgress);
        }, 100);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRestart = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  // Generate waveform bars
  const bars = Array.from({ length: 60 }, (_, i) => {
    const baseHeight = 20 + Math.sin(i * 0.5) * 15;
    const variation = Math.sin(i * 0.3) * 10;
    return baseHeight + variation;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Audio Overview</h1>
                <p className="text-white/70 text-sm">AI-narrated summary with text-to-speech</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-full px-5 py-2.5 border border-yellow-500/30 shadow-lg">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="text-white font-semibold">AI Generated</span>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/30 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Waveform Visualization */}
          <div className="relative bg-gradient-to-br from-purple-900/50 to-indigo-900/50 p-12">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-pulse" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
            </div>

            {/* Waveform */}
            <div className="relative flex items-center justify-center space-x-1 h-48">
              {bars.map((height, index) => {
                const isActive = (index / bars.length) * 100 <= progress;
                return (
                  <div
                    key={index}
                    className="relative flex-1 rounded-full transition-all duration-300"
                    style={{
                      height: `${height}%`,
                      maxWidth: '8px',
                      background: isActive
                        ? 'linear-gradient(to top, #ec4899, #8b5cf6)'
                        : 'rgba(255, 255, 255, 0.2)',
                      transform: isPlaying && isActive ? 'scaleY(1.2)' : 'scaleY(1)',
                      opacity: isActive ? 1 : 0.5,
                    }}
                  >
                    {isPlaying && isActive && (
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-400 to-purple-400 rounded-full animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress Indicator */}
            <div className="relative mt-6">
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-white/60 text-sm">
                <span>{Math.round(progress)}%</span>
                <span>Audio Overview</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-900/80 backdrop-blur-xl p-8">
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={handleRestart}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all duration-300 transform hover:scale-110"
                title="Restart"
              >
                <RotateCcw className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={handlePlayPause}
                className="p-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-white" fill="white" />
                ) : (
                  <Play className="w-10 h-10 text-white" fill="white" />
                )}
              </button>

              <button
                className="p-4 bg-white/10 rounded-full border border-white/20 opacity-50 cursor-not-allowed"
                disabled
                title="Volume (Coming soon)"
              >
                <Volume2 className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Status */}
            <div className="text-center mt-6">
              <p className="text-white/80 text-lg font-medium">
                {isPlaying ? '🎙️ Playing...' : progress === 100 ? '✅ Completed' : '⏸️ Ready to play'}
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Volume2 className="w-6 h-6 text-blue-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">How it works</h3>
              <p className="text-white/70 leading-relaxed">
                This audio overview uses your browser's built-in text-to-speech technology to narrate the AI-generated summary. 
                Click the play button to listen, and watch the waveform visualize the audio in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 text-center">
            <p className="text-white/60 text-sm mb-1">🎵 Waveform</p>
            <p className="text-white font-semibold">Real-time visualization</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 text-center">
            <p className="text-white/60 text-sm mb-1">🎙️ Natural Voice</p>
            <p className="text-white font-semibold">Text-to-speech</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 text-center">
            <p className="text-white/60 text-sm mb-1">⚡ Instant</p>
            <p className="text-white font-semibold">No downloads needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
