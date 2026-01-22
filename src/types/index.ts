export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface GeneratedContent {
  documentId: string;
  mindMap: MindMapNode;
  audioOverview: string;
  videoOverview: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
