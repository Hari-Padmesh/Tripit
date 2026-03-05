import { useAuth } from "../../context/AuthContext.jsx";
import { User, Mail } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-500">Your personal information</p>
        </div>
        
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {(user?.name || user?.email)?.[0]?.toUpperCase()}
              </span>
            </div>
            
            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    Name
                  </label>
                  <div className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-900">
                    {user?.name || "Not set"}
                  </div>
                </div>
                
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email
                  </label>
                  <div className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-900">
                    {user?.email || "Not set"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

