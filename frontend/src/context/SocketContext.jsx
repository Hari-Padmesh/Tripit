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

    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token: accessToken }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    // Friend status updates
    newSocket.on('friend:status_change', ({ friendId, isOnline, lastSeen }) => {
      setOnlineFriends(prev => ({ ...prev, [friendId]: { isOnline, lastSeen } }));
    });

    // Friend request notifications
    newSocket.on('friend:request_received', (data) => {
      setNotifications(prev => [...prev, { type: 'friend_request', ...data, id: Date.now() }]);
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

    // Location updates
    newSocket.on('location:friend_update', (location) => {
      setFriendLocations(prev => ({ ...prev, [location.userId]: location }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, accessToken]);

  // Socket methods
  const sendMessage = useCallback((friendId, content) => {
    if (socket) {
      socket.emit('chat:send', { to: friendId, content });
    }
  }, [socket]);

  const markAsTyping = useCallback((friendId, isTyping) => {
    if (socket) {
      socket.emit('chat:typing', { to: friendId, isTyping });
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
