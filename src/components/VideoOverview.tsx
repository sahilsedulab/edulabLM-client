import { useState, useEffect, useRef } from 'react';
import { Video, Play, Pause, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';

interface Props {
  text: string;
}

export default function VideoOverview({ text }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Parse the text into scenes
  const scenes = text.split(/Scene \d+:|Scene:|^\d+\./gm)
    .filter(s => s.trim().length > 0)
    .map(s => s.trim());

  const totalScenes = scenes.length;
  const sceneDuration = 8000; // 8 seconds per scene

  useEffect(() => {
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const speak = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = isMuted ? 0 : 1;
      
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => {
        setIsReading(false);
        // Move to next scene
        if (currentScene < totalScenes - 1) {
          setTimeout(() => {
            setCurrentScene(prev => prev + 1);
          }, 500);
        } else {
          setIsPlaying(false);
          setProgress(100);
        }
      };
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      window.speechSynthesis.cancel();
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else {
      // Play
      setIsPlaying(true);
      speak(scenes[currentScene]);
      
      // Update progress
      const startTime = Date.now();
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const sceneProgress = (elapsed / sceneDuration) * 100;
        const totalProgress = ((currentScene + sceneProgress / 100) / totalScenes) * 100;
        setProgress(Math.min(totalProgress, 100));
      }, 100);
    }
  };

  const handleRestart = () => {
    setCurrentScene(0);
    setProgress(0);
    setIsPlaying(false);
    window.speechSynthesis.cancel();
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (speechRef.current) {
      speechRef.current.volume = !isMuted ? 0 : 1;
    }
  };

  useEffect(() => {
    if (isPlaying && currentScene < totalScenes) {
      speak(scenes[currentScene]);
    }
  }, [currentScene]);

  const gradients = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Video Overview</h1>
                <p className="text-white/70 text-sm">AI-narrated visual presentation</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-full px-5 py-2.5 border border-yellow-500/30 shadow-lg">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="text-white font-semibold">AI Generated</span>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/30 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Video Display Area */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-12">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[currentScene % gradients.length]} opacity-20 animate-pulse`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            </div>

            {/* Scene Content */}
            <div className="relative z-10 text-center space-y-6 max-w-3xl">
              <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4">
                <span className="text-white/80 text-sm font-medium">
                  Scene {currentScene + 1} of {totalScenes}
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight animate-fadeInUp">
                {scenes[currentScene]?.split('.')[0] || 'Document Overview'}
              </h2>
              
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed animate-fadeInUp">
                {scenes[currentScene]?.substring(scenes[currentScene].indexOf('.') + 1).trim() || text}
              </p>

              {/* Reading Indicator */}
              {isReading && (
                <div className="flex items-center justify-center space-x-2 animate-pulse">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-green-400 text-sm font-medium ml-2">Speaking...</span>
                </div>
              )}
            </div>

            {/* Play Button Overlay (when not playing) */}
            {!isPlaying && (
              <button
                onClick={handlePlayPause}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all duration-300 group"
              >
                <div className="p-8 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/40 group-hover:scale-110 transition-transform">
                  <Play className="w-16 h-16 text-white" fill="white" />
                </div>
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-900/50 px-6 py-2">
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-900/80 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" fill="white" />
                  ) : (
                    <Play className="w-6 h-6 text-white" fill="white" />
                  )}
                </button>

                <button
                  onClick={handleRestart}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all duration-300 transform hover:scale-110"
                  title="Restart"
                >
                  <RotateCcw className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={toggleMute}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all duration-300 transform hover:scale-110"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              <div className="text-white text-sm font-medium">
                {Math.round(progress)}% Complete
              </div>
            </div>
          </div>
        </div>

        {/* Scene List */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-4">Scenes</h3>
          <div className="space-y-3">
            {scenes.map((scene, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  index === currentScene
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => {
                  setCurrentScene(index);
                  setIsPlaying(false);
                  window.speechSynthesis.cancel();
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === currentScene
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/60'
                  }`}>
                    {index + 1}
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed flex-1">
                    {scene.substring(0, 150)}{scene.length > 150 ? '...' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="text-center text-white/60 text-sm">
          <p>🎙️ Using browser text-to-speech • Click scenes to jump • Adjust volume with controls</p>
        </div>
      </div>
    </div>
  );
}
