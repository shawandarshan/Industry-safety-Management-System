import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Dashboard from './pages/Dashboard';
import LiveCamera from './pages/LiveCamera';
import Violations from './pages/Violations';
import Workers from './pages/Workers';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <TopNav />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-6">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/camera" element={<LiveCamera />} />
                    <Route path="/violations" element={<Violations />} />
                    <Route path="/workers" element={<Workers />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;
