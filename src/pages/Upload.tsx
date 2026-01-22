import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Loader2, FileText, Sparkles, Zap, Brain, Type, BookOpen } from 'lucide-react';
import { uploadDocument, processDocument, getDocument } from '../api/client';
import axios from 'axios';

export default function Upload() {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<'pdf' | 'text'>('pdf');
  const [topicInput, setTopicInput] = useState('');
  const navigate = useNavigate();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setProgress(20);
      const uploadResult = await uploadDocument(file);
      
      setUploading(false);
      setProcessing(true);
      setProgress(40);
      
      const doc = await getDocument(uploadResult.id);
      setProgress(60);
      await processDocument(uploadResult.id, doc.text);
      
      setProgress(100);
      setTimeout(() => {
        setProcessing(false);
        navigate(`/document/${uploadResult.id}`);
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload and process document');
      setUploading(false);
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    try {
      setProcessing(true);
      setProgress(20);

      // Create a document from the topic
      const response = await axios.post('http://localhost:3001/api/documents/topic', {
        topic: topicInput.trim()
      });

      setProgress(60);
      const docId = response.data.id;
      const docText = response.data.text;

      // Process the generated content
      await processDocument(docId, docText);
      
      setProgress(100);
      setTimeout(() => {
        setProcessing(false);
        navigate(`/document/${docId}`);
      }, 500);
    } catch (error) {
      console.error('Topic processing error:', error);
      alert('Failed to process topic');
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-fadeInUp">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 mb-6 border border-white/20 animate-scaleIn">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="text-white font-medium">Powered by AI</span>
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          Transform Your Documents
        </h1>
        <p className="text-2xl text-white/80 mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          Upload a PDF and let AI generate mind maps, flashcards, quizzes, and more
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          {[
            { icon: Brain, label: 'Mind Maps', color: 'from-blue-500 to-purple-600' },
            { icon: FileText, label: 'Flashcards', color: 'from-green-500 to-teal-600' },
            { icon: Zap, label: 'Quizzes', color: 'from-yellow-500 to-orange-600' },
            { icon: Sparkles, label: 'AI Chat', color: 'from-pink-500 to-rose-600' },
          ].map((feature, index) => (
            <div
              key={feature.label}
              className="glass-dark rounded-2xl p-6 hover-lift"
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              <div className={`inline-flex p-3 bg-gradient-to-br ${feature.color} rounded-xl mb-3`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-medium">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-8 animate-scaleIn" style={{ animationDelay: '0.5s' }}>
        <div className="inline-flex bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
          <button
            onClick={() => setMode('pdf')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
              mode === 'pdf'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Upload PDF</span>
            </div>
          </button>
          <button
            onClick={() => setMode('text')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
              mode === 'text'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Type className="w-5 h-5" />
              <span>Enter Topic</span>
            </div>
          </button>
        </div>
      </div>

      {/* Upload/Input Area */}
      <div className="glass-dark rounded-3xl p-8 shadow-2xl border border-white/20 animate-scaleIn" style={{ animationDelay: '0.6s' }}>
        {mode === 'pdf' ? (
          <label className={`
            flex flex-col items-center justify-center w-full h-80
            border-2 border-dashed rounded-2xl cursor-pointer
            transition-all duration-300
            ${uploading || processing 
              ? 'border-white/30 bg-white/5' 
              : 'border-white/30 hover:border-white/60 hover:bg-white/10'
            }
          `}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading || processing ? (
              <div className="text-center space-y-6">
                <div className="relative">
                  <Loader2 className="w-20 h-20 text-white animate-spin" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-50 animate-pulse" />
                </div>
                
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-white">
                    {uploading ? 'Uploading Document...' : 'AI Processing...'}
                  </p>
                  <p className="text-white/70">
                    {processing && 'Generating mind map, flashcards, quiz, and more...'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-80 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white/60 text-sm">{progress}% Complete</p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <UploadIcon className="w-20 h-20 text-white/60" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-30" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white mb-2">
                    Drop your PDF here
                  </p>
                  <p className="text-white/60">
                    or click to browse
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2 text-white/40 text-sm">
                  <FileText className="w-4 h-4" />
                  <span>PDF files only • Max 50MB</span>
                </div>
              </div>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={uploading || processing}
          />
        </label>
        ) : (
          <form onSubmit={handleTopicSubmit} className="space-y-6">
            {processing ? (
              <div className="flex flex-col items-center justify-center h-80 space-y-6">
                <div className="relative">
                  <Loader2 className="w-20 h-20 text-white animate-spin" />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-full blur-2xl opacity-50 animate-pulse" />
                </div>
                
                <div className="space-y-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    AI Generating Content...
                  </p>
                  <p className="text-white/70">
                    Creating comprehensive learning materials about "{topicInput}"
                  </p>
                </div>

                <div className="w-80 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-teal-600 transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white/60 text-sm">{progress}% Complete</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-4 mb-8">
                  <div className="relative inline-block">
                    <BookOpen className="w-20 h-20 text-white/60" />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-full blur-2xl opacity-30" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white mb-2">
                      Enter Any Topic
                    </p>
                    <p className="text-white/60">
                      AI will create mind maps, flashcards, quizzes, and more
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="e.g., Photosynthesis, Machine Learning, World War II..."
                    className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-green-500 transition-all duration-300 text-lg"
                    disabled={processing}
                  />
                  
                  <button
                    type="submit"
                    disabled={!topicInput.trim() || processing}
                    className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none text-lg"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Sparkles className="w-6 h-6" />
                      <span>Generate Learning Materials</span>
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-white/60">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span>Mind Maps</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Flashcards</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Quizzes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Chat</span>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-12 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
        {[
          { title: 'Fast Processing', desc: '2-3 minutes average', icon: Zap },
          { title: 'Local AI', desc: '100% private & secure', icon: Brain },
          { title: 'Smart Analysis', desc: 'Powered by Qwen 2.5', icon: Sparkles },
        ].map((item) => (
          <div key={item.title} className="glass-dark rounded-2xl p-6 border border-white/10">
            <item.icon className="w-8 h-8 text-white/80 mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-white/60">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
