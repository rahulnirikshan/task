import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/tests/DashboardPage';
import CreateTestPage from './features/tests/CreateTestPage';
import AddQuestionsPage from './features/tests/AddQuestionsPage';
import PreviewPublishPage from './features/tests/PreviewPublishPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tests/create" element={<CreateTestPage />} />
            <Route path="/tests/:id/edit" element={<CreateTestPage />} />
            <Route path="/tests/:id/questions" element={<AddQuestionsPage />} />
            <Route path="/tests/:id/preview" element={<PreviewPublishPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
