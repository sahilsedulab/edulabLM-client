import { useState } from 'react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { chatWithDocument } from '../api/client';
import { ChatMessage } from '../types';

interface Props {
  documentId: string;
}

export default function Chat({ documentId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithDocument(documentId, input, history);

      const assistantMessage: ChatMessage = { role: 'assistant', content: response.answer };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto p-4 space-y-4 m-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
            <MessageSquare className="w-16 h-16 text-gray-300" />
            <div className="text-center">
              <p className="text-lg font-medium">Ask me anything about this document</p>
              <p className="text-sm mt-2">I can help you understand, summarize, or answer questions</p>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-4 max-w-md">
              <button
                onClick={() => setInput("What is this document about?")}
                className="text-left px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
              >
                💡 What is this document about?
              </button>
              <button
                onClick={() => setInput("Summarize the key points")}
                className="text-left px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
              >
                📝 Summarize the key points
              </button>
              <button
                onClick={() => setInput("What are the main topics covered?")}
                className="text-left px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
              >
                📚 What are the main topics covered?
              </button>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
                  }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-2 p-4 border-t bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask a question about the document..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
