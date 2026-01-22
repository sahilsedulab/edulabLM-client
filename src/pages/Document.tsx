import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getGeneratedContent } from '../api/client';
import { GeneratedContent } from '../types';
import MindMap from '../components/MindMap';
import AudioOverview from '../components/AudioOverview';
import VideoOverview from '../components/VideoOverview';
import Flashcards from '../components/Flashcards';
import Quiz from '../components/Quiz';
import Chat from '../components/Chat';
import { Loader2, MessageSquare, X, Brain, Volume2, Video, CreditCard, CheckSquare, Sparkles } from 'lucide-react';

export default function Document() {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mindmap');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (id) {
      loadContent();
    }
  }, [id]);

  const loadContent = async () => {
    try {
      const data = await getGeneratedContent(id!);
      setContent(data);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="relative">
          <Loader2 className="w-20 h-20 text-white animate-spin" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-50 animate-pulse" />
        </div>
        <p className="text-white text-xl mt-6 animate-pulse">Loading your content...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-2xl text-white font-bold mb-2">Content not found</p>
          <p className="text-white/60">Please try uploading your document again</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'mindmap', label: 'Mind Map', icon: Brain, gradient: 'from-blue-500 to-purple-600' },
    { id: 'audio', label: 'Audio', icon: Volume2, gradient: 'from-green-500 to-teal-600' },
    { id: 'video', label: 'Video', icon: Video, gradient: 'from-yellow-500 to-orange-600' },
    { id: 'flashcards', label: 'Flashcards', icon: CreditCard, gradient: 'from-pink-500 to-rose-600' },
    { id: 'quiz', label: 'Quiz', icon: CheckSquare, gradient: 'from-indigo-500 to-blue-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeInUp">
      {/* Main Content Card */}
      <div className="glass-dark rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-white/10">
          <nav className="flex items-center justify-between px-6">
            <div className="flex space-x-2 overflow-x-auto">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-6 font-medium
                    border-b-2 transition-all duration-300
                    animate-fadeInLeft
                    ${activeTab === tab.id
                      ? 'border-white text-white bg-white/10'
                      : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
                    }
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            
            {/* Chat Button */}
            <button
              onClick={() => setShowChat(true)}
              className="
                flex items-center space-x-2 px-6 py-3 my-2
                bg-gradient-to-r from-purple-500 to-pink-600
                text-white rounded-xl font-medium
                hover:scale-105 hover:shadow-2xl
                transition-all duration-300
                animate-scaleIn
              "
            >
              <MessageSquare className="w-5 h-5" />
              <span>Chat</span>
              <Sparkles className="w-4 h-4 animate-pulse" />
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <div className="animate-fadeInUp">
            {activeTab === 'mindmap' && <MindMap data={content.mindMap} />}
            {activeTab === 'audio' && <AudioOverview text={content.audioOverview} />}
            {activeTab === 'video' && <VideoOverview text={content.videoOverview} />}
            {activeTab === 'flashcards' && <Flashcards cards={content.flashcards} />}
            {activeTab === 'quiz' && <Quiz questions={content.quiz} />}
          </div>
        </div>
      </div>

      {/* Full-screen Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeInUp">
          <div className="glass-dark rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col border border-white/20 animate-scaleIn">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Chat</h2>
                  <p className="text-white/60 text-sm">Ask anything about your document</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group"
              >
                <X className="w-6 h-6 text-white/60 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
              </button>
            </div>
            
            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              <Chat documentId={id!} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
