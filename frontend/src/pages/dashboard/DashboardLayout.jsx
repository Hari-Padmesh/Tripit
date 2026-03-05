              <h1 className="text-lg font-bold text-white">Beyondly</h1>
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Languages, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  Plane,
  User,
  Bell,
  Search,
  ChevronDown,
  Compass,
  Users
} from "lucide-react";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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
    <div className="min-h-screen w-full flex bg-[#0f172a]">
      {/* Sidebar - fixed height, does not scroll */}
      <aside className="w-[280px] flex flex-col bg-[#1e293b] border-r border-slate-700/50 flex-shrink-0 h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white">
              <Compass className="w-8 h-8" />
              <span className="text-xl font-semibold">Beyondly</span>
            </div>
            <p className="text-xs text-slate-400">Travel Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
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
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
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
        <div className="p-4 border-t border-slate-700/50">
          {/* User Card */}
          {user && (
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name || "Traveler"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all mb-2"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#1e293b]/80 backdrop-blur-sm border-b border-slate-700/50 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search trips, places..."
                className="w-64 h-10 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-slate-700/50 transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            {user && (
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-700/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {(user.name || user.email)?.[0]?.toUpperCase()}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#0f172a]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

