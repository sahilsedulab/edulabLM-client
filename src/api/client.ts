import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/documents/upload', formData);
  return response.data;
};

export const processDocument = async (documentId: string, text: string) => {
  const response = await api.post('/ai/process', { documentId, text });
  return response.data;
};

export const getDocument = async (id: string) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

export const getGeneratedContent = async (documentId: string) => {
  const response = await api.get(`/ai/content/${documentId}`);
  return response.data;
};

export const chatWithDocument = async (
  documentId: string,
  question: string,
  history: any[]
) => {
  const response = await api.post('/ai/chat', { documentId, question, history });
  return response.data;
};
