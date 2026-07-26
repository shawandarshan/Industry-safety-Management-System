import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Camera, AlertTriangle, Settings, Users, FileText } from 'lucide-react';


export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Live Camera', path: '/camera', icon: Camera },
    { name: 'Violations', path: '/violations', icon: AlertTriangle },
    { name: 'Workers', path: '/workers', icon: Users },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-[260px] bg-slate-900 border-r border-white/5 h-full flex flex-col text-slate-100">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-xl font-bold flex items-center">
          <AlertTriangle className="mr-2 text-red-500" /> SafetyHub
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-500 font-semibold shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
