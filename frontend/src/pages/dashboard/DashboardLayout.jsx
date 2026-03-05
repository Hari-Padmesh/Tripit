import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Languages, 
  Settings, 
  LogOut, 
  Plane,
  User,
  Search,
  ChevronDown,
  Compass,
  Users
} from "lucide-react";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = async () => {
    await logout();
    navigate("/auth/signin");
  };

  const navItems = [
    { to: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
    { to: "/dashboard/trip/new", label: "New Trip", icon: PlusCircle },
    { to: "/dashboard/trips/history", label: "Trip History", icon: History },
    { to: "/dashboard/social", label: "Social", icon: Users },
    { to: "/dashboard/tools/translate", label: "Translate", icon: Languages },
    { to: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      {/* Sidebar - fixed height, does not scroll */}
      <aside className="w-[280px] flex flex-col bg-white border-r border-gray-200 flex-shrink-0 h-screen sticky top-0 shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-900">
              <Compass className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-semibold">Beyondly</span>
            </div>
            <p className="text-xs text-gray-500">Travel Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
            Menu
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Profile & Actions */}
        <div className="p-4 border-t border-gray-200">
          {/* User Card */}
          {user && (
            <div className="bg-gray-100 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || "Traveler"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips, places..."
                className="w-64 h-10 pl-10 pr-4 rounded-xl bg-gray-100 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {(user.name || user.email)?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {(user.name || user.email)?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name || "Traveler"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/dashboard/settings");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                    </div>
                    
                    {/* Sign Out */}
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

