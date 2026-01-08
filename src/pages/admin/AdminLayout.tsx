import { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  Tags, 
  LogOut, 
  Menu, 
  Settings,
  User,
  X
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Building2, label: 'Properties', path: '/admin/properties' },
  { icon: MapPin, label: 'Locations', path: '/admin/locations' },
  { icon: Tags, label: 'Property Types', path: '/admin/types' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState('Sreekanth');

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.isLoggedIn && parsed.token) {
        setIsAuthenticated(true);
        if (parsed.username) {
          setAdminName(parsed.username);
        }
      } else {
        navigate('/admin');
      }
    } else {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/admin');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Overlay - Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-[#2c3e50] to-[#1a252f]
        transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo & Brand */}
          <div className="p-4 border-b border-white/10">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-red-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">HA</span>
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">HousesAdda</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm truncate">{adminName}</h3>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Menu Button Only */}
        <div className="lg:hidden sticky top-0 z-30 bg-white shadow-sm px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
