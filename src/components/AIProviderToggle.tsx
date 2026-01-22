import { useState, useEffect } from 'react';
import { Zap, Settings } from 'lucide-react';
import { api } from '../api/client';

export default function AIProviderToggle() {
  const [provider, setProvider] = useState<'gemini' | 'ollama'>('gemini');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProvider();
  }, []);

  const fetchProvider = async () => {
    try {
      const response = await api.get('/settings/provider');
      setProvider(response.data.currentProvider);
    } catch (error) {
      console.error('Failed to fetch provider:', error);
    }
  };

  const switchProvider = async (newProvider: 'gemini' | 'ollama') => {
    setLoading(true);
    try {
      const response = await api.post('/settings/provider', {
        provider: newProvider
      });
      setProvider(response.data.currentProvider);
    } catch (error) {
      console.error('Failed to switch provider:', error);
      alert('Failed to switch AI provider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
        <div className="flex items-center space-x-3 mb-3">
          <Settings className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-sm">AI Provider</span>
        </div>
        
        <div className="flex items-center space-x-2 bg-white/5 rounded-xl p-1">
          {/* Using Qwen 2.5 branding (powered by Gemini under the hood) */}
          <button
            onClick={() => switchProvider('gemini')}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              provider === 'gemini'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Qwen 2.5</span>
            </div>
          </button>
          
          {/* Commented out Ollama option - only showing Qwen 2.5 */}
          {/* <button
            onClick={() => switchProvider('ollama')}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              provider === 'ollama'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Qwen2.5</span>
            </div>
          </button> */}
        </div>
        
        {/* Info section hidden - not showing provider details */}
        {/* {info.provider && (
          <div className="mt-3 text-xs text-white/60 text-center">
            <p>{info.provider}</p>
            <p className="text-white/40">{info.model}</p>
          </div>
        )} */}
      </div>
    </div>
  );
}
