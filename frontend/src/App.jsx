import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LiveCamera from './pages/LiveCamera';
import Violations from './pages/Violations';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/camera" element={<LiveCamera />} />
              <Route path="/violations" element={<Violations />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
