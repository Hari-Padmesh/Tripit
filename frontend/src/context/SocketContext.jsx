import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { accessToken, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineFriends, setOnlineFriends] = useState({});
  const [friendLocations, setFriendLocations] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user || !accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    console.log('Initializing socket connection...');
    const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    console.log('Socket URL:', socketUrl);

    const newSocket = io(socketUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected with ID:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Socket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Friend status updates
    newSocket.on('friend:status_change', ({ friendId, isOnline, lastSeen }) => {
      setOnlineFriends(prev => ({ ...prev, [friendId]: { isOnline, lastSeen } }));
    });

    // Friend request notifications (real-time)
    newSocket.on('friend:request', (data) => {
      setNotifications(prev => [...prev, { type: 'friend_request', ...data, id: Date.now() }]);
      // Trigger a custom event so useFriends can refetch
      window.dispatchEvent(new CustomEvent('friend:request:received', { detail: data }));
    });

    newSocket.on('friend:request_accepted', (data) => {
      setNotifications(prev => [...prev, { type: 'friend_accepted', ...data, id: Date.now() }]);
    });

    // Chat events
    newSocket.on('chat:receive', (message) => {
      setUnreadMessages(prev => ({
        ...prev,
        [message.sender]: (prev[message.sender] || 0) + 1
      }));
      setNotifications(prev => [...prev, { type: 'message', ...message, id: Date.now() }]);
    });

    newSocket.on('chat:typing', ({ userId, isTyping }) => {
      setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
    });

    newSocket.on('chat:read', ({ friendId }) => {
      // Message was read by friend
    });

    // Location updates (individual)
    newSocket.on('location:friend_update', (data) => {
      setFriendLocations(prev => ({ 
        ...prev, 
        [data.userId]: {
          city: data.location?.city || data.city,
          country: data.location?.country || data.country,
          coordinates: data.location?.coordinates || data.coordinates,
          lastUpdated: data.updatedAt || new Date().toISOString()
        }
      }));
    });

    // Bulk location data when requested
    newSocket.on('location:friends', (locations) => {
      const locationsMap = {};
      locations.forEach(loc => {
        locationsMap[loc.userId] = {
          city: loc.location?.city || '',
          country: loc.location?.country || '',
          coordinates: loc.location?.coordinates || { lat: 0, lng: 0 },
          lastUpdated: loc.location?.updatedAt || new Date().toISOString()
        };
      });
      setFriendLocations(locationsMap);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, accessToken]);

  // Socket methods
  const sendMessage = useCallback((friendId, content) => {
    if (socket) {
      socket.emit('chat:send', { friendId, content });
    }
  }, [socket]);

  const markAsTyping = useCallback((friendId, isTyping) => {
    if (socket) {
      socket.emit('chat:typing', { friendId, isTyping });
    }
  }, [socket]);

  const markAsRead = useCallback((friendId) => {
    if (socket) {
      socket.emit('chat:read', { friendId });
      setUnreadMessages(prev => ({ ...prev, [friendId]: 0 }));
    }
  }, [socket]);

  const updateLocation = useCallback((locationData) => {
    if (socket) {
      socket.emit('location:update', locationData);
    }
  }, [socket]);

  const requestFriendLocations = useCallback(() => {
    if (socket) {
      socket.emit('location:request_friends');
    }
  }, [socket]);

  const dismissNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearUnread = useCallback((friendId) => {
    setUnreadMessages(prev => ({ ...prev, [friendId]: 0 }));
  }, []);

  const value = {
    socket,
    isConnected,
    onlineFriends,
    friendLocations,
    unreadMessages,
    typingUsers,
    notifications,
    sendMessage,
    markAsTyping,
    markAsRead,
    updateLocation,
    requestFriendLocations,
    dismissNotification,
    clearUnread
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
