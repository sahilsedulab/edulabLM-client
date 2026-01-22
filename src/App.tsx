import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Upload from './pages/Upload';
import Document from './pages/Document';
import AIProviderToggle from './components/AIProviderToggle';

function App() {
  return (
    <BrowserRouter>
      <AIProviderToggle />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Upload />} />
          <Route path="document/:id" element={<Document />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
