import { Outlet, Link } from 'react-router-dom';
import { Brain, Sparkles, Zap } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 -z-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
      </div>

      {/* Glassmorphic navbar */}
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50 animate-slideDown">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">NotebookLM</span>
                <div className="flex items-center space-x-1 text-xs text-white/60">
                  <Zap className="w-3 h-3" />
                  <span>AI Powered</span>
                </div>
              </div>
            </Link>
            
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="text-white text-sm font-medium">Qwen 2.5</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative">
        <Outlet />
      </main>
    </div>
  );
}
