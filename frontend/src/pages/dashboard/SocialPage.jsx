import { useState, useEffect } from 'react';
import { BeyondlyIdCard, AddFriendModal, FriendsList, ChatWindow, FriendsMap } from '../../components/social';
import { useSocket } from '../../context/SocketContext';
import { useProfile } from '../../hooks/useProfile';

const SocialPage = () => {
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const { isConnected, notifications, dismissNotification, updateLocation } = useSocket() || {};
  const { profile, updateProfile } = useProfile();
  const [showNotification, setShowNotification] = useState(null);

  // Request browser geolocation on mount
  useEffect(() => {
    if (profile?.locationVisible && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Reverse geocode to get city/country
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );
            const data = await res.json();
            
            if (data.address) {
              updateLocation?.({
                city: data.address.city || data.address.town || data.address.village || 'Unknown',
                country: data.address.country || 'Unknown',
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                source: 'browser'
              });
            }
          } catch (err) {
            console.error('Failed to reverse geocode:', err);
          }
        },
        (error) => {
          console.log('Geolocation error:', error.message);
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }, [profile?.locationVisible]);

  // Show notifications as toasts
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      setShowNotification(latest);
      
      const timer = setTimeout(() => {
        setShowNotification(null);
        dismissNotification?.(latest.id);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
  };

  const handleCloseChat = () => {
    setSelectedFriend(null);
  };

  const toggleLocationVisibility = async () => {
    await updateProfile({ locationVisible: !profile?.locationVisible });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Social
          </h1>
          <p className="text-gray-500 mt-1">Connect with fellow travelers around the world</p>
        </div>
        
        {/* Connection status */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Top row - ID Card and Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BeyondlyIdCard />
        
        {/* Location visibility toggle */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location Sharing
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Allow friends to see your general location (city level) on the map
          </p>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={profile?.locationVisible || false}
                onChange={toggleLocationVisibility}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />
            </div>
            <span className="font-medium text-gray-700">
              {profile?.locationVisible ? 'Visible to friends' : 'Hidden'}
            </span>
          </label>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Friends List */}
        <div className="lg:col-span-1 h-[600px]">
          <FriendsList 
            onSelectFriend={handleSelectFriend}
            onAddFriend={() => setIsAddFriendOpen(true)}
          />
        </div>

        {/* Chat Window or Map */}
        <div className="lg:col-span-2 h-[600px]">
          {selectedFriend ? (
            <ChatWindow 
              friend={selectedFriend} 
              onClose={handleCloseChat}
            />
          ) : (
            <FriendsMap onSelectFriend={(friendId) => {
              // Find friend by ID and select them
              // This would trigger opening chat
            }} />
          )}
        </div>
      </div>

      {/* Add Friend Modal */}
      <AddFriendModal 
        isOpen={isAddFriendOpen} 
        onClose={() => setIsAddFriendOpen(false)} 
      />

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in">
          <div className="bg-card border border-border rounded-xl shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              {showNotification.type === 'friend_request' && (
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              )}
              {showNotification.type === 'friend_accepted' && (
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {showNotification.type === 'message' && (
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold">
                  {showNotification.type === 'friend_request' && 'New Friend Request'}
                  {showNotification.type === 'friend_accepted' && 'Friend Request Accepted'}
                  {showNotification.type === 'message' && 'New Message'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {showNotification.fromUser?.name || showNotification.content?.substring(0, 50)}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowNotification(null);
                  dismissNotification?.(showNotification.id);
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPage;
