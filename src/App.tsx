import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SajuFlowProvider } from './context/SajuFlowContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import InputPage from './pages/InputPage';
import ModeSelectPage from './pages/ModeSelectPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <AuthProvider>
      <SajuFlowProvider>
        <BrowserRouter>
          <div className="app-shell">
            <Header />
            <main className="app-main" id="main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/input" element={<InputPage />} />
                <Route path="/modes" element={<ModeSelectPage />} />
                <Route path="/result" element={<ResultPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </SajuFlowProvider>
    </AuthProvider>
  );
}
